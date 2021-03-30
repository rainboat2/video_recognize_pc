import Vue from 'vue'
import VueRouter from 'vue-router'
import Frame from "@/views/Frame";
import Login from "@/views/Login";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/frame',
    name: 'Frame',
    component: Frame,
    children:[
      {
        path: '/homepage',
        name: 'Homepage',
        component: () => import('../views/Homepage'),
        meta: {
          title: '首页'
        }
      },
      {
        path: '/online/recognize',
        name: 'OnlineRecognize',
        component: () => import('../views/OnlineRecognize'),
        meta: {
          title: '在线识别'
        }
      },
      {
        path: '/personal/information',
        name: 'PersonalInformation',
        component: () => import('../views/PersonalInformation'),
        meta: {
          title: '个人信息'
        }
      },
      {
        path: '/video/management',
        name: 'VideoManagement',
        component: ()  => import('../views/VideoManagement'),
        meta: {
          title: '视频管理'
        }
      },
      {
        path: '/development',
        name: 'Development',
        component: () => import('../views/Development'),
        meta : {
          title: '开发接口'
        }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


/**
 * 该全局路由用于配置网页的标题（显示在浏览器顶部的标签上）
 * 想要指定一个页面的标题，在配置该路由时应指定如下的数据
 *
 * meta:{title: 'your title'}
 */
router.beforeEach((to, from, next) =>{
  const title = to.meta.title;
  if (title !== undefined)
    document.title = title;
  else
    document.title = 'HelloWorld!';
  next();
})


export default router
