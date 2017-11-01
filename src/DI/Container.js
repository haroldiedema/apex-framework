/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

function Container ()
{
    let Map        = require('../Map'),
        Collection = require('../Collection'),
        Definition = require('./Definition'),
        Extension  = require('./Extension');

    let _extensions  = new Collection(),
        _loading     = new Collection(),
        _services    = new Map(),
        _parameters  = new Map(),
        _definitions = new Map(),
        _compiled    = false,
        _compiling   = false;

    // Public API & Builder API
    let _api     = {},
        _builder = {};

    /**
     * Compiles the container.
     */
    let _compile = function () {
        if (_compiling) {
            throw new Error('You cannot fetch a service from a container that is in the process of being compiled.');
        }
        _compiling = true;
        _extensions.each(function (extension) {
            extension.compile(this);
        }.bind(this));
    }.bind(_api);

    /**
     * Imports the given data structure into this container.
     *
     * @param {Object} data
     */
    _builder.import = function (data)
    {
        data.services   = data.services   || {};
        data.parameters = data.parameters || {};
        data.extensions = data.extensions || [];

        for(let id in data.services) {
            if (data.services.hasOwnProperty(id) === false) continue;
            _builder.setDefinition(id, new Definition(data.services[id]));
        }

        for (let name in data.parameters) {
            if (data.parameters.hasOwnProperty(name) === false) continue;
            _parameters.set(name, data.parameters[name]);
        }

        data.extensions.forEach((extension) => {
            if (typeof extension.compile !== 'function') {
                throw new Error('Extension "' + extension.constructor.name + '" must implement a compile() function.');
            }
            _extensions.add(new Extension(extension.compile));
        });
    };

    /**
     * Adds or updates a definition in the container.
     *
     * @param {String}     id
     * @param {Definition} definition
     */
    _builder.setDefinition = function (id, definition)
    {
        if (! definition instanceof Definition) {
            throw new Error('addDefinition expects an instance of Definition, ' + typeof definition + ' given.');
        }

        _definitions.set(id, definition);
    };

    /**
     * Adds an extension to this container.
     *
     * An extension contains a callback function which is executed once the container is being compiled, allowing for
     * last-minute modifications to registered definitions before the container is finalized.
     *
     * @param {Extension} extension
     */
    _builder.addExtension = function (extension)
    {
        if (! (extension instanceof Extension)) {
            throw new Error('addExtension expects an instance of Extension, ' + typeof extension + ' given.');
        }

        _extensions.add(extension);
    };

    /**
     * Returns a list of service ID's that are tagged by the given name.
     *
     * @param name
     * @returns {Array}
     */
    _api.findTaggedServiceIds = function (name)
    {
        // console.log(_definitions.all());
        let tags, service_ids = [];
        Object.keys(_definitions.all()).forEach((id) => {
            tags = _definitions.get(id).getTags().all();
            tags.forEach((tag) => {
                if (tag.name === name) service_ids.push(id);
            });
        });

        return service_ids;
    }

    /**
     * Sets a service.
     *
     * @param {String} id      The service identifier
     * @param {Object} service The service instance
     */
    _api.set = function (id, service)
    {
        _services.set(id, service);
    };

    /**
     * Gets a service.
     *
     * @param {String} id
     * @returns {Object}
     */
    _api.get = function (id)
    {
        if (! _compiled) {
            _compiled = true;
            _compile();
        }

        // Circular reference detection.
        if (_loading.contains(id)) {
            throw new Error(
                'Circular reference detected while loading service "' + id + '" : ' + _loading.all().join(' -> ')
            );
        }

        // If the service was already initialized, return the initialized service.
        if (_services.has(id)) {
            return _services.get(id);
        }

        // Make sure a definition for the service exists.
        if (_definitions.has(id) === false) {
            if (_loading.count() > 0) {
                throw new Error('Service "' + id + '" does not exist, requested by "' + _loading.last() + '".');
            }

            throw new Error('Service "' + id + '" does not exist.');
        }

        // Initialize the service.
        _loading.add(id);
        _services.set(id, _definitions.get(id)._initialize(this));
        _loading.remove(id);

        // Return the initialized service.
        return _services.get(id);
    };

    /**
     * Returns true if the given service is defined.
     *
     * @param   {String} id
     * @returns {Boolean}
     */
    _api.has = function (id)
    {
        return _definitions.has(id);
    };

    /**
     * Check for whether or not a service has been initialized.
     *
     * @param   {String} id
     * @returns {Boolean}
     */
    _api.initialized = function (id)
    {
        return _services.has(id);
    };

    /**
     * Gets a parameter.
     *
     * @param   {String} name The parameter name
     * @returns {*}
     */
    _api.getParameter = function (name)
    {
        return _parameters.get(name);
    };

    /**
     * Returns the parameters map.
     *
     * @returns {Map}
     */
    _api.getParameters = function ()
    {
        return _parameters;
    };

    /**
     * Checks if a parameter exists.
     *
     * @param   {String} name The parameter name
     * @returns {Boolean} The presence of parameter in container
     */
    _api.hasParameter = function (name)
    {
        return _parameters.has(name);
    };

    /**
     * Sets a parameter.
     *
     * @param {String}  name  The parameter name
     * @param {*}       value The parameter value
     * @param {Boolean} is_locked True to lock the parameter to prevent further modification (only works on new params)
     */
    _api.setParameter = function (name, value, is_locked)
    {
        _parameters.set(name, value, is_locked);
    };

    /**
     * The Builder API contains methods for building the container. Any usage of methods in this object are prohibited
     * once the container has been compiled and/or is frozen.
     *
     * @type {{}}
     */
    _api.builder = _builder;

    return _api;
}

module.exports = Container;
