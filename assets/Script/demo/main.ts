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
    private _formation:cc.Node;
    private _board:cc.Node;
    private _boardCell:cc.Node;

    private _storeCardCell:cc.Node;
    private _formationCardCell:cc.Node;
    private _warehouseCardCell:cc.Node;
    private _spaceNode:cc.Node;




    storeLen = 6;
    warehouseLen = 8;

    cellWidth;
    cellHeight;
    
    onLoad(){
        onfire.on('card_touch_move', this.onCardTouchMove.bind(this));
        onfire.on('card_touch_start', this.onCardTouchStart.bind(this));
        onfire.on('card_touch_end', this.onCardTouchMoveEnd.bind(this));
        onfire.on('card_touch_cancel', this.onCardTouchCancel.bind(this));
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
            node.position= cc.v2(this.cellWidth * (columnNum + 1 - 0.5) - this._board.width/2, - this.cellHeight * (rowNum + 1 - 0.5) + this._board.height/2);
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

    onCardTouchStart(card:Card){
        let w_card_pos = card.node.parent.convertToWorldSpaceAR(card.node.position);
        if (card.node.name.indexOf(this._formationCardCell.name) != -1) {
            card.node.parent = this._spaceNode;
            let pos = this._spaceNode.convertToNodeSpaceAR(w_card_pos);
            card.node.position = pos;
        }
    }

    onCardTouchMoveEnd(card:Card){
        let w_card_pos = card.node.parent.convertToWorldSpaceAR(card.node.position);
        // 阵型区
        if (this._board.getBoundingBoxToWorld().contains(w_card_pos)) {
            for (let i = 0; i  < this._board.childrenCount; i++) {
                let child = this._board.children[i];
                if (child.getBoundingBoxToWorld().contains(w_card_pos)) {
                    let node = this._formation.getChildByName(this._formationCardCell.name + i)
                    if (node) {
                        child.getChildByName('bg').color = cc.Color.RED;
                    }else{
                        child.getChildByName('bg').color = cc.Color.GREEN;
                    }
                    // child.getChildByName('bg').color = cc.Color.RED;
                    cc.log(child.name)
                    // let w_child_pos = this._board.convertToWorldSpaceAR(child.position);
                    // card.node.position = child.parent.convertToNodeSpaceAR(w_child_pos);
                    if(card.node.name == this._warehouseCardCell.name){
                        let cardData = card.node.getComponent(WarehouseCardCell).data;
                        this.delCardFromWarehouse(cardData.idx);
                        this.addCardToFormation(i, cardData)
                    }else if(card.node.name.indexOf(this._formationCardCell.name) != -1){
                        this.resetFormationCardPos(card.node, i)
                    }
                }
            }
        }else if (this._warehouse.getBoundingBoxToWorld().contains(w_card_pos)) {
            // 仓库区
            
            for (let i = 0; i < this._warehouse.childrenCount; i++) {
                let child = this._warehouse.children[i];
                if (child.getBoundingBoxToWorld().contains(w_card_pos)) {
                    // child.getChildByName('bg').color = cc.Color.RED;
                    // cc.log(child.name)
                    // let w_child_pos = this._board.convertToWorldSpaceAR(child.position);
                    // card.node.position = child.parent.convertToNodeSpaceAR(w_child_pos);
                    if(card.node.name == this._warehouseCardCell.name){
                        this.resetWarehouseCardPos(card.node, i)
                    }else if (card.node.name.indexOf(this._formationCardCell.name) != -1) {
                        let cardData = card.node.getComponent(FormationCardCell).data;
                        this.delCardFromSpace(cardData.idx);
                        this.addCardToWarehouse(i, cardData);
                    }
                }
            }       
            
        }else{
            // 其它区域
            this.restoreFormationCardPos(card.node);
            this.restoreWarehouseCardPos(card.node);
        }
    }
    onCardTouchCancel(card:Card){
        for (let i = 0; i  < this._board.childrenCount; i++) {
            let child = this._board.children[i];
            child.getChildByName('bg').color = cc.Color.RED;
        }
    }

    onCardTouchMove(card:Card){
        let w_card_pos = card.node.parent.convertToWorldSpaceAR(card.node.position);

        if (this._board.getBoundingBoxToWorld().contains(w_card_pos)) {
            for (let i = 0; i  < this._board.childrenCount; i++) {
                let child = this._board.children[i];
                if (child.getBoundingBoxToWorld().contains(w_card_pos)) {
                    child.getChildByName('bg').color = cc.Color.BLUE;
                    let node = this._formation.getChildByName(this._formationCardCell.name + i)
                    if (node) {
                        child.getChildByName('bg').color = cc.Color.RED;
                    }else{
                        child.getChildByName('bg').color = cc.Color.BLUE;
                    }
                }
                // else{
                //     let node = this._formation.getChildByName(this._formationCardCell.name + i)
                //     if (node) {
                //         child.getChildByName('bg').color = cc.Color.RED;
                //     }else{
                //         child.getChildByName('bg').color = cc.Color.GREEN;
                //     }
                    
                // }
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

    moveCardToWarehouse(){

    }

    addCardToWarehouse(idx,table){
        // let table = TableMgr.getBaseInfo('h_hero', id);
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
    /**
     * 添加阵型卡牌
     * @param idx 
     * @param id 
     */
    addCardToFormation(idx,table){
        let cardName = this._formationCardCell.name+idx;
        // let table = TableMgr.getBaseInfo('h_hero', id);
        let node = cc.instantiate(this._formationCardCell)
        let mapNode = this._board.getChildByName('boardCell_'+idx);
        let cardNode = this._formation.getChildByName(cardName);
        if (!cardNode) {
            cardNode = node;
            node.name = cardName;
            node.zIndex = this.getCardFormationZIndex(idx)
            cardNode.position = cc.v2(mapNode.position.x, mapNode.position.y + node.height/2)
            cardNode.parent = this._formation;
        }
        
        let com = cardNode.getComponent(FormationCardCell);
        table.price = Math.random() * 5;
        table.idx = idx;
        com.init(table)
    }

    getCardFormationZIndex(idx){
        let rowNum = idx % GameMgr.f_row;
        // let columnNum = Math.floor(idx / GameMgr.f_row);
        return rowNum;
    }

    /**
     * 重新设置 阵型卡牌位置
     * @param node 
     * @param idx 
     */
    resetFormationCardPos(node:cc.Node,idx){
        let cardName = this._formationCardCell.name+idx;
        let mapNode = this._board.getChildByName('boardCell_'+idx);
        let cardNode = this._formation.getChildByName(cardName);
        let com = node.getComponent(FormationCardCell);
        if (!cardNode) {
            node.position = cc.v2(mapNode.position.x, mapNode.position.y + node.height/2);
            node.name = cardName;
            node.zIndex = this.getCardFormationZIndex(idx)
            com.data.idx = idx;
            node.parent = this._formation
        }else{
            cc.log('位置不可用')
            this.restoreFormationCardPos(node);
        }
    }
    /**
     * 重新设置 仓库卡牌位置
     * @param node 
     * @param idx 
     */
    resetWarehouseCardPos(node:cc.Node,idx){
        let cardNode = this._warehouse.children[idx].getChildByName(this._warehouseCardCell.name);
        if (!cardNode) {
            cardNode = node;
            cardNode.position = cc.v2()
            cardNode.parent = this._warehouse.children[idx];
            cardNode.name = this._warehouseCardCell.name;
            let com = cardNode.getComponent(WarehouseCardCell);
            com.data.idx = idx;
        }else{
            cc.log('位置不可用')
            this.restoreWarehouseCardPos(node)
        }
    }
    /**
     * 恢复超出控制区外的 阵型卡牌 位置
     * @param node 
     */
    restoreFormationCardPos(node){
        let com = node.getComponent(FormationCardCell);
        if (com) {
            let mapNode = this._board.getChildByName('boardCell_'+com.data.idx);
            node.position = cc.v2(mapNode.position.x, mapNode.position.y + node.height/2);
            node.parent = this._formation;
            node.zIndex = this.getCardFormationZIndex(com.data.idx)
        }
    }
    /**
     * 恢复超出控制区外的 仓库卡牌 位置
     * @param node 
     */
    restoreWarehouseCardPos(node){
        let com = node.getComponent(WarehouseCardCell);
        if (com) {
            node.position = cc.v2();
        }
    }

    /**
     * 移除阵型卡牌
     * @param idx 
     */
    delCardFromFormation(idx){
        let cardNode = this._formation.getChildByName(this._formationCardCell.name+idx);
        if (cardNode) {
            cardNode.destroy();
        }
    }
    delCardFromSpace(idx){
        let cardNode = this._spaceNode.getChildByName(this._formationCardCell.name+idx);
        if (cardNode) {
            cardNode.destroy();
        }
    }

    /**
     * 生成 刷新商店卡牌
     * @param idx 
     * @param id 
     */
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
        table.price = Math.floor(Math.random() * 5);
        table.idx = idx;
        com.init(table)
    }
    /**
     * 移除商店卡牌
     * @param idx 
     */
    delCardFromStore(idx){
        let cardNode = this._storeCard.children[idx].getChildByName(this._storeCardCell.name);
        if (cardNode) {
            cardNode.destroy();
        }
    }

    refreshStore(){
        if (!this._store.active) {
            this._store.active = true;
            return;
        }
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
                this.addCardToWarehouse(i, data)
                return;
            }
        }
        cc.log('仓库已满')
    }

    /**
     * 检查是否可以合成
     */
    checkFormationCardComposite(){

    }

}
