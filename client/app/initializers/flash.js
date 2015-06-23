export function initialize(container, application) {
  application.inject('route', 'flashService', 'service:flash');
  application.inject('controller', 'flashService', 'service:flash');
  application.inject('adapter', 'flashService', 'service:flash');
}

export default {
  name: 'flash',
  initialize: initialize
};
