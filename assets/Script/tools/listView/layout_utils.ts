//item及父节点锚点都为(0,1)
class LayoutUtil
{
    static vertical_layout(index:number, item_width:number, item_height:number, column:number = 1, gap_x:number = 0, gap_y:number = 0, anchorX:number = 0.5, anchorY:number = 0.5):[number, number]
    {
        let x:number = (index % column) * (item_width + gap_x) + item_width * anchorX;
        let y:number = -Math.floor(index / column) * (item_height + gap_y) - item_height * (1 - anchorY);
        return [x, y];
    }

    static horizontal_layout(index:number, item_width:number, item_height:number, row:number = 1, gap_x:number = 0, gap_y:number = 0, anchorX:number = 0.5, anchorY:number = 0.5):[number, number]
    {
        let x:number = Math.floor(index / row) * (item_width + gap_x) + item_width * anchorX;
        let y:number = -(index % row) * (item_height + gap_y) - item_height * (1 - anchorY);
        return [x, y];
    }
}

export = LayoutUtil;