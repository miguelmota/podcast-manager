import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extract: function(store, type, payload) {
    var xml = payload.xml;
    var id = 1;

    payload = {
      id: id,
      xml: xml
    };

    return payload;
  }
});
