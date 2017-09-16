/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

window.Apex = require('../apex.js');
window.$    = require('jquery');

// Load the entry script.
Apex.IPC.onMessage('__entryMain', (data) => {

    Apex.Profile = new Apex.Map(Apex.IPC.send('profile.load'));
    if (! Apex.Profile.has('userProfile')) {
        Apex.Profile.set('userProfile', require('os').userInfo());
        Apex.IPC.send('profile.save', Apex.Profile.all());
    }

    Apex.Platform = new Apex.DI.Platform(Apex.Profile.get('PACKAGE_ROOT'), Apex.Profile);

    let script = document.createElement('script');
    $.get(data.url, (js) => {
        script.innerHTML = js;
        $('head').append(script);
    });
});
