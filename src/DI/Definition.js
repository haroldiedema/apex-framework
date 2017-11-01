/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

/**
 * Represents a definition of a service for a dependency-injection container.
 */
function Definition (config)
{
    let Collection = require('../Collection'),
        Container  = require('./Container');

    config = config || {};

    let _arguments    = new Collection(config['arguments'] || []),
        _method_calls = new Collection(config.method_calls || []),
        _tags         = new Collection(config.tags         || []),
        _initialized  = false,
        _service;

    /**
     * @param {Container}        container
     * @param {Array|Collection} args
     * @private
     */
    let _resolve_arguments = function (args, container)
    {
        if (! args instanceof Collection) {
            args = new Collection(args);
        }

        args.each(function (arg, index, collection) {
            // Find and inject parameter references
            if (typeof arg !== 'string') {
                return;
            }

            container.getParameters().each(function (param, value) {
                arg = arg.replace(new RegExp('%' + param + '%', 'g'), value);
                if (! isNaN(arg)) {
                    arg = +(parseFloat(arg));
                }
            });

            // Service reference
            if (arg.toString().charAt(0) === '@') {
                arg = container.get(arg.substr(1));
            }

            collection.set(index, arg);
        });

        return args;
    };

    /**
     * Resolves the given ID as a function from the given scope.
     *
     * @param {String} id            The function name to look for
     * @param {Object} scope         The scope to look in (defaults to "global" or "window")
     * @param {String} fqn           Fully-Qualified-Name (optional)
     * @param {String} expected_type Expected result type (defaults to 'function')
     * @private
     */
    let _resolve = function (id, scope, fqn, expected_type)
    {
        scope = scope || (typeof global === 'object' ? global : window);
        fqn   = fqn || id;
        expected_type = expected_type || 'function';

        let chunks = id.split('.'),
            chunk,
            resolved = [(typeof global === 'object' ? 'global' : 'window')];

        while(chunk = chunks.shift()) {
            if (typeof scope[chunk] === 'undefined') {
                throw new Error('Unable to resolve "' + chunk + '" from "' + resolved + '"');
            }
            scope     = scope[chunk];
            resolved += '.' + chunk;
        }

        if (typeof scope !== expected_type) {
            throw new Error(
                'Expected "' + resolved + '" to resolve as ' + expected_type + ', got ' + typeof scope + ' instead.'
            );
        }

        return scope;
    };

    // Public API
    return {

        /**
         * @param {Container} container
         * @private
         */
        _initialize: function (container)
        {
            if (_initialized === true) return _service;

            // Arguments to pass to the constructor of the function.
            _arguments = _resolve_arguments(_arguments, container);

            // Initializer
            let _initializer = function (fn, args) {
                return new (Function.prototype.bind.apply(fn, args));
            };

            // Resolve the constructor function.
            let service, _args = _arguments.all();
            _args.unshift(null);

            if (typeof config.function === 'function') {
                // A native function was declared in the definition.
                service = _initializer(config.function, _args);
            } else if (typeof config.function === 'string') {
                // Resolve the function from a string (from the global scope)
                service = _initializer(_resolve(config.function, undefined, undefined, 'function'), _args);
            } else if (typeof config.module === 'object') {
                if (typeof config.function === 'undefined' && typeof config.factory === 'undefined') {
                    service = config.module;
                } else if (typeof config.function === 'string') {
                    if (typeof module[config.function] !== 'function') {
                        throw new Error(
                            'The function "' + config.function + '" does not exist in module "' + config.module + '.'
                        );
                    }
                    service = _initializer(module[config.function], _args);
                } else if (typeof config.factory_method === 'string') {
                    if (typeof module[config.factory_method] !== 'function') {
                        throw new Error(
                            'The factory function "' + config.factory_method + '" does not exist in module "' + config.module + '.'
                        );
                    }
                    _args.shift();
                    service = config.module[config.factory].apply(null, _args);
                } else {
                    throw new Error(
                        'Unable to determine how to instantiate service from node module "' + config.module + '".'
                    );
                }
            } else if (typeof config.module === 'string') {
                // Resolving from a module can happen in 2 ways:
                //  1: config.function is undefined; require(...) must return a function.
                //  2: config.function is a string; require(...) returns an object where {config.function} is the
                //     function to instantiate from the returned object.
                //  3: config.factory_method is a string; require(...) must return an object where
                //     {config.factory_method} is a function that returns an object.
                config.module = require(config.module);

                if (typeof module === 'object' && typeof config.function === 'undefined' && typeof config.factory === 'undefined') {
                    service = config.module;
                } else if (typeof config.function === 'string') {
                    if (typeof module[config.function] !== 'function') {
                        throw new Error(
                            'The function "' + config.function + '" does not exist in module "' + config.module + '.'
                        );
                    }
                    service = _initializer(module[config.function], _args);
                } else if (typeof config.factory_method === 'string') {
                    if (typeof module[config.factory_method] !== 'function') {
                        throw new Error(
                            'The factory function "' + config.factory_method + '" does not exist in module "' + config.module + '.'
                        );
                    }
                    _args.shift();
                    service = config.module[config.factory].apply(null, _args);
                } else {
                    throw new Error(
                        'Unable to determine how to instantiate service from node module "' + config.module + '".'
                    );
                }
            } else if (typeof config.factory !== 'undefined') {
                // Resolve the factory.
                let factory;
                if (typeof config.factory === 'object') {
                    factory = config.factory;
                } else if (typeof config.factory === 'string') {
                    factory = _resolve(config.factory, undefined, undefined, 'object');
                } else {
                    throw new Error('the "factory" setting must be an object or string, got ' + typeof config.factory);
                }
                if (typeof config.factory_method !== 'string') {
                    throw new Error('The "factory_method" setting must be a string, got ' +  typeof config.factory_method);
                }
                if (typeof factory[config.factory_method] !== 'function') {
                    throw new Error('The factory method "' + config.factory_method + '" does not exist in factory "' + config.factory + '".');
                }
                _args.shift();
                service = factory[config.factory_method].apply(null, _args);
            }

            if (typeof service !== 'object') {
                throw new Error('Unable to initialize service. Make sure either a function, factory or module is configured and that it results in an object once initialized.');
            }

            _initialized = true;
            _service     = service;

            _method_calls.each(function (call) {
                let method = call[0],
                    args   = _resolve_arguments(new Collection(call[1] || []), container);

                if (typeof service[method] !== 'function') {
                    throw new Error('Unable to execute method call "' + method + '", because it is ' + typeof method);
                }

                service[method].apply(null, args.all());
            });

            return service;
        },

        /**
         * Overrides all arguments with the given ones.
         *
         * @param {Array} args
         */
        setArguments: function (args)
        {
            _arguments = new Collection(args);
        },

        /**
         * Returns the arguments collection for this service definition.
         *
         * @returns {Collection}
         */
        getArguments: function ()
        {
            return _arguments;
        },

        /**
         * Returns the defined tags.
         *
         * @returns {Collection}
         */
        getTags: function ()
        {
            return _tags;
        }
    };
}

module.exports = Definition;
