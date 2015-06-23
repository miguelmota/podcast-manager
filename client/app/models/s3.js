import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  token: attr(),
  Etag: attr(),
  Key: attr(),
  LastModified: attr(),
  Owner: attr(),
  Size: attr(),
  StorageClass: attr(),
  Url: function() {
    return 'http://robit.s3.amazonaws.com/' + this.get('Key');
  }.property('Key')
});
