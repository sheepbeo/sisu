function refresh() {
  window.location.reload(true);
}

var timer;

function start() {
  timer = setTimeout(function() {
    refresh();
  }, refresh_idle_time * 1000); // refresh_idle_time is defined in definition.js
}

jQuery(document).ready(function() {
  start();

  jQuery('body').click(function() {
    clearTimeout(timer);
    start();
  });
});