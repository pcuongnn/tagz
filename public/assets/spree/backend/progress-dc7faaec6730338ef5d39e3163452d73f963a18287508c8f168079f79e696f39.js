(function() {
  $(document).ready(function() {
    $(document).ajaxStart(function() {
      return $("#progress").stop(true, true).fadeIn();
    });
    return $(document).ajaxStop(function() {
      return $("#progress").fadeOut();
    });
  });

}).call(this);
