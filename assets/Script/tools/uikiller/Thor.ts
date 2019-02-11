const { ccclass, executeInEditMode } = cc._decorator;
import * as uikiller from './uikiller.js'
@ccclass
// @executeInEditMode
export default class Thor extends cc.Component {
    
    protected useController: Boolean = false;
    protected controllerName: String = '';
    protected _isThorClass = true;
    _bindHammer: Boolean = false;
    $controller: Object = null;

    __preload() {
        this.bindHammer();
    }

    getOptions() {
        return {
            debug: false
        }
    }

    /**
     * 获取预制中的绑定节点名称;
     * @param child 
     * @param prefix 
     */
    getbindNodes(){
        let _prefixList = {};
        bindNode(this.node);
        function bindNode(nodeObject){
            const node = nodeObject;
            node.children.forEach((child) => {
                let name = child.name;
                if (name[0] === uikiller._prefix) {
                    if (!_prefixList[name]) {
                        _prefixList[name] = true;
                    } 
                }
                bindNode(child);
            });
        }
        for (const key in _prefixList) {
            cc.log(`private ${key}:cc.Node;`)
        }
        return _prefixList;
    }

    showBindNodes(){
        let prefixList = this.getbindNodes();
        for (const key in prefixList) {
            cc.log(`private ${key}:cc.Node;`)
        }
    }

    bindHammer() {
        if (this._bindHammer) {
            return;
        }
        this._bindHammer = true;

        let start = Date.now();
        let options = this.getOptions();
        uikiller.bindComponent(this, options);
       
        //关联逻辑控制器
        // this.bindController();

        if (CC_DEBUG) {
            let duration = Date.now() - start;
            // cc.log(`bindComponent ${this.node.name} duration ${duration}`);
        }
    }

   /*  protected bindController() {
        //关联逻辑控制器
        if (this.useController) {
            let controllerName = this.controllerName || `${this.__classname__}Controller`;

            // //require同步方式：require会有红线
            let object = require(controllerName);
            this.$controller = new object.default();
            uikiller.bindNode(this.node, this.$controller);
        }
    } */

    getChildNode(name): cc.Node {
        return this[name];
    }
}