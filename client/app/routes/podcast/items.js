import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.get('sessionService').get('token')) {
      this.transitionTo('index');
    }
  },

  model: function() {
    return this.store.find('podcast-item');
  },

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.set('s3', controller.controllerFor('podcast').get('s3'));
  }
});
