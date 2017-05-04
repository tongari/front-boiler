import './polyfill/closest';
import Vue from 'vue';
import vueSmoothScroll from 'vue-smoothscroll';
import VueCarousel from 'vue-carousel';
import { Carousel, Slide } from 'vue-carousel';

Vue.use(vueSmoothScroll);
Vue.use(VueCarousel);

const carousel =  new Vue({
  el: '.v-carousel',
  components: {
    Carousel,
    Slide
  }
});

window.addEventListener('load', () => {
  const slideItem = document.querySelectorAll('.js-slide-item');
  Array.prototype.forEach.call(slideItem, (item) => {
    item.style.width = document.documentElement.clientWidth+'px';
  });
});


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

var app4 = new Vue({
  el: '#app-4',
  data: {
    todos: [
      { text: 'Learn JavaScript' },
      { text: 'Learn Vue' },
      { text: 'Build something awesome' }
    ]
  }
});


app4.todos.push({ text: 'New item' });

var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: (e) => {
      app5.message = app5.message.split('').reverse().join('')
    }
  }
});


var app6 = new Vue({
  el: '#app-6',
  data: {
    message: 'Hello Vue!'
  }
});


Vue.component('todo-item', {
  props: ['todo'],
  template: '<li><a href="#" onclick={todo.handler()}>{{ todo.text }}</a></li>'
});
var app7 = new Vue({
  el: '#app-7',
  data: {
    groceryList: [
      { text: 'Vegetables',handler:()=>{console.log('Vegetables');} },
      { text: 'Cheese', handler:()=>{console.log('Cheese');} },
      { text: 'Whatever else humans are supposed to eat', handler:()=>{console.log('Whatever else humans are supposed to eat');} }
    ]
  }
});

// var data = { a: 1 }
// var vm = new Vue({
//   data: data
// })
// vm.a === data.a // -> true
// // プロパティへの代入は、元のデータにも反映されます
// vm.a = 2
// data.a // -> 2
// // ... そして、その逆もまたしかりです
// data.a = 3
// vm.a // -> 3

new Vue({
  el: '.js-common-function',
  methods: {
    tracker:function (e) {
      console.log(e.target.getAttribute('data-measurement'));
    }
  }
});

var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // 算出 getter 関数
    reversedMessage: function () {
      // `this` は vm インスタンスを指します
      return this.message.split('').reverse().join('')
    }
  }
});

new Vue({
  el:'.static',
  data: {
    isActive: true,
    hasError: true
  }
});

new Vue({
  el:'#classObject',
  data: {
    classObject: {
      active: true,
      'text-danger': true
    }
  }
});

new Vue({
  el:'#classObject2',
  data: {
    isActive: true,
    error: null
  },
  computed: {
    classObject: function () {
      return {
        active: this.isActive && !this.error,
        'text-danger': this.error && this.error.type === 'fatal',
      }
    }
  }
});


new Vue({
  el:'#arrayKoubun',
  data: {
    activeClass: 'active',
    errorClass: 'text-danger'
  }
});


const showState = (isShow) => isShow ? 'active' : 'is-hidden';

new Vue({
  el:'#toggleClass',
  data: {
    isShow: true,
  },
  methods: {
    toggle: function () {
      this.isShow = !this.isShow;
    }
  },
  computed: {
    bindClass: function () {
      return showState(this.isShow);
    }
  }
});

const getMatchDomIndex = (node, navList) => {
  let result = '';
  Array.prototype.forEach.call(navList,((element, index) =>{
    if(element === node) result = index;
  }));
  return result;
};

const toggleShow = (tgtIndex, contentsList) => {
  Array.prototype.forEach.call(contentsList,((element, index) =>{
    if(tgtIndex === index) {
      element.classList.remove('is-hidden');
    } else {
      element.classList.add('is-hidden');
    }
  }));
};

new Vue({
  el:'#js-tab-area',
  methods: {
    change: function (e) {
      // this.selected = id;
      const tgt = e.target.closest('#js-tab-area');
      const navList = tgt.querySelectorAll('.js-nav');
      const contentsList = tgt.querySelectorAll('.js-content');
      const tgtIndex = getMatchDomIndex(e.target, navList);
      toggleShow(tgtIndex, contentsList);
    }
  }
});

// const tgt = document.querySelector('#js-tab-area');
// const navList = tgt.querySelectorAll('.js-nav');
// const contentsList = tgt.querySelectorAll('.js-content');
// navList.forEach((element,index)=>{
//   element.addEventListener('click',(e) =>{
//     toggleShow(index, contentsList);
//   });
// });


new Vue({
  el: '#IF',
  data:{
    ok: false
  }
});

new Vue({
  el: '#TIF',
  data:{
    ok: true
  }
});


const bus = new Vue();

const Child = {
  props: ['message'],
  template: `<a href="#" @click.prevent="handler">{{message}}</a>`,
  methods: {
    handler: function () {
      bus.$emit('handler', 'hoge');
    }
  }
};

const Output = {
  props: ['message'],
  template: `<p>{{message}}</p>`,
};

new Vue({
  el: '#tongari',
  data:{
    message: 'tongari'
  },
  template: `
    <div>
      <my-child :message="messageObject"></my-child>
      <my-output :message="messageObject"></my-output>
    </div>
  `,
  components: {
    'my-child': Child,
    'my-output': Output
  },
  computed: {
    messageObject: function () {
      return this.message;
    }
  },
  created() {
    bus.$on('handler', (str) => {
      this.message = str;
    });
  }
});

new Vue({
  el: '#to-page-top',
  methods: {
    toPageTop: function () {
      this.$SmoothScroll(document.querySelector('#page-top'), 500, ()=>{alert('to top')});
    }
  }
});

