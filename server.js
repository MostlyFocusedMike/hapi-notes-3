const Hapi = require('hapi')

const server = new Hapi.server({
    host: 'localhost',
    port: '3103',
});

const start = async () => {

    /* load single plugin: */
    // await server.register(require('./lib/plugins/myPluginTop.js'))

    /*
        alternatively, you can pass it in as an object
        this lets you pass in options
    */
    // await server.register({
    //     plugin: require('./lib/plugins/myPluginTop.js'),
    //     options: {} // put settings and data you want to pass to your plugin here
    // });

    /* load multiple plugins: */
    await server.register([
        require('./lib/plugins/myPluginTop.js'),
        {
            plugin: require('./lib/plugins/myPluginExternal.js'),
            options: {
                msg: 'Anything here goes into the plugin',
                serverInfo: server.info
            }
        }
    ],
    /*
        server.register() takes a second optional argument, it's own options
        this options is not passed to any plugin, it's used by hapi itself
    */
    {
        routes: {
            prefix: '/plugins' /* this prefixes all routes with the given string, must start with '/' */
        }
    });

    // load routes
    server.route(require('./lib/routes/home'));
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

/* this is another way of catching errors in the server */
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

start();