import Ember from 'ember';
import layout from '../templates/components/input-file';

export default Ember.TextField.extend({
  layout: layout,
  type: 'file',
  name: 'file',
  change: function(event) {

  }
});
