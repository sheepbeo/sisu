// idle time counted for refreshing the presentation
var refresh_idle_time = 180; // in seconds

function refresh() {
  window.location.reload(true);
}

var timer;

function start() {
  timer = setTimeout(function() {
    refresh();
  }, refresh_idle_time * 1000);
}

jQuery(document).ready(function() {
  start();

  jQuery('body').mouseenter(function() {
    clearTimeout(timer);
  }).mouseleave(function(e) {
    var pageX = e.pageX || e.clientX,
      pageY = e.pageY || e.clientY;

    if (pageX <= 0 || pageY <= 0) {
      start();
    } else {
      clearTimeout(timer);
    }
  });
});