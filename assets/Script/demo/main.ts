import BaseObj from "../tools/uikiller/BaseObj";
import { GameMgr } from "./gameMgr";
import { onfire } from "../tools/onfire/onfire";
import Card from "./Card";
import { TableMgr } from "../mgr/TableMgr";
import { Tools } from "../mgr/Tools";
import StoreCardCell from "./StoreCardCell";




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



    cellWidth;
    cellHeight;
    
    onLoad(){
        onfire.on('warehouse_card_touch_move', this.onCardMove.bind(this));
        onfire.on('warehouse_card_touch_end', this.onCardMoveEnd.bind(this));
        onfire.on('warehouse_card_touch_cancel', this.onCardMoveCancel.bind(this));
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
            node.name = `cell_${i}`;
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
            case 'refreshStore'
                
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
                    let w_child_pos = this._board.convertToWorldSpaceAR(child.position);
                    card.node.position = child.parent.convertToNodeSpaceAR(w_child_pos);
                }
            }
        }else if (this._warehouse.getBoundingBoxToWorld().contains(w_card_pos)) {
            
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

    addCardToWarehouse(id){
        
    }
    delCardToWarehouse(){

    }
    addCardToFormation(id){

    }
    delCardToFormation(){

    }
    addCardToStore(idx,id){
        let name = '_storeCardCell'
        let table = TableMgr.getBaseInfo('h_hero', id);
        let node = cc.instantiate(this._storeCardCell)
        let cardNode = this._storeCard.children[idx].getChildByName(name);
        if (!cardNode) {
            cardNode = node;
            cardNode.parent = this._storeCard.children[idx];
        }
        
        let com = cardNode.getComponent(StoreCardCell);
        table.price = Math.random() * 5;
        com.init(table)
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

}
