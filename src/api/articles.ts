
import { get, post } from '@/utils/request'

// 文章管理——查
export const findArticleByTitle = (params: any) : any => get('/article/find/title', params)
export const findArticleById = (params: any) : any => get('/article/find/id', params)
export const findArticleByType = (params: any) : any => get('/article/find/type', params)
export const findAllArticle = (params: any) : any => get('/article/find/all', params)

// 文章管理——增删改
export const createArticle = (params: any) : any => post('/article/create', params)
export const updateArticle = (params: any) : any => post('/article/update', params)
export const removeArticle = (params: any) : any => post('/article/remove', params)
