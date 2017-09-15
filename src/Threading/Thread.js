/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

/**
 * Thread initialisation script.
 * This function is NOT executed in this scope (!), but instead it will be
 * decompiled into a blob and spawned as a worker. This function handles
 * sending/receiving data from the main process and ensures the thread-
 * function is executed.
 *
 * @internal
 * @private
 */
let _thread_proxy = () => {

    let Thread = {
        __self              : null,
        __message_listeners : []
    };

    onmessage = function (e) {
        if (typeof e.data === 'object' && e.data.type === '--init') {
            if (typeof module !== 'undefined') {
                module.paths = e.data.module_paths;
            }
            Thread.__self = new Function('onMessage, postMessage', e.data.thread_fn);
            Thread.__self.call(
                Thread,
                function (callback) { Thread.__message_listeners.push(callback); },
                function (data) { return postMessage(data); }
            );

            return;
        }
        Thread.__message_listeners.forEach((callback) => {
            callback(e.data);
        });
    };
};

/**
 * Creates a new thread for the given function.
 *
 * The function passed in the first argument will be executed on a separate
 * OS-level thread, offloading CPU resources.
 *
 * Beware that the given function does NOT have access to the same scope as
 * the main process. It can load node modules, but it does NOT have access to
 * the window or global scope like the main process does.
 *
 * @constructor
 * @param {Function} thread_f
 */
let Thread = function (thread_f)
{
    let _blob,     // The blob containing the thread proxy.
        _worker,   // The actual worker.
        _thread_t, // Thread proxy script.
        _thread_f, // Thread worker script.
        _listeners = [];

    // Ensure the environment has worker support.
    if (typeof Worker === 'undefined') {
        throw new Error('Apex.Threading requires WebWorker support.');
    }

    // Convert the thread function so it can be parsed/read/etc.
    // We need the body of the function as a string, so it can be executed inside
    // the worker. We'll need to strip off the `function() {` part or the arrow-
    // syntax one. Simply fetch every character between the first and last curly-braces.
    _thread_f = thread_f.toString();
    _thread_t = _thread_proxy.toString();
    _thread_f = _thread_f.slice(_thread_f.indexOf("{") + 1, _thread_f.lastIndexOf("}"));
    _thread_t = _thread_t.slice(_thread_t.indexOf("{") + 1, _thread_t.lastIndexOf("}"));
    _blob     = new Blob([_thread_t], {type: 'application/javascript'});

    // Public API.
    return {

        /**
         * Starts the thread. If the thread was already running, it will do nothing.
         */
        start: () => {
            if (_worker instanceof Worker) return;

            _worker = new Worker(window.URL.createObjectURL(_blob));
            _worker.onmessage = (e) => {
                _listeners.forEach((callback) => {
                    callback(e.data);
                });
            };

            _worker.postMessage({
                type         : '--init',
                module_paths : module.paths,
                thread_fn    : _thread_f
            });
        },

        /**
         * Sends the given data to the thread.
         * The thread can listen to incoming functions using the onMessage({Function}) function.
         *
         * @param {*} data
         */
        send: function (data)
        {
            if (! _worker instanceof Worker) {
                throw new Error('Thread is not running.');
            }

            _worker.postMessage(data);
        },

        /**
         * Executes the given callback when a message from the thread is received.
         * Messages are sent back using the postMessage({*}) method.
         *
         * @param {Function} callback
         */
        onMessage: function (callback)
        {
            if (typeof callback !== 'function') {
                throw new Error('Callback expected to be of type "function", got "' + typeof callback + '" instead.');
            }

            _listeners.push(callback);
        },

        /**
         * Returns true if the thread is running.
         *
         * @returns {Boolean}
         */
        isRunning: () => {
            return _worker instanceof Worker;
        },

    };
};

module.exports = Thread;
