import Ember from 'ember';
import layout from '../templates/components/flash-notification';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['flash-notification'],
  classNameBindings: ['type']
});
