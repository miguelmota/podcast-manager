import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  token: attr(),
  title: attr(),
  link: attr(),
  language: attr(),
  copyright: attr(),
  subtitle: attr(),
  author: attr(),
  summary: attr(),
  description: attr(),
  name: attr(),
  email: attr(),
  image: attr(),
  categories: attr(),
  complete: attr(),
  explicit: attr(),
  newFeedUrl: attr()
  //podcastItems: DS.hasMany('podcastItem', {async: true})
});
