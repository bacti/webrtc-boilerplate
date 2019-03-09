const EventEmitter3 = require('eventemitter3')

class EventEmitter extends EventEmitter3
{
    on(event, fn, context)
    {
        if (this._events && this._events.params && this._events.params[event])
        {
            fn.apply(context, this._events.params[event])
        }
        return super.on(event, fn, context)
    }

    once(event, fn, context)
    {
        if (this._events && this._events.params && this._events.params[event])
        {
            fn.apply(context, this._events.params[event])
            return this
        }
        return super.once(event, fn, context)
    }

    emit(event, a1, a2, a3, a4, a5)
    {
        if (!super.emit(event, a1, a2, a3, a4, a5))
        {
            this._events = this._events || {}
            this._events[event] = []
        }
        this._events.params = this._events.params || {}
        this._events.params[event] = [...arguments].slice(1)
    }
}
module.exports = EventEmitter
