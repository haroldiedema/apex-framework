/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

function Map (items)
{
    let _data,
        _is_frozen,
        _is_locked = {}, // Hash-maps are faster than arrays for lookups.
        _merge,
        _clone,
        _prepend;

    // Hydrate the _data array if an object was passed to the constructor.
    items = items || {};

    if (typeof items !== 'object' || items.constructor === Array) {
        throw new Error('Map requires an object (hash-map).');
    }

    /**
     * Merges {src} into {target} recursively.
     *
     * @param target
     * @param src
     * @private
     */
    _merge = function (target, src)
    {
        if (typeof src.all === 'function') {
            src = src.all();
        } else {
            src = _clone(src);
        }

        for (let i in src) {
            if (src.hasOwnProperty(i) === false) continue;
            if (typeof target[i] === 'undefined') {
                target[i] = src[i];
            } else if (typeof target[i] === 'object') {
                if (typeof src[i] === 'object') {
                    // Both sides are objects. Merge it.
                    _merge(target[i], src[i]);
                } else {
                    // Source isn't an object. Inverse merge.
                    // @FIXME: What is this tmp variable for?
                    let tmp = target[i];
                    target[i] = src[i];
                    _merge(target[i], src[i]);
                }
            } else {
                target[i] = src[i];
            }
        }
    };

    /**
     * @param source
     * @returns {*}
     * @private
     */
    _clone = function (source)
    {
        let clone, i;
        if (Object.prototype.toString.call(source) === '[object Array]') {
            clone = [];
            for (i = 0; i < source.length; i++) {
                clone[i] = _clone(source[i]);
            }

            return clone;
        } else if (typeof source === 'object') {
            clone = {};
            for (let prop in source) {
                if (source.hasOwnProperty(prop)) {
                    clone[prop] = _clone(source[prop]);
                }
            }
            return clone;
        } else {
            return source;
        }
    };

    /**
     * @param {Object} target
     * @param {Object} object
     * @private
     */
    _prepend = function (target, object)
    {
        for (let key in object) {
            if (object.hasOwnProperty(key) === false) continue;
            if (typeof target[key] === 'undefined') {
                target[key] = object[key];
            } else {
                // Recursive merge.
                _prepend(target[key], object[key]);
            }
        }
    };

    // Apply the given items to _data.
    _data = _clone(items);

    // Public API.
    return {
        /**
         * Returns a dereferenced version of this map as a native object.
         *
         * @returns {Object}
         */
        all: function ()
        {
            return _clone(_data);
        },

        /**
         * Returns true if an element with the given name exists within this map.
         *
         * @param {String} name
         * @returns {Boolean}
         */
        has: function (name)
        {
            return typeof _data[name] !== 'undefined';
        },

        /**
         * Returns an element with the given name from this map. If the
         * requested element does not exist in this map, an error is thrown.
         *
         * @param   {String} name
         * @returns {*}
         */
        get: function (name)
        {
            if (typeof _data[name] === 'undefined') {
                throw new Error('Attempt to retrieve undefined item "' + name + '" from map.');
            }

            return _data[name];
        },

        /**
         * Removes the item with the given name from this map. If the item is
         * locked, or the map is frozen, an error is thrown.
         *
         * @param {String} name
         */
        remove: function (name)
        {
            if (_is_frozen) {
                throw new Error('Unable to remove item "' + name + '" because the map is frozen.');
            }

            if (typeof _data[name] === 'undefined') {
                throw new Error('Unable to remove item "' + name + '" because it does not exist in this map.');
            }

            if (typeof _is_locked[name] !== 'undefined' && _is_locked[name] === true) {
                throw new Error('Unable to remove item "' + name + '" from the map, because this item is locked.');
            }

            delete _data[name];
        },

        /**
         * Creates or updates an item in this collection with the given name and value. If an element with the same name
         * already exists, and that item appears to be locked, an error is thrown.
         *
         * If this is a new item, setting is_locked is permitted. When this value is set to TRUE, all further
         * modifications of this item is prohibited. Locking an item that already exists is not allowed to prevent parts
         * of the code breaking other components that rely on item modification of their own items.
         *
         * If the entire map is frozen (e.g. freeze() was called previously), an error is thrown.
         *
         * @param {String}  name
         * @param {*}       value
         * @param {Boolean} is_locked
         */
        set: function (name, value, is_locked)
        {
            if (_is_frozen === true) {
                throw new Error('Modifying a frozen map is prohibited.');
            }

            if (typeof _is_locked[name] !== 'undefined' && _is_locked[name] === true) {
                throw new Error('Unable to modify locked item "' + name + '" in this map.');
            }

            if (is_locked === true && typeof _data[name] !== 'undefined') {
                throw new Error('Unable to lock existing item "' + name + '" in this map.');
            }

            _data[name] = value;
            if (is_locked === true) {
                _is_locked[name] = true;
            }
        },

        /**
         * Freezes this map, prohibiting further modifications to this map. A frozen map cannot be unfrozen.
         */
        freeze: function ()
        {
            _is_frozen = true;
        },

        /**
         * Merges (and dereferences) the given object into this Map.
         *
         * @param object
         */
        merge: function (object)
        {
            if (typeof object !== 'object') {
                throw new Error('Argument #1 of Map.merge must be an object, ' + typeof object + ' given.');
            }
            _merge(_data, object);
        },

        /**
         * Merges the given object into this map, without overwriting any existing values.
         *
         * @param {Object} object
         */
        prepend: function (object)
        {
            if (_is_frozen === true) {
                throw new Error('Modifying a frozen map is prohibited.');
            }

            _prepend(_data, object);
        },

        /**
         * Iterates over this map, executing the given callback for every found item.
         * The following arguments are passed to the callback: key, value, map instance.
         *
         * @param {Function} callback
         */
        each: function (callback)
        {
            for (let key in _data) {
                if (_data.hasOwnProperty(key) === false) continue;
                callback(key, _data[key], this);
            }
        }
    };
}

module.exports = Map;
