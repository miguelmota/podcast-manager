import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    logout: function() {
      this.get('sessionService').destroy();
      window.location.reload();
    }
  }
});
