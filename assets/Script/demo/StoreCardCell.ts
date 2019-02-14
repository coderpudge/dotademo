import BaseObj from "../tools/uikiller/BaseObj";
import { Tools } from "../mgr/Tools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StoreCardCell extends BaseObj {
    // properties
    _cardName:cc.Node;
    _cid:cc.Node;
    _star:cc.Node;
    _price:cc.Node;
    _occupation:cc.Node;
    _icon:cc.Node;


    target = null;
    data = null;
    // listView:ListView;
    // listData = null;


    init(data){
        this._cid.getComponent(cc.Label).string = data.heroid;
        this._cardName.getComponent(cc.Label).string = data.name;
        this._star.getComponent(cc.Label).string = '1';
        this._price.getComponent(cc.Label).string = data.price;
        this._occupation.getComponent(cc.Label).string = data.Tanktype;
        Tools.loadSpriteFrameRes(this._icon, data.TankHeadportrait);
        
    }
}
