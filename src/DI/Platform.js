/* APEX; Platform Class                            _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

const
    Container = require('./Container'),
    Profile   = require('../Profile'),
    fs        = require('fs'),
    path      = require('path');

class Platform
{
    constructor(base_dir)
    {
        // The service container.
        this._container = new Container();
        this._container.set('profile', Profile);

        fs.readdirSync(base_dir).forEach((filename) => {
            let file = path.resolve(path.join(base_dir, filename)),
                info = path.parse(file),
                stat = fs.statSync(file),
                modf = path.join(file, 'module.js');

            if (stat.isDirectory() && fs.existsSync(modf)) {
                this._container.builder.import(require(modf));
            }
        });
    }

    getContainer()
    {
        return this._container;
    }
}

module.exports = Platform;
