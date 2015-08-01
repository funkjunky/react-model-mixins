function SocketHandler() {
    this.callbacks = {};
    this.sockets = {};

    this.getSocket = function(url) {
        if(!this.sockets[url])
            this.setupSocket(url);

        return this.sockets[url];
    };

    this.setupSocket = function(url) {
        var socket = new io();
       
        //create socket.
        this.sockets[url] = socket.connect(url);
        this.callbacks[url] = { patch: {}, create: {}, 'delete': {} };
    };

    this.addModelEvents = function(url, collection, id, patchCallback) {
        //TODO: make an event system, so I can remove some of this duplicated code.
        if(!this.callbacks[url].patch[collection]) {
            //If this is the first patch on this collection, then add the event.
            this.callbacks[url].patch[collection] = {};
            this.getSocket(url).on(collection + ' patched', function(item) {
                //if a model was updated, and that model has a callback on it's id, then call all callbacks for it.
                if(this.callbacks[url].patch[collection][item._id])
                    this.callbacks[url].patch[collection][item._id].forEach(function(itemCallback) { itemCallback(item) });
            }.bind(this));
        }

        if(!this.callbacks[url].patch[collection][id])
            this.callbacks[url].patch[collection][id] = [];

        this.callbacks[url].patch[collection][id].push(patchCallback);
    };

    this.addCollectionEvents = function(url, collection, createCallback, deleteCallback) {
        //TODO: make a function to do this more conviniently??
        if(!this.callbacks[url].create[collection]) {
            this.callbacks[url].create[collection] = [];
            this.getSocket(url).on(collection + ' created', function(item) {
                //call all callbacks for this collection under create.
                this.callbacks[url].create[collection].forEach(function(itemCallback) { itemCallback(item) });
            }.bind(this));
        }


        this.callbacks[url].create[collection].push(createCallback);

        if(!this.callbacks[url]['delete'][collection]) {
            this.callbacks[url]['delete'][collection] = [];
            this.getSocket(url).on(collection + ' removed', function(item) {
                //if a model was updated, and that model has a callback on it's id, then call all callbacks for it.
                if(this.callbacks[url]['delete'][collection])
                    this.callbacks[url]['delete'][collection].forEach(function(itemCallback) { itemCallback(item) });
            }.bind(this));
        }

        this.callbacks[url]['delete'][collection].push(deleteCallback);
    };

    return this;
};
var socketHandler = SocketHandler();

module.exports = socketHandler;
