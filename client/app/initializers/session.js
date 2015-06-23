export function initialize(container, application) {
  application.inject('route', 'sessionService', 'service:session');
  application.inject('controller', 'sessionService', 'service:session');
  application.inject('adapter', 'sessionService', 'service:session');
  application.inject('component', 'sessionService', 'service:session');
  application.inject('serializer', 'sessionService', 'service:session');
}

export default {
  name: 'session',
  initialize: initialize
};
