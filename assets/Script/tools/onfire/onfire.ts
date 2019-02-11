

class onfireClass {

    public static readonly Instance: onfireClass = new onfireClass();

    private listeners:any;          
    private __onfireEvents: any = {};
    private __cnt: number = 0; // evnet counter
    private string_str: string = 'string';
    private function_str: string = 'function';
    private hasOwnKey = Function.call.bind(Object.hasOwnProperty);
    private slice = Function.call.bind(Array.prototype.slice);

    private constructor() {

    }

    private _bind(eventName, callback, is_one, context) {
        if (typeof eventName !== this.string_str || typeof callback !== this.function_str) {
            throw new Error('args: '+ this.string_str + ', ' + this.function_str + '');
        }

        if (!this.hasOwnKey(this.__onfireEvents, eventName)) {
            this.__onfireEvents[eventName] = {};
        }
        this.__onfireEvents[eventName][++this.__cnt] = [callback, is_one, context];

        return [eventName, this.__cnt];
    }

    private _each(obj, callback) {
        for (var key in obj) {
            if (this.hasOwnKey(obj, key)) {
                callback(key, obj[key]);
            }
        }
    }

    private _fire_func(eventName, args) {
        if (this.hasOwnKey(this.__onfireEvents, eventName)) {
            this._each(this.__onfireEvents[eventName], function(key, item) {
                item[0].apply(item[2], args); // do the function
                if (item[1]) {
                    delete this.__onfireEvents[eventName][key]; // when is one, delete it after triggle
                }
            });
        }
    }
    
    /**
    *  onfire.on( event, func, context ) -> Object
    *  - event (String): The event name to subscribe / bind to
    *  - func (Function): The function to call when a new event is published / triggered
    *  Bind / subscribe the event name, and the callback function when event is triggered, will return an event Object
    **/
    public on(eventName: string, callback: Function, context?: any) {
        return this._bind(eventName, callback, 0, context);
    }
    /**
    *  onfire.one( event, func, context ) -> Object
    *  - event (String): The event name to subscribe / bind to
    *  - func (Function): The function to call when a new event is published / triggered
    *  Bind / subscribe the event name, and the callback function when event is triggered only once(can be triggered for one time), will return an event Object
    **/
    public one(eventName: string, callback: Function, context?: any) {
        return this._bind(eventName, callback, 1, context);
    }

    
    /**
    *  onfire.fire( event[, data1 [,data2] ... ] )
    *  - event (String): The event name to publish
    *  - data...: The data to pass to subscribers / callbacks
    *  Async Publishes / fires the the event, passing the data to it's subscribers / callbacks
    *  同步
    **/
    public fire(eventName: string, ...param: any[]) {
        // fire events
        this._fire_func(eventName, param);
    }

    /**
    *  onfire.fireAsync( event[, data1 [,data2] ... ] )
    *  - event (String): The event name to publish
    *  - data...: The data to pass to subscribers / callbacks
    *  Sync Publishes / fires the the event, passing the data to it's subscribers / callbacks
    *  异步
    **/
    public fireAsync(eventName: string, ...param: any[]) {
        setTimeout(function () {
            this._fire_func(eventName, param);
        });
    }

    /**
    * onfire.un( event ) -> Boolean
    *  - event (String / Object): The message to publish
    * When passed a event Object, removes a specific subscription.
    * When passed event name String, removes all subscriptions for that event name(hierarchy)
    *
    * Unsubscribe / unbind an event or event object.
    *
    * Examples
    *
    *  // Example 1 - unsubscribing with a event object
    *  var event_object = onfire.on('my_event', myFunc);
    *  onfire.un(event_object);
    *
    *  // Example 2 - unsubscribing with a event name string
    *  onfire.un('my_event');
    **/
    public un(event: any) {
        let eventName, key, r = false, type = typeof event;
        if (type === this.string_str) {
            // cancel the event name if exist
            if (this.hasOwnKey(this.__onfireEvents, event)) {
                delete this.__onfireEvents[event];
                return true;
            }
            return false;
        }
        else if (type === 'object') {
            eventName = event[0];
            key = event[1];
            if (this.hasOwnKey(this.__onfireEvents, eventName) && this.hasOwnKey(this.__onfireEvents[eventName], key)) {
                delete this.__onfireEvents[eventName][key];
                return true;
            }
            // can not find this event, return false
            return false;
        }
        else if (type === this.function_str) {
            this._each(this.__onfireEvents, function(key_1, item_1) {
                this._each(item_1, function(key_2, item_2) {
                    if (item_2[0] === event) {
                        delete this.__onfireEvents[key_1][key_2];
                        r = true;
                    }
                });
            });
            return r;
        }
        return true;
    }

    /**
    *  onfire.clear()
    *  Clears all subscriptions
    **/
    public clear() {
        this.__onfireEvents = {};
    }
}

export const onfire = onfireClass.Instance;
