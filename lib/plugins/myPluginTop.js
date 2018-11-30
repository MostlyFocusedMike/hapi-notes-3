const myPlugin = {
    name: 'myPlugin',
    version: '1.0.0',
    register: async function (server, options) {

        // Create a route for example
        server.route({
            method: 'GET',
            path: '/plugin-top',
            handler: function (request, h) {

                return '<h1>hello, world</h1>';
            }
        });
        // etc ...

    }
};

// we define our plugin at the top level of exports
module.exports = myPlugin;