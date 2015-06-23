import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  token: attr(),
  podcastId: attr(),
  title: attr(),
  author: attr(),
  subtitle: attr(),
  summary: attr(),
  image: attr(),
  enclosureUrl: attr(),
  enclosureLength: attr(),
  guid: attr(),
  pubDate: attr(),
  duration: attr(),
  explicit: attr(),
  isExplicit: function() {
    return this.get('explicit') === 'yes' ? true : false;
  }.property('explicit'),
  closedCaptioned: attr(),
  order: attr(),
  file: attr(),

  fileObserver: function() {
    var file = this.get('file');
    if (file) {
      this.set('enclosureUrl', file.get('Url'));
      this.set('enclosureLength', file.get('Size'));
      this.set('guid', file.get('Url'));
    }
  }.observes('file')
});
