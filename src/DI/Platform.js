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

    /**
     * Returns the service with the given ID.
     * Throws an error if the service cannot be found or could not be instantiated/loaded.
     *
     * @param   {String} id
     * @returns {Object}
     */
    get(id)
    {
        return this._container.get(id);
    }

    /**
     * Sets a parameter by the given name and value.
     *
     * @param {String} name
     * @param {*}      value
     */
    setParameter(name, value)
    {
        this._container.setParameter(name, value);
    }

    /**
     * Returns a parameter value by the given name.
     *
     * @param {String} name
     */
    getParameter(name)
    {
        this._container.getParameter(name);
    }
}

module.exports = Platform;
