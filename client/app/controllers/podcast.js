import Ember from 'ember';
import {host} from 'podcast-manager/adapters/application';

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

  imageFiles: function() {
    return this.get('s3').filter(function(item) {
      return /^.*\.(png|jpg|jpeg|gif)$/gi.test(item.get('Url'));
    });
  }.property('s3'),

  generatedXML: null,
  podcastXMLFilename: 'robit-radio.xml',

  actions: {
    addS3Item: function() {
      var controller = this;
      var flash = controller.get('flashService');
      var input = $('.s3-form [type="file"]')[0];

      if (input.files && input.files[0]) {
        var formData = new FormData($('.s3-form')[0]);

        controller.set('s3UploadLoading', true);

        var url = host + '/api/1/storage';

        $.ajax({
          url: url,
          type: 'POST',
          xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
              myXhr.upload.addEventListener('progress', function() {
                console.log('progress', arguments);
              }, false);
            }
            return myXhr;
          },
          success: function(response) {
            console.log('Success', response);
            if (response.errors) {
              controller.handleErrors(response.errors);
            } else {
              flash.success('Successfully uploaded');
              controller.store.find('s3');
            }
          },
          error: function(xhr, status, error) {
            console.error('Error', xhr);
            flash.error(error);
          },
          complete: function() {
            controller.set('s3UploadLoading', false);
            $('.s3-form')[0].reset();
          },
          data: formData,
          cache: false,
          contentType: false,
          processData: false
        });
      }

    },

    removeS3Item: function(item) {
      var controller = this;
      var flash = controller.get('flashService');

      if (confirm('Are you sure?')) {
        this.store.find('s3', item.get('id')).then(function (item) {
          console.log(item);
          item.destroyRecord();
        })
        .catch(function(response) {
          console.error(response);
        });
      }
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
        flash.error('An error occured');
      });
    },

    generate: function() {
      var controller = this;
      var flash = controller.get('flashService');

      this.store.createRecord('xml', {

      })
      .save()
      .then(function(response) {
        console.log(response);
        controller.set('generatedXML', response.get('xml'));
      })
      .catch(function(error) {
        console.error(error);
      });
    },

    publish: function() {
      var controller = this;
      var flash = controller.get('flashService');

      var name = this.get('podcastXMLFilename');

      controller.store.unloadAll('podcast-publish');
      controller.store.createRecord('podcast-publish', {
        name: name,
        xml: this.get('generatedXML')
      })
      .save()
      .then(function(response) {
        if (response.errors) {
          controller.handleErrors(response.errors);
        } else {
          flash.success('Successfully saved.');
          controller.store.find('s3');
          controller.set('generatedXML', null);
        }
      })
      .catch(function(response) {
        console.error(response);
        controller.handleErrors(response.responseJSON.errors);
      });
    }
  }
});
