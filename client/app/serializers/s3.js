import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var items  = payload.storage;

    payload = { s3s: items };

    return this._super(store, type, payload);
  }

});
