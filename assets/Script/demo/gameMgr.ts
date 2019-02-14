

const {ccclass, property} = cc._decorator;

@ccclass
class GameMgrClass{
    public static readonly Instance: GameMgrClass = new GameMgrClass();

    isGameStart = false;
    timeDiff = 0; // 与服务器时间差
    round = 0; //回合
    step=0; // 步
    pop = 1; //人口population
    store = {}; //刷新商店
    warehouse = {}; //仓库
    formation = []; //阵型
    report = null;
    f_row = 6; //棋盘阵型 行数
    f_column = 8; //棋盘阵型 列数
    f_def_value = -1;

    /**
     * 棋盘
    6  5  11 17 23 29 45 41 47
    5  4  10 16 22 28 34 40 46
    4  3  9  15 21 27 33 39 45
    3  2  8  14 20 26 32 38 44
    2  1  7  13 19 25 31 37 43
    1  0  6  12 18 24 30 36 42
       1  2  3  4  5  6  7  8
    */
    initFormation(){
        this.formation = [];
        for (let i = 0; i < this.f_row * this.f_column; i++) {
            this.formation.push(this.f_def_value);
        }
    }

    


    constructor(){
        // register event msg
        
    }
    // 进入游戏
    enterGame(){
        // 向服务器获取当前状态
        // 是否在游戏中
    }
    // 向服务器获取当前状态
    sendGetGameInfo(){
        MSGID.GET_CUR_GAME_INFO
    }

    gameStart(){
        if (!this.isGameStart) {
            return;
        }
        if (this.round == 0) {
            return;
        }

    }
    // 检查回合
    checkRound(){
        if (this.round == 0) {
            // 发送状态已准备好

            return;
        }
        
        switch (this.step) {
            case STEP.READY:
            {
                //fire 刷新商店, 倒计时30s

                break;
            }  
            case STEP.LOCKED:
            {
                //fire 锁定不能操作布阵 5s
                this.checkFormation();
                break;
            }  
            case STEP.BATTLE:
            {
                //fire 战斗
                this.playBattle();
                break;
            }  
            case STEP.END:
            {
                //fire 游戏结束

                break;
            }  
            default:
                break;
        }
    }

    testCountDown(num){
        
    }
    // 检查阵型
    checkFormation(){
        // 移除多余的卡

    }
    // 布阵
    setFormation(){
        // send formation

    }

    // 播放战斗
    playBattle(){

    }


    
    onMsg(obj,msgId,stateCode){
        switch (msgId) {
            case MSGID.GET_CUR_GAME_INFO:
            {
                let objc = {
                    round:1, // 回合
                    step:1, // 回合 步骤
                    hp:100,
                    gold:1,
                    pop:1,
                    lvl:1,
                    cd:0,
                    // 刷新商店
                    store:[ 
                        {
                            pos:1,
                            cardId:1,
                        },
                        {
                            pos:2,
                            cardId:2,
                        },
                        
                    ],
                    // 仓库
                    warehouse:[
                        {
                            pos:1,
                            cardId:3,
                        },
                        {
                            pos:2,
                            cardId:4,
                        },
                    ],
                    // 阵型
                    formation:[
                        {
                            pos:1,
                            cardId:3,
                        },
                        {
                            pos:2,
                            cardId:4,
                        },
                    ],
                    report:{
                        //战报
                    }
                }
                this.round = objc.round;
                this.step = objc.step;
                for (const data of objc.store) {
                    this.store[data.pos] = data.cardId;
                }
                // this.store = objc.store;
                this.report = objc.report;
                
                this.checkRound();
                break;
            }
            case MSGID.GAME_START_COUNT_DOWN:
            {
                // 倒计时
                break;
            }
            case MSGID.SET_FORMATION:
            {
                // 布阵
                break;
            }
            case MSGID.SYSTEM_RESET_FORMATION:
            {
                // 不符合规则的阵型, 系统重洗布阵
                break;
            }
        
            default:
                break;
        }
    }

}
export const GameMgr = GameMgrClass.Instance;

enum STEP{
    READY=1,
    LOCKED=2,
    BATTLE=3,
    END= 4,
}

enum MSGID{
    GET_CUR_GAME_INFO=1,
    GAME_START_COUNT_DOWN=2,
    SET_FORMATION = 3,
    SYSTEM_RESET_FORMATION = 4,
}
