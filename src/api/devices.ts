
import { get, post } from '@/utils/request'

// 设备信息管理——查
export const findUserDevicsByUid = (params: any) : any => get('/device/user/find/uid', params)
export const findIotDeviceByName = (params: any) : any => get('/device/iot/find/name', params)
export const findIotDeviceById = (params: any) : any => get('/device/iot/find/id', params)
export const findAllIotDevice = (params: any) : any => get('/device/iot/find/all', params)

// 文章管理——增删改
export const createIotDevice = (params: any) : any => post('/device/iot/create', params)
export const updateIotDevice = (params: any) : any => post('/device/iot/update', params)
export const removeIotDevice = (params: any) : any => post('/device/iot/remove', params)
