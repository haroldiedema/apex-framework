console.log('Even testen.');

$('body').html('Yeey, we hebben jQuery.');

let thread = new Apex.Threading.Thread((onMessage, postMessage) => {

    let to_add = [];

    onMessage((data) => {
        console.log(data);
        to_add = data;
        let r = 0;
        to_add.forEach((i) => {
            r += i;
        });
        postMessage(r);
    });
});

thread.start();
thread.send([1, 2]);
thread.onMessage((data) => {
    console.log("FROM THREAD: ", data);
});
