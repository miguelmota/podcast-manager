import Ember from 'ember';

export default Ember.Controller.extend({
  imageFiles: function() {
    return this.get('s3').filter(function(item) {
      return /^.*\.(png|jpg|jpeg|gif)$/gi.test(item.get('Url'));
    });
  }.property('s3'),

  audioFiles: function() {
    return this.get('s3').filter(function(item) {
      return /^.*\.mp3$/gi.test(item.get('Url'));
    });
  }.property('s3'),

  actions: {
    addItem: function() {
      var last = {};
      if (this.model && this.model.get('lastObject')) {
        last = _.omit(this.model.get('lastObject')._data, 'id');
      }
      this.store.createRecord('podcast-item', last);
    },

    save: function () {
      var controller = this;
      var flash = controller.get('flashService');

      this.get('model')
      .save()
      .then(function(response) {
        console.log(response);
        flash.success('Successfully saved');
      })
      .catch(function(response) {
        console.error(response);
        flash.error('An error occured.');
      });
    },

    remove: function (item) {
      var controller = this;
      var flash = controller.get('flashService');

      if (confirm('Are you sure?') && confirm('Are you really sure?')) {
        this.store.find('podcast-item', item.get('id')).then(function (item) {
          console.log(item);
          item.destroyRecord();
        })
        .catch(function(response) {
          console.error(response);
          flash.error(response);
        });
      }
    }
  }
});
