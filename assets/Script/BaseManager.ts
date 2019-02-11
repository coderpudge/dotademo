

class BaseManagerClass{

    public static readonly Instance: BaseManagerClass = new BaseManagerClass();

    private constructor() {
        
    };   
}

export const BaseManager = BaseManagerClass.Instance;
