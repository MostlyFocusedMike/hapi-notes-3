const myPlugin = {
    /* instead of name and version properties, you can just pull in the package */
    pkg: require('../../package.json'),
    register: async function (server, options) {
        /* options comes from the options object passed into server.register() */
        server.route({
            method: 'GET',
            path: '/plugin-external',
            handler: function (request, h) {
                return { options };
            }
        });
        // etc ...
        // await someAsyncMethods();
    }
};

/* here we define our plugin as the plugin object on exports */
module.exports.plugin = myPlugin;
