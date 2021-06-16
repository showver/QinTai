
import { get, post } from '@/utils/request'



// 登陆
export const loginUser = (params: any) : any => post('/users/login', params)
// 注销
export const logoutUser = () : any => get('/users/logout')

// 用户信息——查
export const findUserByToken = (params: any) : any => get('/users/find/token', params)
export const findUserByUsername = (params: any) : any => get('/users/find/username', params)
export const findAllUser = (params: any) : any => get('/users/find/all', params)

// 用户信息——增删改
export const createUser = (params: any) : any => post('/users/create', params)
export const updateUser = (params: any) : any => post('/users/update', params)
export const removeUser = (params: any) : any => post('/users/remove', params)