
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!'
  }
});

var app2 = new Vue({
  el: '#app-2',
  data: {
    message: 'You loaded this page on ' + new Date()
  }
});

var app3 = new Vue({
  el: '#app-3',
  data: {
    seen: false
  }
});