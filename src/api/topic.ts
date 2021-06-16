
import { get, post } from '@/utils/request'

// 查找所有主题
export const findAllTopic = () : any => get('/topic/all')

// 查找指定主题
export const findSingleTopic = (params: any) : any => get('/topic/single', params)

// 查找置顶主题
export const findNewestTopic = (params: any) : any => get('/topic/newest', params)

// 添加主题
export const createTopic = (params: any) : any => post('/topic/create', params)

// 编辑主题
export const updateTopic = (params: any) : any => post('/topic/update', params)

// 删除主题
export const removeTopic = (params: any) : any => post('/topic/remove', params)

