import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 添加全局样式
import './assets/css/global.css'
//引入iconfont
import './assets/font/iconfont.css'
//倒入axios
import axios from 'axios'
Vue.config.productionTip = false
//挂载axios
Vue.prototype.$http = axios
//设置访问根路径
axios.defaults.baseURL = "http://47.102.159.24:9000"
Vue.prototype.resetSetItem = function (key, newVal) {
   if (key === 'watchStorage') {
       // 创建一个StorageEvent事件
       var newStorageEvent = document.createEvent('StorageEvent');
       const storage = {
           setItem: function (k, val) {
               sessionStorage.setItem(k, val);
               // 初始化创建的事件
               newStorageEvent.initStorageEvent('setItem', false, false, k, null, val, null, null);
               // 派发对象
               window.dispatchEvent(newStorageEvent)
           }
       }
       return storage.setItem(key, newVal);
   }
}


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
