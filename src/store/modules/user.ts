import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { loginUser, logoutUser, findUserByToken } from '@/api/users'
import { loginAdmin } from '@/api/admin'
import { getToken, setToken, removeToken } from '@/utils/cookies'
import store from '@/store'

export interface IUserState {
  token: string
  name: string
  avatar: string
  introduction: string
  roles: string[]
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = ''
  public avatar = ''
  public introduction = ''
  public roles: string[] = []

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Action
  public async Login(userInfo: { username: string, password: string }) {
    let { username, password } = userInfo
    username = username.trim()
    const {data} = await loginAdmin({ username, password })
    localStorage.setItem('token',data.token)
  }

  @Action
  public ResetToken() {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }

  @Action
  public async GetUserInfo() {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    const { data } = await findUserByToken({ /* Your params here */ })
    console.log('用户信息',data);
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    
    // this.SET_ROLES('admin')
    this.SET_NAME(data.account)
    this.SET_AVATAR('')
    this.SET_INTRODUCTION('')
  }

  @Action
  public async LogOut() {
    const token = localStorage.getItem('token')
    if (token === null || token === 'undefined') {
      throw Error('LogOut: token is undefined!')
    }
    // await logoutUser()
    localStorage.removeItem('token')
  }
}

export const UserModule = getModule(User)
