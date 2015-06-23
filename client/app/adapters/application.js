import DS from 'ember-data';
import env from 'podcast-manager/config/environment';

var host = window.location.protocol + '//' + env.API_HOST;

export default DS.RESTAdapter.extend({
 namespace: 'api/1',
 host: host,
 headers: function() {
   return {
     'token': this.get('sessionService.token'),
   };
 }.property('sessionService.token')
});

export {host};
