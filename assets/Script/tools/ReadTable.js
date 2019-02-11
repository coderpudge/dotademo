// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var ReadTable = ReadTable || {
    tableList: {
        default: {},
    },

    _baseInfoList: {
        default: {},
    },

    getTable(tableName) {
        if (!this.tableList[tableName]) {
            this.tableList[tableName] = require(tableName);
        }

        return this.tableList[tableName];
    },

    getTableDataInfo(table, id) {
        if (table && table.tableData[id]) {
            let dic = {};
            for (var key in table.tableDF) {
                dic[table.tableDF[key]] = table.tableData[id][key];
            }

            return dic;
        }

        return null;
    },

    getBaseInfo (tableName, id) {
        if(!this._baseInfoList[tableName])
        {
            this._baseInfoList[tableName] = {};
        }
        if (!this._baseInfoList[tableName][id]) {
            let table = this.getTable(tableName);
            this._baseInfoList[tableName][id] = this.getTableDataInfo(table, id);
        }

        return this._baseInfoList[tableName][id];
    },
    
};

module.exports = ReadTable;