import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
import VueAxios from 'vue-axios'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import echarts from 'echarts'

import {api} from '@/js/api'
import VideoPlayer from 'vue-video-player'
import 'vue-video-player/src/custom-theme.css'
import 'video.js/dist/video-js.css'


// 引入全局css
import "./assets/css/common.css"

Vue.use(ElementUI)
Vue.use(VueAxios, axios)
axios.defaults.withCredentials = true;

Vue.config.productionTip = false
Vue.prototype.echarts = echarts
Vue.prototype.api = api;

Vue.use(VideoPlayer)


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
