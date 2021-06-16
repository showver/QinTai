<template>
  <div class="dashboard-container">
    
    <!-- 设备总信息 -->
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="always">
          <div slot="header" class="clearfix">
            <span>数据总览</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="freshOverviewAll()">刷新</el-button>
          </div>
          <el-row>
            <el-col :span="12">
              <p><i class="el-icon-user" style="margin-right:5px;"></i>用户总数：{{overviewAll?overviewAll.userCount:'无'}}</p>
            </el-col>
            <el-col :span="12">
              <p><i class="el-icon-setting" style="margin-right:5px;"></i>设备总数：{{overviewAll?overviewAll.deviceCount:'无'}}</p>
              <p><i class="el-icon-date" style="margin-right:5px;"></i>内容总数：{{overviewAll?overviewAll.articleCount:'无'}}</p>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always">
          <div slot="header" class="clearfix">
            <span>设备管理</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="freshOverviewDevice()">刷新</el-button>
          </div>
          <el-row>
            <el-col :span="12">
              <p><el-badge is-dot type="info" style="vertical-align:sub;margin-right:5px;"></el-badge>未激活设备：{{overviewDevice?overviewDevice.unactiveCount:'无'}}</p>
              <p><el-badge is-dot type="danger" style="vertical-align:sub;margin-right:5px;"></el-badge>已禁用设备：{{overviewDevice?overviewDevice.disableCount:'无'}}</p>
            </el-col>
            <el-col :span="12">
              <p><el-badge is-dot type="success" style="vertical-align:sub;margin-right:5px;"></el-badge>当前在线：{{overviewDevice?overviewDevice.onlineCount:'无'}}</p>
              <p><el-badge is-dot type="warning" style="vertical-align:sub;margin-right:5px;"></el-badge>当前离线：{{overviewDevice?overviewDevice.offlineCount:'无'}}</p>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always">
          <div slot="header" class="clearfix">
            <span>内容管理</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="freshOverviewArticle()">刷新</el-button>
          </div>
          <el-row>
            <el-col :span="12">
              <p><i class="el-icon-edit-outline" style="margin-right:5px;"></i>文章：{{overviewArticle?overviewArticle.articleCount:'无'}}</p>
              <p><i class="el-icon-film" style="margin-right:5px;"></i>视频：{{overviewArticle?overviewArticle.videoCount:'无'}}</p>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Message } from 'element-ui'
import axios from 'axios'
import { findUserGroupByCreateAt, findOverviewOfAll, findOverviewOfDevice, findOverviewOfArticle } from '@/api/overview'
// import { UserModule } from '@/store/modules/user'

@Component({
  name: 'Index'
})

export default class extends Vue {

  private echartUser = null  // 用户线性图
  private overviewAll = null  // 数据总览
  private overviewDevice = null  // 设备管理
  private overviewArticle = null  // 内容管理
  
  created() {
    // 数据初始化
    this.init()
  }

  // 初始化界面
  private init() {
    this.getUserGroupByCreateAt()
    this.getOverviewOfAll()
    this.getOverviewOfDevice()
    this.getOverviewOfArticle()
  }

  // 刷新数据总览
  private freshOverviewAll() {
    this.getOverviewOfAll()
  }
  // 刷新设备管理
  private freshOverviewDevice() {
    axios.get('https://api.karfans.cn/api/cms/manualSyncDevice?token=fc59fe3a5df696a1b644e4bec9c9b291').then(response => {
      if(response.data.code===200) this.getOverviewOfDevice()
      Message({ message: response.data.msg, type: 'success'})
    }).catch(error => {
      Message({ message: '请求失败', type: 'error' })
    })
  }
  // 刷新内容管理
  private freshOverviewArticle() {
    this.getOverviewOfArticle()
  }

  private async getUserGroupByCreateAt() {
    const { data, code } = await findUserGroupByCreateAt()
    if(code===200) {
      this.echartUser = data
    }
  }
  private async getOverviewOfAll() {
    const { data, code } = await findOverviewOfAll()
    if(code===200) {
      this.overviewAll = data
    }
  }
  private async getOverviewOfDevice() {
    const { data, code } = await findOverviewOfDevice()
    if(code===200) {
      this.overviewDevice = data
    }
  }
  private async getOverviewOfArticle() {
    const { data, code } = await findOverviewOfArticle()
    if(code===200) {
      this.overviewArticle = data
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
