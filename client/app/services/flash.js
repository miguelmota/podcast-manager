import Ember from 'ember';

export default Ember.Service.extend({
  toast: function() {
    if (typeof window.toastr === 'object') {
      toastr.options.timeOut = 20000;
      toastr.options.progressBar = true;
      return toastr;
    }

    return {
      success: function(msg) {
        alert(msg);
      },
      error: function(msg) {
        alert(msg);
      }
    };
  }.property(),

  success: function(msg) {
    this.get('toast').success(msg);
  },

  error: function(msg) {
    this.get('toast').error(msg);
  }
});
