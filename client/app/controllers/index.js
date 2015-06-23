import Ember from 'ember';

export default Ember.Controller.extend({
  handleErrors: function(errors) {
    var controller = this;
    var flash = controller.get('flashService');

    if (Array.isArray(errors)) {
      errors.forEach(function(error) {
        flash.error(error.message);
      });
    } else {
      flash.error(errors);
    }
  },

  actions: {
    login: function() {
      var controller = this;
      var flash = controller.get('flashService');

      this.store.unloadAll('session');
      this.store.createRecord('session', {
        username: this.get('username'),
        password: this.get('password')
      }).save().then(function(response) {
        if (_.isObject(response)) {
          if (response.errors) {
            controller.handleErrors(response.errors);
          } else if (response.get('token')) {
            controller.get('sessionService').set('token', response.get('token'));
            sessionStorage.setItem('token', response.get('token'));

            controller.transitionToRoute('podcast.items');
          } else {
            flash.error('An error occured.');
          }
        } else {
          flash.error('An error occured.');
        }
      }).catch(function(response) {
        console.error(response);
        if (response.responseJSON) {
          controller.handleErrors(response.responseJSON.errors);
        }
      });
    }
  }
});
