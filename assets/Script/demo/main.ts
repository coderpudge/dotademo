import BaseObj from "../tools/uikiller/BaseObj";
import { GameMgr } from "./gameMgr";
import { onfire } from "../tools/onfire/onfire";
import Card from "./Card";
import { TableMgr } from "../mgr/TableMgr";
import { Tools } from "../mgr/Tools";
import StoreCardCell from "./StoreCardCell";
import WarehouseCardCell from "./WarehouseCardCell";
import FormationCardCell from "./FormationCardCell";




const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends BaseObj {
    // properties
    private _topInfo:cc.Node;
    private _round:cc.Node;
    private _hp:cc.Node;
    private _gold:cc.Node;
    private _pop:cc.Node;
    private _lvl:cc.Node;
    private _cd:cc.Node;
    private _store:cc.Node;
    private _storeCard:cc.Node;
    private _warehouse:cc.Node;
    private _board:cc.Node;
    private _boardCell:cc.Node;

    private _storeCardCell:cc.Node;
    private _formationCardCell:cc.Node;
    private _warehouseCardCell:cc.Node;



    storeLen = 6;
    warehouseLen = 8;

    cellWidth;
    cellHeight;
    
    onLoad(){
        onfire.on('warehouse_card_touch_move', this.onCardMove.bind(this));
        onfire.on('warehouse_card_touch_end', this.onCardMoveEnd.bind(this));
        onfire.on('warehouse_card_touch_cancel', this.onCardMoveCancel.bind(this));
        onfire.on('store_card_buy', this.onStoreCardBuy.bind(this));

    }
    start(){
        this.init()
        this.initBoard();
        this.refreshStore();
    }
    // func
    init(){
        // this.showBindNodes();
        this._round.getComponent(cc.Label).string = `${GameMgr.round}`;
    }

    initBoard(){
        this._board.removeAllChildren();
        this.cellWidth = Math.floor(this._board.width / GameMgr.f_column);
        this.cellHeight = Math.floor(this._board.height / GameMgr.f_row);
        for (let i = 0; i < GameMgr.f_column * GameMgr.f_row; i++) {
            let node = cc.instantiate(this._boardCell)
            node.name = `boardCell_${i}`;
            node.width = this.cellWidth;
            node.height = this.cellHeight;
            node.getChildByName('bg').width = this.cellWidth - 5;
            node.getChildByName('bg').height = this.cellHeight - 5;
            node.parent = this._board;
            let rowNum = i % GameMgr.f_row;
            let columnNum = Math.floor(i / GameMgr.f_row);
            node.position= cc.v2(this.cellWidth * (columnNum + 1 - 0.5) - this._board.width/2, this.cellHeight * (rowNum + 1 - 0.5) - this._board.height/2);
        }
    }

    onBtn(event,data){
        switch (data) {
            case 'store':
                this._store.active = false;
                break;
            case 'refresh':
                this.refreshStore();
                break;
            case 'buyCard':

                break;
            default:
                break;
        }
    }

    onCardMoveEnd(card:Card){
        let w_card_pos = card.node.parent.convertToWorldSpaceAR(card.node.position);
        if (this._board.getBoundingBoxToWorld().contains(w_card_pos)) {
            for (let i = 0; i  < this._board.childrenCount; i++) {
                let child = this._board.children[i];
                if (child.getBoundingBoxToWorld().contains(w_card_pos)) {
                    child.getChildByName('bg').color = cc.Color.RED;
                    cc.log(child.name)
                    // let w_child_pos = this._board.convertToWorldSpaceAR(child.position);
                    // card.node.position = child.parent.convertToNodeSpaceAR(w_child_pos);
                    if(card.node.name == this._warehouseCardCell.name){
                        let cardData = card.node.getComponent(WarehouseCardCell).data;
                        this.delCardFromWarehouse(cardData.idx);
                        this.addCardToFormation(i, cardData.heroid)
                    }
                }
            }
        }else if (this._warehouse.getBoundingBoxToWorld().contains(w_card_pos)) {
            if(card.name == this._warehouseCardCell.name){
                for (let i = 0; i < this._warehouse.childrenCount; i++) {
                    let child = this._warehouse.children[i];
                    if (child.getBoundingBoxToWorld().contains(w_card_pos)) {
                        // child.getChildByName('bg').color = cc.Color.RED;
                        // cc.log(child.name)
                        // let w_child_pos = this._board.convertToWorldSpaceAR(child.position);
                        // card.node.position = child.parent.convertToNodeSpaceAR(w_child_pos);
                        if(card.node.name == this._formationCardCell.name){
                            let cardData = card.node.getComponent(WarehouseCardCell).data;
                            this.delCardFromWarehouse(cardData.idx);
                            this.addCardToFormation(i, cardData.heroid)
                        }
                    }
                }       
            }
        }
    }
    onCardMoveCancel(card:Card){
        for (let i = 0; i  < this._board.childrenCount; i++) {
            let child = this._board.children[i];
            child.getChildByName('bg').color = cc.Color.RED;
        }
    }

    onCardMove(card:Card){
        let w_card_pos = card.node.parent.convertToWorldSpaceAR(card.node.position);

        if (this._board.getBoundingBoxToWorld().contains(w_card_pos)) {
            for (let i = 0; i  < this._board.childrenCount; i++) {
                let child = this._board.children[i];
                if (child.getBoundingBoxToWorld().contains(w_card_pos)) {
                    child.getChildByName('bg').color = cc.Color.BLUE;
                    cc.log(child.name)
                }else{
                    child.getChildByName('bg').color = cc.Color.RED;
                }
            }
        }else{
            for (let i = 0; i  < this._board.childrenCount; i++) {
                let child = this._board.children[i];
                child.getChildByName('bg').color = cc.Color.RED;
                // if (child.getChildByName('bg').color == cc.Color.BLUE) {
                // }
            }
        }
    }

    cardBringOutWarehouse(){

    }
    cardBringInWarehouse(){

    }
    cardBringOutFormation(){

    }
    cardBringInFormation(){

    }

    buyCard(){

    }

    addCardToWarehouse(idx,id){
        let table = TableMgr.getBaseInfo('h_hero', id);
        let node = cc.instantiate(this._warehouseCardCell)
        let cardNode = this._warehouse.children[idx].getChildByName(this._warehouseCardCell.name);
        if (!cardNode) {
            cardNode = node;
            cardNode.position = cc.v2()
            cardNode.parent = this._warehouse.children[idx];
        }
        
        let com = cardNode.getComponent(WarehouseCardCell);
        table.price = Math.random() * 5;
        table.idx = idx;
        com.init(table)
    }
    delCardFromWarehouse(idx){
        let cardNode = this._warehouse.children[idx].getChildByName(this._warehouseCardCell.name);
        if (cardNode) {
            cardNode.destroy();
        }
    }
    addCardToFormation(idx,id){
        let table = TableMgr.getBaseInfo('h_hero', id);
        let node = cc.instantiate(this._formationCardCell)
        let parentNode = this._board.getChildByName('boardCell_'+idx);
        let cardNode = parentNode.getChildByName(this._formationCardCell.name);
        if (!cardNode) {
            cardNode = node;
            cardNode.position = cc.v2(0,node.height/2);
            cardNode.parent = parentNode;
        }
        
        let com = cardNode.getComponent(FormationCardCell);
        table.price = Math.random() * 5;
        table.idx = idx;
        com.init(table)
    }
    delCardFromFormation(idx){
        let cardNode = this._board.getChildByName('boardCell_'+idx).getChildByName(this._formationCardCell.name);
        if (cardNode) {
            cardNode.destroy();
        }
    }
    addCardToStore(idx,id){
        let table = TableMgr.getBaseInfo('h_hero', id);
        let node = cc.instantiate(this._storeCardCell)
        let cardNode = this._storeCard.children[idx].getChildByName(this._storeCardCell.name);
        if (!cardNode) {
            cardNode = node;
            cardNode.position = cc.v2()
            cardNode.parent = this._storeCard.children[idx];
        }
        
        let com = cardNode.getComponent(StoreCardCell);
        table.price = Math.random() * 5;
        table.idx = idx;
        com.init(table)
    }
    delCardFromStore(idx){
        let cardNode = this._storeCard.children[idx].getChildByName(this._storeCardCell.name);
        if (cardNode) {
            cardNode.destroy();
        }
    }

    refreshStore(){
        let data = TableMgr.getTable('h_hero');
        let keys = [];
        for (const key in data.tableData) {
            if (data.tableData.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        for (let i = 0; i < 6; i++) {
            let idx = Tools.random(0, keys.length - 1);
            this.addCardToStore(i,keys[idx]);
        }
        // this.addCardToStore(0,keys[0]);
    }

    onStoreCardBuy(data){
        
        for (let i = 0; i < this.warehouseLen; i++) {
            let cardNode = this._warehouse.children[i].getChildByName(this._warehouseCardCell.name);
            if (!cardNode) {
                this.delCardFromStore(data.idx);
                this.addCardToWarehouse(i, data.heroid)
                return;
            }
        }
        cc.log('仓库已满')
    }

    checkCardComposite(){

    }

}
