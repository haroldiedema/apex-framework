/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

function Collection (items)
{
    items = items || [];

    if (items.constructor !== Array) {
        throw new TypeError('Collection expects an array, got ' + typeof items + ' instead.');
    }
    let _data = items || [];

    return {
        /**
         * Returns the amount of items in this collection.
         *
         * @returns {Number}
         */
        count: function ()
        {
            return _data.length;
        },

        /**
         * Returns the first item in this collection.
         *
         * @returns {*}
         */
        first: function ()
        {
            return _data[0];
        },

        /**
         * Returns the last item from this collection.
         *
         * @returns {*}
         */
        last: function ()
        {
            return _data[_data.length - 1];
        },

        /**
         * Adds the given value to this collection as a new item.
         * An error is thrown if an item of the exact same value already exists in this collection.
         *
         * @param {*} item
         */
        add: function (item)
        {
            if (true === this.contains(item)) {
                throw new Error('The given item already exists in this collection.');
            }

            _data.push(item);
        },

        /**
         * Returns an item with the given index. Throws an error if the requested index is out of range.
         *
         * @param {Number} index
         */
        get: function (index)
        {
            if (typeof _data[index] === 'undefined') {
                throw new Error('Index #' + index + ' is out of range of 0-' + (_data.length - 1) + '.');
            }

            return _data[index];
        },

        /**
         * Updates a value at the given index. Throws an error if the requested index is out of range.
         *
         * @param {Number} index
         * @param {*}      value
         */
        set: function (index, value)
        {
            if (typeof _data[index] === 'undefined') {
                throw new Error('Index #' + index + ' is out of range of 0-' + (_data.length - 1) + '.');
            }

            _data[index] = value;
        },

        /**
         * Returns the reference to the raw collection as an Array.
         *
         * @returns {Array}
         */
        all: function ()
        {
            return _data;
        },

        /**
         * Iterates over every item in this collection. For every item the givne callback function is executed with the
         * value of the current item as the first argument and this collection instance as the second.
         *
         * Example:
         *      let col = new Rise.Collection(['foo', 'bar']);
         *      col.each(function (value, collection) {
         *          if (value === 'foo') {
         *              collection.remove(value);
         *          }
         *      });
         *
         * @param {Function} callback
         */
        each: function (callback)
        {
            if (typeof callback !== 'function') {
                throw new TypeError('Rise.Collection.each requires a function, got ' + typeof callback + ' instead.');
            }

            for (let i = 0; i < _data.length; i++) {
                if (_data.hasOwnProperty(i) === false) continue;
                callback(_data[i], i, this);
            }
        },

        /**
         * Removes the given item from this collection.
         *
         * @param item
         */
        remove: function (item)
        {
            if (false === this.contains(item)) {
                throw new Error('The given item does not exist in this collection.');
            }

            for (let _item in _data) {
                if (_data.hasOwnProperty(_item) === false) continue;
                if (_data[_item] === item) {
                    _data.splice(_data.indexOf(item), 1);
                }
            }
        },

        /**
         * Returns true if the given item exists in this collection.
         *
         * @param   {*} item
         * @returns {Boolean}
         */
        contains: function (item)
        {
            for (let _item in _data) {
                if (_data.hasOwnProperty(_item) === false) continue;
                if (_data[_item] === item) {
                    return true;
                }
            }
            return false;
        }
    };
}

module.exports = Collection;
