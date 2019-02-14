

import * as ReadTable from '../tools/ReadTable';

class TableManagerClass{

    public static readonly Instance:TableManagerClass = new TableManagerClass();

    private _baseInfoList: any = {};
    private _baseEquipInfo:any = {};
    private _baseConvertInfo:any = {};
    private _baseEquipRefineInfo:any = {};
    private _baseEquipChipInfo:any = {};
    private _baseFunctionInfo:any = {};
    private _baseTankInfo:any = {};
    private _baseTankChipInfo:any = {};
    private _baseTankSanctifyInfo:any = {};
    private _baseLevelUpInfo:any = {};
    private _baseVipLimitInfo:any = [];
    private _baseRefiningEffeftInfo:any = [];
    private _baseSuitEffectInfo:any = [];

    private constructor() {
   
    };

    public getTable (tableName: string) {
        let table = ReadTable.getTable(tableName);
        return table;
    };

    public getTableDataInfo (table, id) {
        if (!table) {
            return null;
        }
        
        let data = ReadTable.getTableDataInfo(table, id);
        return data;
    };

    public getBaseInfo (tableName: string, id) {
        if (!this._baseInfoList[tableName]) {
            this._baseInfoList[tableName] = {};
        }

        if (!this._baseInfoList[tableName][id]) {
            let table = this.getTable(tableName);
            this._baseInfoList[tableName][id] = this.getTableDataInfo(table, id);
            // cc.log("9999999999999999999999999999999");
        }

        if(!this._baseInfoList[tableName][id]){
            // cc.log("表里取不到数据  tableName = "+tableName+'  id = '+id);
        }

        return this._baseInfoList[tableName][id];
    };

    public getTableDataCount(tableName){
        let count = 0;
        let table = this.getTable(tableName);
        if (table) {
            for (var key in table.tableData) {
                count ++;
            }
        }
        return count;
    }
    
    public getTableData(tableName){
        let table = this.getTable(tableName);
        if (table) {
            return table.tableData;
        }
    }
}

export const TableMgr = TableManagerClass.Instance;
