import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message } from 'element-ui'
import { Route } from 'vue-router'
import Layout from '@/layout/index.vue'
import { UserModule } from '@/store/modules/user'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404', '/index']
// const whiteList = ['/login', '/404', '/index', '/article', '/user', '/flash', '/devices', '/upgrade']
const types:any = {
  '/article': { title: '内容管理', icon: 'table' },
  '/user': { title: '普通用户', icon: 'user' },
  '/flash': { title: '刷写管理', icon: 'form' },
  '/devices': { title: '设备管理', icon: 'example' },
  '/upgrade': { title: '升级程序', icon: 'link' }
}

router.beforeEach(async(to: Route, _: Route, next: any) => {
  // Start progress bar
  NProgress.start()

  const token = localStorage.getItem('token')
  const roles = ['/article', '/user', '/flash', '/devices', '/upgrade']

  if (token && token != 'undefined') {
    if (to.path === '/login') { //  存在token且登录
      next({ path: '/' })
      NProgress.done()
    } else {
      let extendsRoutes2:any = [];
      roles.forEach((item,index) => {
        // 已经实例化过的路由，不需要重复实例
        if(router.resolve({name: item}).route.matched.length>0) return
        extendsRoutes2.push({
          path: item,
          component: Layout,
          name: item,
          children: [{
            path: 'index',
            component: () => import(`@/views${item}/index.vue`),
            meta: { title: types[item].title, icon: types[item].icon }
          }]
        });
        // 单独处理user路由
        if(item==='/user') {
          extendsRoutes2[index].meta = { title: '用户管理', icon: 'user' }
          extendsRoutes2[index].children.push({
            path: 'admin',
            component: () => import('@/views/admin/index.vue'),
            meta: { title: '管理员用户', icon: 'password' }
          })
        }
      })
      // 添加路由
      router.addRoutes(extendsRoutes2);
      for (let i = 0; i < extendsRoutes2.length; i++) {
        router.options.routes.push(extendsRoutes2[i]);
        next({ ...to, replace: true })
      }
      next()
      NProgress.done()
    }
  } else {

    // Has no token
    if (whiteList.indexOf(to.path) !== -1) {  // 存在于白名单
      next()
    } else {  // 不在白名单内
      // next(`/login`)
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach((to: Route) => {
  // Finish progress bar
  NProgress.done()

  // set page title
  document.title = to.meta.title
})


