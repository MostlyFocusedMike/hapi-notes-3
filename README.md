--------------------------------------------------------------------------------------------------------------
# SECTION 3: USING PLUGINS
- [my github for this section](https://github.com/MostlyFocusedMike/hapi-notes-3)
- primary sources
    - https://hapijs.com/tutorials/plugins?lang=en_US
    - https://hapipal.com/best-practices/server-plugin-separation#the-joys-of-server--plugin-separation
    - https://hapijs.com/api#plugins



--------------------------------------------------------------------------------------------------------------
# Creating a plugin
- Hapi has a plugin system that allows devs to break their applications into smaller components that work together
- plugins can do all sorts of things, from generating documentation to creating routes
- kind of like a large site breaking down to micro services, a good application will be made up of many plugins, the main application itself might even be a plugin
- making a plugin is not hard, it basically is just an object with a **name, version,** and **register** property:

```
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
        // await someAsyncMethods();
    }
};

// we define our plugin at the top level of exports
module.exports = myPlugin;
```

- instead of specifying a specific **name** and **version** you can also just use **pkg** property, which expects the package.json file:

```
const myPlugin = {
    /* instead of name and version properties, you can just pull in the package */
    pkg: require('../../package.json'),
    ...
```

- plugins can either be at the top level of your export, or they can be in the **plugin** property of an export:

```
module.exports = { register, name, version }
// or if you want your module to export more than a Hapi plugin
exports.plugin = { register, name, version }.
```

- The plugin can also have three other *optional* properties: **multiple**, **once**, and **dependencies**
- from the [docs on plugins](https://hapijs.com/api#plugins):
    - multiple
        - if true, allows the plugin to be registered multiple times with the same server safely. Defaults to false.
    - dependencies
        - a string or an array of strings indicating a plugin dependency. Same as setting dependencies via server.dependency().
    - once
        - if true, will only register the plugin once per server. If set, overrides the once option passed to server.register(). Defaults to no override.




--------------------------------------------------------------------------------------------------------------
# Register Method
- the **register()** method takes two arguments: **server** and **options**
    - we're talking about **plugin.register()**, not **server.register()**, we'll talk about the later in a second
- **server** is just a reference to the server instance that your plugin will be loaded into
- **options** is more interesting. When registering a plugin on your server, you have the ability to pass in any data you want. Your plugin can access this info by going into the options object:

- here is our plugin:

```
// FILE: /lib/plugins/myPluginExternal.js

const myPlugin = {
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

module.exports.plugin = myPlugin;

```

- now when we load in our plugin, we can pass things to it using the **options** property:


```
// FILE: /server.js
const start = async () => {

    await server.register({
         plugin: require('./lib/plugins/myPluginTop.js'),
         options: {
                msg: 'Anything here goes into the plugin',
                serverInfo: server.info
         }
    });

    await server.start();
}
```

- now when we visit http://localhost:3103/plugins/plugin-external, we'll get:

```
{
  "options": {
    "msg": "Anything here goes into the plugin",
    "serverInfo": {
      "created": 1543605413313,
      "started": 1543605413322,
      "host": "localhost",
      "port": 3103,
      "protocol": "http",
      "id": "C02X31RCJHD4:41389:jp4et3nl",
      "uri": "http://localhost:3103",
      "address": "127.0.0.1"
    }
  }
}
```


- **NOTE:** that /plugins/ is a prefix, we explain it under the "Loading plugins" part about server.register() options in a second




--------------------------------------------------------------------------------------------------------------
# Loading plugins
- As you can see, we load our plugins into our server with **server.register()**
    - [docs for **server.register()**](https://hapijs.com/api#-await-serverregisterplugins-options)
- **server.register()** accepts two things: your plugins, and a **registration options object**
- lets look at all the ways to load plugins, then what that options object does

## Load a single external plugin
- you can load a plugin with a simple require statement:

```
await server.register(require('./lib/plugins/myPluginTop.js'))
```


## Load a single plugin and its options
- if you want to give the plugin its options, you have to give server.register() an object with the keys **plugin** and **options**:

```
await server.register({
   plugin: require('./lib/plugins/myPluginTop.js'),
   options: { msg: "I go to the plugin" }
});
```

## Load multiple plugins
- **server.register()** can also take an array of plugins, using either the require() or object format:

```
await server.register([
    require('./lib/plugins/myPluginTop.js'),
    {
        plugin: require('./lib/plugins/myPluginExternal.js'),
        options: {
            msg: 'Anything here goes into the plugin',
        }
     }
]);
```

## Server.register's options object
- Just like you can give each individual plugin an options object, you can give Hapi an options object
    - [docs for service.register, go to the options section](https://hapijs.com/api#-await-serverregisterplugins-options)
- the server.register's **registration options object** does *not* go to any of the plugins, Hapi is the one that uses it
- an easy example is the **routes.prefix** property
- by giving a prefix, all the routes in the registered plugins will be prefixed, but your server routes won't:

```
// FILE: server.js
const start = async () => {
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
    { /* this is the options object */
        routes: {
            prefix: '/plugins'
        }
    });

    /* load routes regular routes */
    server.route(require('./lib/routes/home'));
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}


// FILE: /lib/routes/home.js
module.exports = {
    method: 'GET',
    path: '/',
    handler: (req, h) => {
        return '<h1>I am the home page</h1>';
    }
};
```
- so thanks to the prefix, any plugin routes will now have to be prefixed with /plugins, but our home route does not.
    - FYI, any prefix string must start with '/'
