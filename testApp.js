const Container = require ('./src/DI/Container'),
      Extension = require ('./src/DI/Extension');


class Compl
{
    compile (container)
    {
        console.log('Compl ding.');
        console.log(container.findTaggedServiceIds('foo'));
    }
}

container = new Container();

container.builder.import({
    parameters: {

    },
    services: {
        'foo.bar': {
            function: function (a, b) { console.log('foo.bar', a, b); },
            tags: [{ name: 'foo' }],
            arguments: [1]
        }
    },
    extensions: [
        new Compl()
    ]
});

container.get('foo.bar');
