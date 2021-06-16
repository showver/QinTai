

import { get, post } from '@/utils/request'


// 刷写菜单——查
export const findFlashMenuById = (params: any) : any => get('/flash/menu/find/id', params)
export const findFlashMenuByName = (params: any) : any => get('/flash/menu/find/name', params)
export const findFlashMenuByType = (params: any) : any => get('/flash/menu/find/type', params)
export const findAllFlashMenu = (params: any) : any => get('/flash/menu/find/all', params)

// 刷写菜单——增删改
export const createFlashMenu = (params: any) : any => post('/flash/menu/create', params)
export const updateFlashMenu = (params: any) : any => post('/flash/menu/update', params)
export const removeFlashMenu = (params: any) : any => post('/flash/menu/remove', params)


// 刷写文件——查
export const findFlashFileById = (params: any) : any => get('/flash/file/find/id', params)
export const findFlashFileByName = (params: any) : any => get('/flash/file/find/name', params)
export const findAllFlashFile = (params: any) : any => get('/flash/file/find/all', params)

// 刷写文件——增删改
export const createFlashFile = (params: any) : any => post('/flash/file/create', params)
export const updateFlashFile = (params: any) : any => post('/flash/file/update', params)
export const removeFlashFile = (params: any) : any => post('/flash/file/remove', params)

// 图片上传
export const uploadFlashFile = (params: any) : any => post('/upload', params)