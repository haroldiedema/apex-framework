const Window = require('./src/apex').Window;

let win = new Window({title: "APEX test", debug: true}, 'file://' + __dirname + '/testApp.js', (hwnd) => {});

