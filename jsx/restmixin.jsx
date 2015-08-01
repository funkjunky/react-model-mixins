var _ = require('underscore');
var request = require('superagent');

var RestModelMixin = {
    fullUrl: function() {
    console.log('props: ', this.props);
        var fullUrl = this.url;
        if(this.props.collection)
            fullUrl += '/' + this.props.collection;
        if(this.props.id)
            fullUrl += '/' + this.props.id;
        else if(this.props.data && this.props.data._id)
            fullUrl += '/' + this.props.data._id;

        console.log('fullurl: ', fullUrl);

        return fullUrl;
    },
    saveModel: function() {
        console.log('saveModel!');
        var method = (typeof this.state.data._id === 'undefined') ? 'POST' : 'PUT';

        var data;
        if(this.modelData)
            data = this.modelData();
        else
            data = this.state.data;

        //TODO: do this in a cleaner way...
        var _id = data._id;
        delete data._id;

        request(method, this.fullUrl())
            .send(data)
            .end(function(err, res) {
                //probably wrong this
                console.log(method + ' - err, res: ', res, err);
                //TODO: trigger an event, or at least call some callback so component can listen.
            });
        //TODO: see TODO above, for removing this weird code.
        this.state.data._id = _id;
    },
    deleteModel: function() {
        if(!this.props.id)
            throw {message: 'can\'t delete without an id'};

        request.delete(this.fullUrl()).end(function(err, res) {
            console.log('DELETE - err, res: ');
        });
    },
    refreshModel: function() {
        request.get(this.fullUrl()).end(function(err, res) {
            //console.log('GET - err, res: ', err, res);
            this.setBody(res.body);
        }.bind(this));
    },
    //TODO: refreshCollection should be in it's own mixin. Both ModelMixin and CollectionMixin should inherit from some other mixin.
    refreshCollection: function() {
        request.get(this.fullUrl()).end(function(err, res) {
            //console.log('GET - err, res: ', res, err);
            //err.response.error and res.body
            this.setBody(res.body);
        }.bind(this));
    },
    setBody: function(body) {
        this.setState({data: body});
    },
    componentDidMount: function() {
        //load data, if data wasn't passed.
        if(this.props.data)
            this.setState({data: this.props.data});
        else if(this.props.id)
            this.refreshModel();
        else if(this.url)
            this.refreshCollection();
        else
            throw {message: "You need to at least provide a url to use ModelMixins"};
    },
    componentDidUpdate: function(prevProps, prevState) {
        console.log('did update!');
        console.log('state: ', this.state.data);
        //TODO: not exactly correct, we only care about when state.data changes.
        if(something(prevState.data))
            _.debounce(this.saveModel, 100)();
    },
};

function something(obj) {
    return (typeof obj !== 'undefined') && (obj.length || hasItem(obj));
}

function hasItem(obj) {
    for(var k in obj)
        return true;
    return false;
}

module.exports = RestModelMixin;
