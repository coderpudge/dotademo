import BaseObj from "../tools/uikiller/BaseObj";
import { GameMgr } from "./gameMgr";



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
    private _warehouse:cc.Node;
    
    start(){
        this.init()
    }
    // func
    init(){
        // this.showBindNodes();
        this._round.getComponent(cc.Label).string = `${GameMgr.round}`;
    }

    onBtn(event,data){
        switch (data) {
            case 'store':
                this._store.active = false;
                break;
        
            default:
                break;
        }
    }
}
