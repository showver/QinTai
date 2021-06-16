

import { get, post } from '@/utils/request'



// 刷写文件——查
export const findAppById = (params: any) : any => get('/app/find/id', params)
export const findAppByDesc = (params: any) : any => get('/app/find/desc', params)
export const findAllApp = (params: any) : any => get('/app/find/all', params)

// 刷写文件——增删改
export const createApp = (params: any) : any => post('/app/create', params)
export const updateApp = (params: any) : any => post('/app/update', params)
export const removeApp = (params: any) : any => post('/app/remove', params)
