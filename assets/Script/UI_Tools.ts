
import { SceneManager } from './SceneManager';
import * as ENUM from '../constEnum';
import { TableManager } from './TableManager';
import { DataManager } from './DataManager';
import { ItemInfo } from '../constEnum';
import ItemCell from '../../resources/prefabs/public/ItemCell';
import { GuideManager } from './GuideManager';
import softGuide from './../../resources/prefabs/public/softGuide';

const {ccclass} = cc._decorator;

@ccclass
class UI_ToolsClass {

    public static readonly Instance: UI_ToolsClass = new UI_ToolsClass();

    private constructor() {
   
    };   

    /**
    * 判断数组中是否包含某个元素(类型不同，返回false)
    @param array []
    @param value any
    **/
    public isInArray (array: any[], value: any): boolean {
        if (!array || 0 === array.length || !value) {
            return false;
        }

        for (let i = 0; i < array.length; ++i) {
            if (value === array[i]) {
                return true;
            }
        }

        return false;
    };

    /**
    * 加载并替换spine动画
    * @param spNode    动画节点
    * @param url       spine资源路径（）
    * @param animName  当前播放的动画（不传则播放之前的动画）
    * @param isLoop    是否循环播放（默认为true）
    * @param isRelease    是否释放被替换掉的资源（默认为false）
    * @param callback    替换完成后的回调
    * @param param       回调函数的参数
    */
    public loadSpine (spNode: cc.Node, url: string, animName?: string, isLoop: boolean = true, isRelease: boolean = false, callback?: Function, ...param: any[]) {
        if(!spNode) {
            console.log('UI_Tools.loadSpine() ERROR!  spNode is null!');
            return;
        }

        let preActive = spNode.active;
        spNode.active = false;
        
        let spSke: sp.Skeleton = spNode.getComponent(sp.Skeleton);
        let preRes = spSke.skeletonData;

        cc.loader.loadRes(url, sp.SkeletonData, function(err, res) {
            if (err) {
                cc.log('Error url [' + err + ']');
                return;
            }

            spNode.active = preActive;

            let oldAnim = spSke.animation;
            spSke.skeletonData = res;
            if(animName) {
                spSke.setAnimation(0, animName, isLoop);
            }
            else if(oldAnim) {
                spSke.setAnimation(0, oldAnim, isLoop);
            }

            if(callback) {
                callback(param);
            }

            if (isRelease && preRes) {
                cc.loader.releaseAsset(preRes);
            }
        });
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

    /**
    * 弹出文字提示框
    @param content 提示内容
    **/
    public showTips (content: string) {
        let func = function (node) {
            node.parent = cc.find("Canvas");
            let textNode = cc.find("sprite/lb_neirong", node);
            textNode.getComponent(cc.Label).string = content;
            node.y = 100;
            node.opacity = 0;

            let action = cc.sequence(cc.fadeTo(0.3, 255), cc.delayTime(0.8), cc.spawn(cc.fadeTo(0.3, 0), cc.moveBy(0.3, cc.v2(0, 50))), 
                cc.callFunc(function () {
                    node.destroy();
                }));
            
            node.runAction(action);
        };

        let prefab = SceneManager.publicPrefabList['showTips'];
        if(prefab) {
            let tipsNode = cc.instantiate(prefab);
            func(tipsNode);
        }
        else {
            cc.loader.loadRes('prefabs/public/showTips', cc.Prefab, function (err, res) {
                if (!err) {
                    let tipsNode = cc.instantiate(res);
                    func(tipsNode);
                }
            });
        }
    };

    /**
    * 弹出GM界面
    **/
    public showGmLayer () {
        let gmLayer: cc.Node = null;
        let gmPrefab = SceneManager.publicPrefabList['gmLayer'];
        if (gmPrefab) {
            gmLayer = cc.instantiate(gmPrefab);
            gmLayer.parent = cc.find("Canvas");
        }
        else {
            cc.loader.loadRes('prefabs/public/gmLayer', cc.Prefab, function (err, res) {
                if (!err) {
                    gmLayer = cc.instantiate(res);
                    gmLayer.parent = cc.find("Canvas");
                }
            });
        }
    };

    /**
    * 获取随机整数(闭区间)
    @param min  最小值
    @param max  最大值
    **/
    public random (min: number, max: number): number {
        let num = Math.random() * (max - min + 1) + min;
        return Math.floor(num);
    };

    /**
    * 将对象列表转换成数组形式
    @param obj
    **/
    public objToArray (obj: object): any[] {
        if(!obj) {
            return [];
        }

        let list = [];
        for(let key in obj) {
            list.push(obj[key]);
        }

        return list;
    };

    /**
    * 根据品质获取色值(暗色值)
    @param quality  品质值
    **/
    public getColorWithQuality (quality: any): cc.Color {
        if ('string' === typeof quality) {
            quality = parseInt(quality);
        }

        let color = cc.Color.GRAY;
        if (ENUM.QUALITY_ID.WHITE === quality) {
            color = cc.Color.WHITE;
        } 
        else if (ENUM.QUALITY_ID.GREEN === quality) {
            color = cc.color(0, 121, 54);
        }
        else if (ENUM.QUALITY_ID.BLUE === quality) {
            color = cc.color(0, 117, 169);
        }
        else if (ENUM.QUALITY_ID.PURPLE === quality) {
            color = cc.color(154, 1, 154);
        }
        else if (ENUM.QUALITY_ID.ORANGE === quality) {
            color = cc.color(133, 60, 20);
        }
        else if (ENUM.QUALITY_ID.RED === quality) {
            color = cc.color(176, 0, 14);
        }
        else if (ENUM.QUALITY_ID.GOLD === quality) {
            color = cc.color(143, 105, 0);
        }

        return color;
    };

    /**
    * 根据品质获取色值(亮色值)
    @param quality  品质值
    **/
    public getColorWithQualityLight (quality: any): cc.Color {
        if ('string' === typeof quality) {
            quality = parseInt(quality);
        }

        let color = cc.Color.GRAY;
        if (ENUM.QUALITY_ID.WHITE === quality) {
            color = cc.Color.WHITE;
        } 
        else if (ENUM.QUALITY_ID.GREEN === quality) {
            color = cc.color(156, 255, 49);
        }
        else if (ENUM.QUALITY_ID.BLUE === quality) {
            color = cc.color(0, 219, 255);
        }
        else if (ENUM.QUALITY_ID.PURPLE === quality) {
            color = cc.color(255, 85, 255);
        }
        else if (ENUM.QUALITY_ID.ORANGE === quality) {
            color = cc.color(255, 96, 0);
        }
        else if (ENUM.QUALITY_ID.RED === quality) {
            color = cc.color(255, 40, 16);
        }
        else if (ENUM.QUALITY_ID.GOLD === quality) {
            color = cc.color(255, 227, 16);
        }

        return color;
    };

    //概率的文字描述
    getProbText(percent) {
        var info = {
            text:'',
            color:cc.color(),
        };
        if(percent < 0.3)
        {
            info.text = "很低概率";
            //info.color = UI_Tools.getColorWithQuality(TANKQUALITY_ID.WHITE);
            info.color = cc.color(108, 108, 108);
        }
        else if(percent < 0.45)
        {
            info.text = "较低概率";
            //info.color = UI_Tools.getColorWithQuality(TANKQUALITY_ID.GREEN);
            info.color = cc.color(0, 153, 68);
        }
        else if(percent < 0.6)
        {
            info.text = "一般概率";
            //info.color = UI_Tools.getColorWithQuality(TANKQUALITY_ID.BLUE);
            info.color = cc.color(0, 117, 169);
        }
        else if(percent < 0.7)
        {
            info.text = "较高概率";
            //info.color = UI_Tools.getColorWithQuality(TANKQUALITY_ID.PURPLE);
            info.color = cc.color(154, 0, 154);
        }
        else
        {
            info.text = "很高概率";
            //info.color = UI_Tools.getColorWithQuality(TANKQUALITY_ID.RED);
            info.color = cc.color(230, 0, 18);
        }
        return info;
    };

    /**
    * 将数字转换为 xx亿 或 xx万 的字符串形式(超过10万)
    @param num  数字
    **/
    public getNumString (num: number): string {
        if (num >= 100000000) {
            let yi = Math.floor(num / 100000000);
            let wan = Math.floor((num % 100000000) / 1000000);
            let wanStr = wan >= 10 ? wan + '' : "0" + wan;
            return yi + "." + wanStr + '亿';
        }
        else if (num >= 100000) {
            return Math.floor(num / 10000) + '万';
        }
        else {
            return Math.floor(num) + "";
        }
    };

    /**
    * 字符串中是否有某个数字
    * @param str    字符串
    * @param value  数字
    * @param mark  字符串中的间隔符，默认为','
    */
    public isValueInStr (str: string, value: any, mark: string = ','): boolean {
        if("" === str || null === str) {
            return false;
        }

        let arr = str.split(mark);
        for(let i = 0; i < arr.length; ++i) {
            if("" === arr[i]) {
                continue;
            }

            if(parseInt(arr[i]) === parseInt(value + '')) {
                return true;
            }
        }

        return false;
    };

    /**
    * 根据(type,id,num;...)形式的字符串获取类型的数组
    * @param strTemp    字符串(type,id,num;...)
    */
    public getTypeListByStr (strTemp: string = ''): number[] {
        let strList = strTemp.split(";");
        let typeList = [];
        for(let i = 0; i < strList.length; ++i) {
            let objStr = strList[i];
            if(objStr) {
                let objArr = objStr.split(",");
                typeList.push(parseInt(objArr[0]));
            }
        }

        return typeList;
    };

    /**
    * 根据[ItemInfo]获取类型的数组
    * @param itemList    [ItemInfo]
    */
    public getTypeListByItemList (itemList: ENUM.ItemInfo[]): number[] {
        let typeList = [];
        for(let i = 0; i < itemList.length; ++i) {
            typeList.push(itemList[i].type);
        }
        
        return typeList;
    };

    /**
    * 根据(type,id,num;)形式的字符串获取ItemInfo
    * @param str    str
    */
    public getItemByStr (str: string): ENUM.ItemInfo {
        return this.getItemListByStr(str)[0];
    };

    /**
    * 根据(type,id,num;...)形式的字符串获取 [ItemInfo]
    * @param str    str
    */
    public getItemListByStr (str: string = ''): ENUM.ItemInfo[] {
        //cc.log("str:"+str);
        let strList = str.split(";");
        let itemList = [];
        for(let i = 0; i < strList.length; ++i) {
            let objStr = strList[i];
            if(objStr) {
                let objArr = objStr.split(",");
                let item = this.getItemByIdAndType(Number(objArr[0]), Number(objArr[1]), Number(objArr[2]));
                itemList.push(item);
            }
        }

        return itemList;
    };

    /**
    * 根据 类型、id、数量、唯一id 获取 ItemInfo
    * @param type    类型(必须)
    * @param id    id(货币等类型没有id)
    * @param num    数量（默认为0）
    * @param seqId   唯一id （没有唯一id可不传）
    */
    public getItemByIdAndType (type: number, id: number = 0, num: number = 0, seqId: string = ''): ENUM.ItemInfo {
        type = Number(type);
        let info: ENUM.ItemInfo = new ENUM.ItemInfo(type, id, num, seqId);
        
        if (type === ENUM.ITEM_TYPE.ITEM) { //道具
            let baseInfo = TableManager.getBaseInfo('i_item', id);
            if (baseInfo) {
                info.name = baseInfo["itemName"];
                info.quality = baseInfo["itemquality"];
                info.desc = baseInfo["desc"];
                info.img = baseInfo["img"];
            }
            else {
                cc.log("ERROE!!!! type = " + type + ", id = " + id);
            }                       
        }
        else if (type === ENUM.ITEM_TYPE.EQUIP ) {               
            let equipInfo = TableManager.getBaseInfo('e_equip', id);
            if(equipInfo) {
                info.name = equipInfo["EquipName"];
                info.quality = equipInfo["EquipQuality"];
                info.desc = equipInfo["des"];
                info.img = equipInfo["Icon"];
            }
            else {
                cc.log("ERROE!!!! type = " + type + ", id = " + id);
            }
        }
        else if (type === ENUM.ITEM_TYPE.HERO ) {           
            let baseInfo = TableManager.getBaseInfo('h_hero', id);
            if (baseInfo) {
                info.name = baseInfo['name'];
                info.quality = baseInfo['quality'];
                info.desc = baseInfo["desc"];
                info.img = baseInfo["TankHeadportrait"];
            }
            else {
                cc.log("ERROR!!!! type = " + type + ", id = " + id);
            }
        }
        else if (type === ENUM.ITEM_TYPE.TREASURE ) {           
            let baseInfo = TableManager.getBaseInfo('t_treasureInfo', id);
            if (baseInfo) {
                info.name = baseInfo['TreasureName'];
                info.quality = baseInfo['TreasureQ'];
                info.desc = baseInfo["Desc"];
                info.img = baseInfo["Icon"];
            }
            else {
                cc.log("ERROR!!!! type = " + type + ", id = " + id);
            }
        }
        else if (type === ENUM.ITEM_TYPE.TREASURE_CHIP ) {           
            let baseInfo = TableManager.getBaseInfo('t_treasure_chip', id);
            if (baseInfo) {
                info.name = baseInfo['name'];
                info.quality = baseInfo['quality'];
                info.desc = baseInfo["Desc"];
                info.img = baseInfo["Figure"];
                info.isChip = true;
            }
            else {
                cc.log("ERROR!!!! type = " + type + ", id = " + id);
            }
        }
        else if (type === ENUM.ITEM_TYPE.HERO_CHIP ) {           
            let chipInfo = TableManager.getBaseInfo('h_hero_chip', id);
            if (chipInfo) {
                info.name = chipInfo['tankchipname'];
                info.quality = chipInfo['quality'];
                info.desc = chipInfo["Desc"];
                info.img = chipInfo["img"];
                info.isChip = true;
            }
            else {
                cc.log("ERROR!!!! type = " + type + ", id = " + id);
            }
        }
        else if (type === ENUM.ITEM_TYPE.EQUIP_CHIP) {           
            let baseInfo = TableManager.getBaseInfo('e_equip_chip', id);
            if (baseInfo) {
                info.name = baseInfo['equipchipname'];
                info.quality = baseInfo['equipQuality'];
                info.desc = baseInfo["Desc"];
                info.img = baseInfo["img"];
                info.isChip = true;
            }
            else {
                cc.log("ERROR!!!! type = " + type + ", id = " + id);
            }
        }
        else { //货币类型
            let baseInfo = TableManager.getBaseInfo('i_icon', type);
            if (baseInfo) {
                info.name = baseInfo['name'];
                info.quality = baseInfo['pinzhi'];
                info.desc = baseInfo["desc"];
                info.img = baseInfo["img"];
            }
            else {
                cc.log("ERROR!!!! type = " + type + ", id = " + id);
            }
        }

        return info;
    };

    public getItemByFashionId(fashionId, sex): ENUM.ItemInfo {

        let info: ENUM.ItemInfo = new ENUM.ItemInfo(0, 0, 0, '0');
        let table = TableManager.getBaseInfo('f_fashion_equip_value', fashionId);
        let iconSrc = '';
        if (sex == 0) {
            iconSrc = table.tubiao;
        }else{
            iconSrc = table.tubiaonv
        }
        info.img = iconSrc;
        return info;
    }

    /**
    * 获取服务器时间(返回的是UTC时间)
    * @返回 data 
    * 获取年：var y = date.getUTCFullYear();
    * 获取月：var m = date.getUTCMonth();
    * 获取日：var d = date.getUTCDate();
    * 获取小时：var h= date.getUTCHours();
    * 获取分钟：var M = date.getUTCMinutes();
    * 获取秒钟：var s = date.getUTCSeconds();
    */
    public getServerUTCDate (): Date {
        let UTCTime = (new Date().getTime()) + DataManager.roleBaseInfo.serverTimeDif + 8 * 60 * 60 * 1000;
        let data = new Date(UTCTime);
        return data;
    };

    /**
    * 获取服务器时间戳(返回number)
    */
    public getServerTime (): number {
        let time = new Date().getTime() + DataManager.roleBaseInfo.serverTimeDif;
        return time;
    };

    /**
    * 将 时间转化为 "00:00:00" 显示
    * @param {毫秒} mss 
    * @param {单位是否为秒} isSec 
    */
    public formatTime (mss: number, isSec: boolean = false): string { 
        if (mss <= 0) {
            return "00:00:00";
        }

        // 如果单位是秒, 将秒转化为毫秒;
        if (isSec) {
            mss = mss * 1000;
        }
        if (mss <= 100) {
            // 小于100 毫秒,days会将结果转成科学计数法
            return "00:00:00";
        }

        let days = Math.floor(mss / (1000 * 60 * 60 * 24));
        let hours = Math.floor((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((mss % (1000 * 60)) / 1000);
        let newHours = days * 24 + hours;

        let hoursStr = newHours.toString();
        let minutesStr = minutes.toString();
        let secondsStr = seconds.toString();

        if (minutes < 10) {
            minutesStr = "0" + minutes.toString();
        }
        if (seconds < 10) {
            secondsStr = "0" + seconds.toString();
        }       
        if (newHours < 10) {
            hoursStr = "0" + newHours.toString();
        }

        return hoursStr + ":" + minutesStr + ":" + secondsStr;
    };

    /**
     * 将 时间戳转化为 日期格式 显示
    * @param {毫秒} mss 
    * @param {单位是否为秒} isSec 
     */
    private add0(m){return m<10?'0'+m:m };
    public formatTime2 (mss: number, isSec: boolean = false): string { 
        // 如果单位是秒, 将秒转化为毫秒;
        if (isSec) {
            mss = mss * 1000;
        }
        //shijianchuo是整数，否则要parseInt转换
        var time = new Date(mss);
        var y = time.getFullYear();
        var m = time.getMonth()+1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();
        return y+'-'+this.add0(m)+'-'+this.add0(d)+' '+this.add0(h)+':'+this.add0(mm)+':'+this.add0(s);
    };


    /**
    * 将 时间转化为 时或分 显示
    * @param {毫秒} mss 
    * @param {单位是否为秒} isSec 
    */
    public getTimeStringWithMss  (mss: number, isSec: boolean = false): string {
        if (mss <= 0) {
            return "0分钟";
        }
        // 如果单位是秒, 将秒转化为毫秒;
        if (isSec) {
            mss = mss * 1000;
        }
        if (mss <= 100) {
            return "0分钟";
        }
        
        let days = Math.floor(mss / (1000 * 60 * 60 * 24));
        let hours = Math.floor((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((mss % (1000 * 60)) / 1000);
        let newHours = days * 24 + hours;

        if(seconds > 0) {
            minutes = minutes + 1;
        }
        if(minutes > 59){
            minutes = 0;
            hours = hours + 1;
        }

        if(newHours > 0) {
            if(minutes > 0) {
                return newHours + "时" + minutes + "分";
            }
            else {
                return newHours + "小时";
            }
        }
        else {
            if(minutes > 0) {
                return minutes+"分钟";
            }
            else {
                return "0分钟";
            }
        }
    };

    public getTimeStringWithoutColon = function (sec) {
        var day = Math.floor(sec / 3600 / 24);
        sec = sec - day * 3600 * 24;
        var hour =Math.floor(sec / 3600);
        sec = sec - hour * 3600;
        var min =Math.floor(sec / 60);
        sec = Math.floor(sec % 60);
        return day + "天" + hour + "小时" + min + "分" + sec + "秒";
    };
    

    /**
    * 弹框显示获得的物品
    * @param rewardsList 物品数组([ItemInfo])
    */
    public showRewards (rewardsList: ENUM.ItemInfo[]) {
        rewardsList = rewardsList || [];

        if (rewardsList.length > 0) {
            SceneManager.showTopLayer('guaji_huodedaoju', rewardsList);
        }
    };

    /**
     * 系统提示框
     * @param str  显示的文字
     * @param callback   确定回调
     */
    public showSystemDialog(str, callback){
        SceneManager.showTopLayer('guaji_dianjiangtai_tishi', str, callback);
    }

    /**
    * 广度优先遍历某个根节点的所有子节点（包括子节点的子节点等），返回第一个与目标名字相同的节点（包含根节点）
    * @param parentNode 根节点
    * @param findNodeName 目标节点名字
    * @param isNeedActive true 表示只查找激活状态的节点; false 表示不管节点是否激活，都查找
    */
    public findNode (parentNode: cc.Node, findNodeName: string, isNeedActive: boolean = true): cc.Node {
        let nodes = [], i = 0;
        while (parentNode) {
            // console.log(i + ':  ' + parentNode.name);            
            if (parentNode.name === findNodeName && (!isNeedActive || parentNode.active)) {
                return parentNode;
            }
            else {
                let childrens = parentNode.children;
                for (let j = 0; j < childrens.length; ++j) {
                    if (!isNeedActive || childrens[j].active) {
                        nodes.push(childrens[j]);
                    }
                }
            }

            parentNode = nodes[i++];
        }

        return null;
    };

    /**
    * 弹框物品详情界面
    * @param ItemInfo 物品(type:ItemInfo)
    */
    public showDetailsLayer (ItemInfo: ENUM.ItemInfo) {
        if(!ItemInfo) {
            return;
        }

        console.log(ItemInfo);
       
        if (ENUM.ITEM_TYPE.HERO === ItemInfo.type) {
            let baseInfo = TableManager.getBaseInfo('h_hero', ItemInfo.id);
            if(baseInfo) {
                SceneManager.showTopLayer('ck_chouka_wujiangyulan', baseInfo);
            }
        }
        else if(ENUM.ITEM_TYPE.EQUIP === ItemInfo.type) {
            SceneManager.showTopLayer('zhuangbeixiangqing', ItemInfo);
        }
        else if(ENUM.ITEM_TYPE.TACTICS == ItemInfo.type) {
            SceneManager.showTopLayer('zhanfaxiangqing', ItemInfo);
        }
        else {
            SceneManager.showTopLayer('daojuxiangqing', ItemInfo);
        }
    };

 
    /**
    * 显示小红点
    * @param target 目标节点
    * @param isShow 是否显示小红点
    * @param pos  小红点相对于节点的坐标（可不传，默认在节点右上角显示）
    * @param num  小红点上显示的数字（不传或传入0，不显示数字）
    */ 
    public showRedDot (target: cc.Node, isShow: boolean, pos?: cc.Vec2, num: number = 0) {
        if(!cc.isValid(target)) {           
            return;
        }

        let show = isShow || num > 0;
        let redDotNode = target.getChildByName('redDot');

        if (show) {
            if(redDotNode) {
                redDotNode.active = true;
            }
            else {
                redDotNode = new cc.Node('redDot');
                redDotNode.addComponent(cc.Sprite);
                this.loadSpriteFrameRes(redDotNode, 'img/public/hongdiantishi');
                redDotNode.parent = target;
                redDotNode.zIndex = 999;
                redDotNode.position = pos || (cc.p(target.width / 2 - 25, target.height / 2 - 25));
            }
            
            if (num > 0) {
                let numNode = redDotNode.getChildByName('redNum');
                if (!numNode) {
                    numNode = new cc.Node('redNum');
                    numNode.addComponent(cc.Label);
                    numNode.parent = redDotNode;
                    numNode.x = -0.6;
                }
                let label = numNode.getComponent(cc.Label);
                label.string = num.toString();
                label.fontSize = 14;
                label.lineHeight = 16;
            }
        }
        else {
            if (redDotNode) {
                redDotNode.active = false;
            }
        }
    };

    /**
     * @param arr 
     * @param fromFight 初始战力
     * @param toFight 目标战力
     */
    public showChangeLabel(arr:any[],fromFight:number,toFight:number){
        
    }
    /**
    * 参数1：字符串ID
    * 参数2，3，...：要替换的参数
    * @param str
    * @return {string}
    */
    public makeStr (str: string, ...param: any[]): string {
        if (str === undefined) {
            cc.log("string not found, id");
            return "";
        }

        for (let i = 0; i < param.length; ++i) {
            let idx = str.indexOf("#" + (i + 1));
            if (idx === -1) {
                cc.log("字符串参数错误： " + str);
                break;
            }

            str = str.replace("#" + (i + 1), param[i]);
        }

        return str;
    };

    /**
     * 状态码 提示
     * @param id 
     */
    showStateTips(id){
        let state = TableManager.getBaseInfo('s_statecode', id)
        if (!state) {
            this.showTips(`状态码:${id},没有描述 请策划补充`);
            return;
        }
        if (!state.desc) {
            this.showTips(`状态码:${id},没有描述 请策划补充`);
            return;
        }
        this.showTips(state.desc);
    }

    // public adjustScrollViewHeight (scrollView) {
    //     let offset_top = 84.5;
    //     let offset_bottom = 65;
    //     let designWidth = 720;
    //     let designHeight = 1280;

    //     let designRate = designHeight / designWidth;
    //     let rate = cc.winSize.height/cc.winSize.width
    //     let diffHeight = cc.winSize.height - designHeight;

    //     if (rate >= 2.165) {
    //         diffHeight -= offset_top + offset_bottom
    //     }
    //     let scview = scrollView.getComponent(cc.tableView);
    //     if (scview) {
    //         scview.height += diffHeight; 
    //         scview.content.parent.height += diffHeight;
    //     }
    // };

    // getComponent<T extends Component>(type: {prototype: T}): T;
    //     getComponent(className: string): any;		
        
   /**
    *  creator  的nodejs版本不支持 Map, 暂时废弃
    * @param list 被转换的数组或集合
    * @param classType 需要转化成什么类型
    * @param keyName 唯一标识的属性名称
    */
    listToMap<T>(list, classType:{ prototype: T }, keyName){
        let map = new Map<String,T>();
        for (const obj of list) {
            map.set(obj[keyName], <T>obj);
        }
        return map;
    }

    /**
     * 计算字体的实际长度(系统字Arial)
     * @param id 
     */
    public getLabelWidthOfArialFont (str: string, fontSize: number): number {
        let width = 0;
        let chineseWidth = fontSize;
        let otherWidth = fontSize * 0.5562;

        for (let i = 0; i < str.length; ++i) {
            let len = str.charCodeAt(i);
            if (len >= 0 && len <= 128) {
                width += otherWidth;
            }
            else {
                width += chineseWidth;
            }
        }
        
        return width;
    };

    /*
     * 在没有子节点的节点上添加 itemCell, 默认节点没有子节点 或 只有一个itemCell子节点
     * @param parent 
     */
    addItemCellToNode(parent:cc.Node): ItemCell{
        if (!parent) {
            return;
        }
        if (parent.childrenCount == 0){
            let itemNode = cc.instantiate(SceneManager.publicPrefabList['itemCell']);
            itemNode.parent = parent;
        }
        let  cellNode:cc.Node = parent.children[0];
        let  component = cellNode.getComponent(ItemCell);
        return component; 
    }
    
    /**
     * String.split() 方法的修改版，如果字符串最后一个字符是分隔符，可以选择删掉它，以便只获取有效数组 
     * @param baseStr 目标字符串
     * @param markStr 分隔符
     * @param isDelLast 如果字符串最后一个字符是分隔符，是否删掉它（默认会删除）
     * @param howmany 返回的数组的最大长度(默认全部返回)
     */
    public stringSplit (baseStr: string = '', markStr: string, isDelLast: boolean = true, howmany?: number): string[] {
        if (baseStr.length - markStr.length === baseStr.lastIndexOf(markStr)) { //如果字符串最后一个是分隔符，就把它删掉
            baseStr = baseStr.substring(0, baseStr.length - markStr.length);
        }
        let valueArr = baseStr.split(markStr, howmany);
        return valueArr;
    };

    public setLabelColor(label:cc.Node,num1,num2,isTwo){
        if(num1 < num2){
            label.color = UI_Tools.getColorWithQuality(ENUM.QUALITY_ID.RED);//红
        }else{
            label.color = UI_Tools.getColorWithQuality(ENUM.QUALITY_ID.WHITE);//白
        }
    
        if(isTwo){
            label.getComponent(cc.Label).string = (UI_Tools.getNumString(num1)+"/"+UI_Tools.getNumString(num2));
        }else{
            label.getComponent(cc.Label).string = (UI_Tools.getNumString(num2));
        }
    
        return num1 < num2;
    };

    /**
    * 弹出软引导
    * @param target 指引节点
    * @param isUpdatePos 是否一直更新并跟随节点坐标
    **/
    public showSoftGuide (target: cc.Node, isUpdatePos: boolean = false) {
        let func = function (node: cc.Node) {
            let tmpNode = cc.find("Canvas").getChildByName('softGuide');
            if (tmpNode) {
                tmpNode.destroy();
            }
            cc.find("Canvas").addChild(node, 99, 'softGuide');
            node.getComponent(softGuide).updateInfo(target, isUpdatePos);
        };

        let prefab = SceneManager.publicPrefabList['softGuide'];
        if(prefab) {
            let guideNode = cc.instantiate(prefab);
            func(guideNode);
        }
        else {
            cc.loader.loadRes('prefabs/public/softGuide', cc.Prefab, function (err, res) {
                if (!err) {
                    let guideNode = cc.instantiate(res);
                    func(guideNode);
                }
            });
        }
    };

    public removeSoftGuide () {
        let tmpNode = cc.find("Canvas").getChildByName('softGuide');
        if (tmpNode) {
            tmpNode.destroy();
        }
    };

    /**
     * 设置按钮 可用状态
     * @param button 
     * @param flag 
     */
    setButtonState(button, flag:boolean){
        button.getComponent(cc.Button).interactable = flag;
        let buttonChildren = this.getChildren(button);
        if (!flag) {
            for (const child of buttonChildren) {
                let sp = child.getComponent(cc.Sprite);
                if (sp) {
                    sp.setState(cc.Sprite.State.GRAY);
                }
            }
        }else{
            for (const child of buttonChildren) {
                let sp = child.getComponent(cc.Sprite);
                if (sp) {
                    sp.setState(cc.Sprite.State.NORMAL);
                }
            }
        }
    }

    /**
     * 获得节点的子节点
     * @param node 
     */
    getChildren(node:cc.Node){
        let nodes = [];
        if (!node) {
            return nodes;
        }
        searchNode(node);
        function searchNode(nodeObject){
            const node = nodeObject;
            node.children.forEach((child) => {
                nodes.push(child);
                searchNode(child);
            });
        }
        return nodes;
    }
}


export const UI_Tools = UI_ToolsClass.Instance;
