
import { get, post } from '@/utils/request'


// 数据概览
export const findUserGroupByCreateAt = () : any => get('/users/find/createAt')
export const findOverviewOfAll = () : any => get('/overview/find/all')
export const findOverviewOfDevice = () : any => get('/overview/find/device')
export const findOverviewOfArticle = () : any => get('/overview/find/article')

