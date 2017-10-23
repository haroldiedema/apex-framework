/* APEX; Framework Package                         _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

module.exports = {
    // Utilities
    Collection:   require('./Collection'),
    Map:          require('./Map'),
    Profile:      require('./Profile'),
    Window:       require('./Window'),
    IPC:          require('./IPC'),
    EventEmitter: require('./EventEmitter'),

    // Dependency Injection (IoC)
    DI: {
        Container:  require('./DI/Container'),
        Extension:  require('./DI/Extension'),
        Definition: require('./DI/Definition'),
        Platform:   require('./DI/Platform')
    },

    // Threading capabilities
    Threading: {
        Thread: require('./Threading/Thread')
    }
};
