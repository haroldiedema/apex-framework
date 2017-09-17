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
      os   = require('os'),
      path = require('path'),
      dir  = app.getPath('userData'),
      file = path.join(dir, 'profile.json');

let profile = new Map();

// Load existing profile first.

// Always update user profile info, in case the app was moved or is being
// used by another user on the same computer.
profile.set('userProfile', {
    username     : os.userInfo().username,
    hostname     : os.hostname(),
    platform     : os.platform(),
    architecture : os.arch(),
    homedir      : os.homedir(),
});

/**
 * Loads userdata into this profile map.
 */
profile.loadUserData = function () {
    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir);
    }
    if (fs.existsSync(file) === false) {
        fs.writeFileSync(file, JSON.stringify({}));
    }
    profile.merge(JSON.parse(fs.readFileSync(file).toString()));
};

profile.saveUserData = function () {
    fs.writeFileSync(file, JSON.stringify(profile.all()));
};

if (IPC.isMain) {
    IPC.onMessage('profile.load', () => {
        profile.loadUserData();
        return profile.all();
    });
    IPC.onMessage('profile.save', (data) => {
        profile.merge(data);
        fs.writeFileSync(file, JSON.stringify(profile.all()));
    });
}

profile.loadUserData();
module.exports = profile;
