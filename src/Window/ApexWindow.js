/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

const fs = require('fs');

let ready                = false,
    ready_listener_stack = [];

window.Apex = require('../apex.js');

Apex.ready = (callback) => {
    if (ready) {
        return callback();
    }
    ready_listener_stack.push(callback);
};

window.addEventListener('load', ()  => {
    Apex.Profile  = new Apex.Map(Apex.IPC.send('profile.load'));
    Apex.Platform = new Apex.DI.Platform(Apex.Profile.get('PACKAGE_ROOT'), Apex.Profile);

    $('html, body').css({
        position: 'relative',
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    });

    if (! Apex.Profile.has('userProfile')) {
        Apex.Profile.set('userProfile', require('os').userInfo());
        Apex.IPC.send('profile.save', Apex.Profile.all());
    }

    ready = true;
    ready_listener_stack.forEach((e) => {
        e();
    });
    ready_listener_stack = [];
});
