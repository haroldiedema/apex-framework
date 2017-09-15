/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

let ipc;
if (typeof window !== 'object') {
    // Main process.
    ipc = require('electron').ipcMain;
} else {
    // Render process
    ipc = require('electron').ipcRenderer;
}

let IPC = {
    __listeners : [],

    /**
     * @var {boolean}
     */
    isMain : typeof window === 'undefined',

    /**
     * Executes the given callback when a message of {type} is sent.
     *
     * @param {String}   type
     * @param {Function} callback
     */
    onMessage: function (type, callback) {
        IPC.__listeners.push({ type: type, callback: callback });
    },

    /**
     * Sends a data packet of the given type and returns the response.
     *
     * If {async} is set to true, the message is sent asynchronously, not waiting for a response.
     * This value defaults to false, so the send() method will wait for- and return the response of
     * the executed method.
     *
     * @param   {String}  type
     * @param   {*}       data
     * @param   {boolean} async
     * @returns {*}
     */
    send: function (type, data, async) {
        data = data || {};
        if (async) {
            return ipc.send('message', { type: type, data: data });
        }

        return ipc.sendSync('message', { type: type, data: data });
    }
};

ipc.on('message', (event, arg) => {
    if (typeof arg !== 'object') {
        throw new Error('IPC data packet is expects an object, got ' + typeof arg + ' instead.');
    }

    let rval, r;
    IPC.__listeners.forEach((i) => {
        if (i.type === arg.type) {
            r = i.callback(arg.data);
            if (r) {
                rval = r;
            }
        }
    });
    rval = rval || null;

    event.returnValue = rval;
});

module.exports = IPC;
