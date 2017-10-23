/* APEX; Event Emitter                             _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

module.exports = class EventEmitter
{
    constructor ()
    {
        this._event_listeners = {};
    }

    on (event, callback)
    {
        this._register(event);
        this._event_listeners[event].push(callback);
    }

    /**
     * @param event
     */
    emit (event)
    {
        this._register(event);

        let args = Array.prototype.slice.call(arguments, 1);
        for (let i = 0; i < this._event_listeners[event].length; i++) {
            if (false === this._event_listeners[event][i].apply(null, args)) return;
        }
    }

    _register (event)
    {
        if (typeof this._event_listeners[event] === 'undefined') {
            this._event_listeners[event] = [];
        }
    }
}
