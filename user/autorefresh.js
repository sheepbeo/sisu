// idle time counted for refreshing the presentation
var refresh_idle_time = 3; // in seconds

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

  jQuery('body').click(function() {
    clearTimeout(timer);
    start();
  });
});