import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.get('sessionService').get('token')) {
      this.transitionTo('index');
    }
  },

  model: function() {
    return Ember.RSVP.hash({
      podcast: this.store.find('podcast').then(function(model) {
        return model.get('firstObject');
      }),
      s3: this.store.find('s3')
    });
  },
  setupController: function(controller, model) {
    controller.set('model', model.podcast);
    controller.set('s3', model.s3);
  }
});
