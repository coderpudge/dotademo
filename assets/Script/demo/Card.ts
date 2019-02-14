
import BaseObj from "../tools/uikiller/BaseObj";
import { onfire } from "../tools/onfire/onfire";



const {ccclass, property} = cc._decorator;

@ccclass
export default class Card extends cc.Component {
    // properties
    id;
    star;


    onLoad(){
        this.reg();
    }

    init(){
        
    }
    
    reg(){
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event,touch) {
                
            event.stopPropagation();
            var delta = event.touch.getDelta();
            let toPos = cc.v2(this.node.x + delta.x, this.node.y + delta.y);
            this.node.position = toPos;
        
            if (delta.mag() > 7) {
                var cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                cancelEvent.touch = event.touch;
                // cancelEvent.simulate = true;
                event.target.dispatchEvent(cancelEvent);
            }
            onfire.fire('warehouse_card_touch_move',this);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event,touch) {
            onfire.fire('warehouse_card_touch_end',this);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event,touch) {
            onfire.fire('warehouse_card_touch_cancel',this);
        }, this);
    }
    
}
