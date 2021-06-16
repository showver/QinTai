import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout/index.vue'

Vue.use(Router)

/*
  redirect:                      if set to 'noredirect', no redirect action will be trigger when clicking the breadcrumb
  meta: {
    title: 'title'               the name showed in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon showed in the sidebar
    breadcrumb: false            if false, the item will be hidden in breadcrumb (default is true)
    hidden: true                 if true, this route will not show in the sidebar (default is false)
  }
*/

export default new Router({
  mode: 'hash',  // Enable this if you need.
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
      meta: { title: '秦泰后台管理系统', hidden: true }
    },
    {
      path: '/404',
      component: () => import(/* webpackChunkName: "404" */ '@/views/404.vue'),
      meta: { hidden: true }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/index',
      children: [
        {
          path: 'index',
          component: () => import(/* webpackChunkName: "index" */ '@/views/index.vue'),
          meta: {
            title: '首页',
            icon: 'dashboard'
          }
        }
      ]
    },
    // {
    //   path: '/article',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import(/* webpackChunkName: "article" */ '@/views/article/index.vue'),
    //       meta: {
    //         title: '内容管理',
    //         icon: 'table'
    //       }
    //     }
    //   ]
    // },
    // {
    //   path: '/user',
    //   component: Layout,
    //   redirect: '/user/index',
    //   meta: {
    //     title: '用户管理',
    //     icon: 'user'
    //   },
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import(/* webpackChunkName: "user" */ '@/views/user/index.vue'),
    //       meta: {
    //         title: '普通用户',
    //         icon: 'user'
    //       }
    //     },
    //     {
    //       path: 'admin',
    //       component: () => import(/* webpackChunkName: "user" */ '@/views/admin/index.vue'),
    //       meta: {
    //         title: '管理员用户',
    //         icon: 'password'
    //       }
    //     }
    //   ]
    // },
    // {
    //   path: '/flash',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import(/* webpackChunkName: "comment" */ '@/views/flash/index.vue'),
    //       meta: {
    //         title: '刷写管理',
    //         icon: 'form'
    //       }
    //     }
    //   ]
    // },
    // {
    //   path: '/devices',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import(/* webpackChunkName: "comment" */ '@/views/devices/index.vue'),
    //       meta: {
    //         title: '设备管理',
    //         icon: 'example'
    //       }
    //     }
    //   ]
    // },
    // {
    //   path: '/upgrade',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import(/* webpackChunkName: "comment" */ '@/views/upgrade/index.vue'),
    //       meta: {
    //         title: '升级程序',
    //         icon: 'link'
    //       }
    //     }
    //   ]
    // },
    // {
    //   path: '*',
    //   redirect: '/404',
    //   meta: { hidden: true }
    // }
  ]
})
