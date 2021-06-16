
import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'
import { UserModule } from '@/store/modules/user'

// if (process.env.NODE_ENV === "development") {
//   alert("开发环境");
// }else {
//   alert("生产环境");
// }

const BASE_API = 'http://localhost:3000/api'
// const BASE_API = 'https://api.karfans.cn/qt-api/'
// const BASE_API = process.env.NODE_ENV === "development" ? 'http://localhost:3000/api' : 'https://api.karfans.cn/qt-api/'

/*
*post 请求方法
* @param url
* @param data
* @returns {Promise}
 */
export const post = (url = '', data:any = {}) => {
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_API}${url}`, data, {
      headers: {
        'Authorization': window.localStorage.getItem('token'),
        'Access-Auth': window.localStorage.getItem('token')
      }
    }).then(response => {
      //获取更新的token
      const { authorization } = response.headers;
      authorization && window.localStorage.setItem('token', authorization);
      switch (response.data.code) {
        case 120:  // 需重新登录
          window.localStorage.getItem('token') && window.localStorage.removeItem('token')
          router.replace({
              path: 'login',
              query: {redirect: router.currentRoute.fullPath}//登录成功后跳入浏览的当前页面
          })
          Message({
            message: '授权已过期，请重新登录',
            type: 'error',
            duration: 5 * 1000
          })
          break;
        case 400:
          Message({
            message: response.data.msg,
            type: 'error',
            duration: 5 * 1000
          })
          break;
        case 403:
          Message({
            message: response.data.msg,
            type: 'error',
            duration: 5 * 1000
          })
          break;
        default:
          Message({
            message: response.data.msg,
            type: 'success',
            duration: 5 * 1000
          })
          break;
      }
        resolve(response.data)
      }).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.localStorage.getItem('token') && window.localStorage.removeItem('token')
              router.replace({
                  path: 'login',
                  query: {redirect: router.currentRoute.fullPath}//登录成功后跳入浏览的当前页面
              })
              Message({
                message: '授权已过期，请重新登录',
                type: 'error',
                duration: 5 * 1000
              })
              break;
          }
        }
        return reject(error)
    })
  })
}
/*
*get 请求方法
* @param url
* @param data
* @returns {Promise}
 */
export function get(url = '', params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_API}${url}`, {
      params: params,
      headers: {
        'Authorization': window.localStorage.getItem('token'),
        'Access-Auth': window.localStorage.getItem('token')
      }
    }).then(response => {
        //获取更新的token
        const { authorization } = response.headers;
        authorization && window.localStorage.setItem('token', authorization);
        switch (response.data.code) {
          case 120:  // 需重新登录
            window.localStorage.getItem('token') && window.localStorage.removeItem('token')
            router.replace({
                path: 'login',
                query: {redirect: router.currentRoute.fullPath}//登录成功后跳入浏览的当前页面
            })
            Message({
              message: '授权已过期，请重新登录',
              type: 'error',
              duration: 5 * 1000
            })
            break;
          case 400:
            Message({
              message: response.data.msg,
              type: 'error',
              duration: 5 * 1000
            })
            break;
          case 403:
            Message({
              message: response.data.msg,
              type: 'error',
              duration: 5 * 1000
            })
            break;
        }
        resolve(response.data)
      }).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.localStorage.getItem('token') && window.localStorage.removeItem('token')
              router.replace({
                  path: 'login',
                  query: {redirect: router.currentRoute.fullPath}//登录成功后跳入浏览的当前页面
              })
              Message.closeAll()
              Message({
                message: '授权已过期，请重新登录',
                type: 'error',
                duration: 5 * 1000
              })
              break;
          }
        }
        return reject(error)
    })
  })
}
