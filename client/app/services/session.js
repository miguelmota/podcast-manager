import Ember from 'ember';

export default Ember.Service.extend({
  token: function() {
    return sessionStorage.getItem('token');
  }.property(),

  destroy: function() {
    sessionStorage.clear();
  }
});
