/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

const {app, BrowserWindow} = require('electron'),
      path                 = require('path'),
      Map                  = require('./Map'),
      IPC                  = require('./IPC');

let _hwnd_url = '';
IPC.onMessage('_hwndGetURL', () => {
    return _hwnd_url;
});

/**
 * @constructor
 *
 * @param {Object}   user_config
 * @param {String}   url
 * @param {Function} callback
 */
let Window = function (user_config, url, callback)
{
    url      = url      || 'about:blank';
    callback = callback || function () {};

    let _hwnd, config = new Map({
        width            : 1440,
        height           : 900,
        minWidth         : 800,
        minHeight        : 600,
        show             : false,
        center           : false,
        minimizable      : true,
        maximizable      : true,
        resizable        : true,
        closable         : true,
        focusable        : true,
        fullscreenable   : true,
        fullscreen       : false,
        skipTaskbar      : false,
        kiosk            : false,
        title            : '',
        icon             : undefined,
        acceptFirstMouse : false,
        backgroundColor  : '#222222',
        hasShadow        : true,
        transparent      : false,
        thickFrame       : true,
        useContentSize   : true,
        vibrancy         : 'dark',
        zoomToPageWidth  : false,
        webPreferences   : {
            devTools                : user_config.debug,
            nodeIntegration         : true,
            nodeIntegrationInWorker : true,
            javascript              : true,
            webSecurity             : true,
            images                  : true,
            webgl                   : true,
            webaudio                : true,
            plugins                 : false,
            scrollBounce            : false,
            defaultFontSize         : '12px',
            preload                 : path.join(__dirname, 'Window', 'ApexWindow.js'),
        }
    });

    config.merge(user_config || {});
    config    = config.all();

    app.on('ready', () => {
        _hwnd = new BrowserWindow(config);
        _hwnd.setMenu(null);
        _hwnd.on('ready-to-show', () => {
            _hwnd.webContents.send('message', {type: '__entryMain', data: {url: url}});
            _hwnd.show();
            callback(_hwnd);

            if (user_config.debug === true) {
                _hwnd.webContents.openDevTools();
            }
        });
        _hwnd.loadURL('file://' + url);

        IPC.onMessage('window.requestPointerLock', () => {
            _hwnd.webContents.executeJavaScript('document.body.requestPointerLock();', true);
        });
        IPC.onMessage('window.setFullScreen', (e) => {
            _hwnd.setFullScreen(e.state || false);
        });
    });

    app.on('window-all-closed', () => {
        app.quit();
    });
};

module.exports = Window;
