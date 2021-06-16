
import { get, post } from '@/utils/request'



// 管理员登陆
export const loginAdmin = (params: any) : any => post('/admin/login', params)
// 管理员注销
export const logoutAdmin = () : any => get('/admin/logout')

// 管理员信息——查
export const findAdminByName = (params: any) : any => get('/admin/find/name', params)
export const findAllAdmin = (params: any) : any => get('/admin/find/all', params)

// 管理员信息——增删改
export const createAdmin = (params: any) : any => post('/admin/create', params)
export const updateAdmin = (params: any) : any => post('/admin/update', params)
export const removeAdmin = (params: any) : any => post('/admin/remove', params)