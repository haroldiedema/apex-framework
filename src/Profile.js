/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

if (! require('./IPC').isMain) {
    return {};
}

const Map  = require('./Map'),
      app  = require('electron').app,
      IPC  = require('./IPC'),
      fs   = require('fs'),
      path = require('path'),
      dir  = app.getPath('userData'),
      file = path.join(dir, 'profile.json');

let profile = new Map();

if (fs.existsSync(dir) === false) {
    fs.mkdirSync(dir);
}
if (fs.existsSync(file) === false) {
    fs.writeFileSync(file, JSON.stringify({}));
}

profile.merge(JSON.parse(fs.readFileSync(file).toString()));

if (IPC.isMain) {
    IPC.onMessage('profile.load', () => {
        return profile.all();
    });
    IPC.onMessage('profile.save', (data) => {
        profile.merge(data);
        fs.writeFileSync(file, JSON.stringify(profile.all()));
    });
}

module.exports = profile;
