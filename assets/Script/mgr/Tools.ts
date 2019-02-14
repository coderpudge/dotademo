
const {ccclass, property} = cc._decorator;

@ccclass
class ToolsClass {

    public static readonly Instance: ToolsClass = new ToolsClass();
    /**
    * 获取随机整数(闭区间)
    @param min  最小值
    @param max  最大值
    **/
    random(min: number, max: number): number {
        let num = Math.random() * (max - min + 1) + min;
        return Math.floor(num);
    };

    /**
    * 加载并替换图片
    * @param imgNode    图片节点
    * @param url       图片资源路径（）
    * @param isRelease    是否释放被替换掉的资源（默认为false）
    * @param callback    替换完成后的回调
    * @param param       回调函数的参数
    */
   public loadSpriteFrameRes (imgNode: cc.Node, url: string, isRelease: boolean = false, callback?: Function, ...param: any[]) {
    if(!imgNode) {
        console.log('UI_Tools.loadSpriteFrameRes() ERROR!  imgNode is null!');
        return;
    }

    let preActive = imgNode.active;
    // imgNode.active = false;
    if (!imgNode.getComponent(cc.Sprite)) {
        imgNode.addComponent(cc.Sprite)
    }
    let preSpriteFrame = imgNode.getComponent(cc.Sprite).spriteFrame;

    cc.loader.loadRes(url ,cc.SpriteFrame, function (err, spriteFrame) {
        if(!err)
        {
            // imgNode.active = preActive;
            imgNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            
            if(callback) {
                callback(param);
            }

            if (isRelease && preSpriteFrame) {
                cc.loader.releaseAsset(preSpriteFrame);
            }
        }else {
            console.log("err--------------------- url = ", url);
        }
    });
};
}
export const Tools = ToolsClass.Instance; 
