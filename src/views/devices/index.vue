<template>
  <div class="app-container">

    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="设备列表" name="first">
        <!-- 顶部功能按钮 -->
        <el-row>
          <el-col :span="10">
            <el-input v-model="searchValue" placeholder="请输入搜索设备名"> <el-button slot="append" icon="el-icon-search" @click="getDeviceByTitle()" /> </el-input>
          </el-col>
          <el-col :span="4" :offset="10">
            <el-button icon="el-icon-refresh" style="float:right" @click="freshOverviewDevice()"></el-button>
          </el-col>
        </el-row>

        <!-- 设备列表 -->
        <el-table v-loading="listLoading" :data="deviceList" element-loading-text="Loading" fit highlight-current-row>
          <el-table-column label="设备名称" prop="device_name">
            <template slot-scope="scope"> {{ scope.row.device_name }} </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="utc_create" align="center">
            <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.utc_create }}</span> </template>
          </el-table-column>
          <el-table-column label="激活时间" prop="gmt_active" align="center">
            <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.gmt_active }}</span> </template>
          </el-table-column>
          <el-table-column label="状态" prop="device_status" align="center">
            <template slot-scope="scope"> 
              <p v-if="scope.row.device_status=='ONLINE'"><el-badge is-dot type="success" style="vertical-align:sub;padding:0 6px;"></el-badge>在线 </p>
              <p v-if="scope.row.device_status=='OFFLINE'"><el-badge is-dot type="warning" style="vertical-align:sub;padding:0 6px;"></el-badge>离线 </p>
              <p v-if="scope.row.device_status=='UNACTIVE'"><el-badge is-dot type="info" style="vertical-align:sub;padding:0 6px;"></el-badge>设备未激活 </p>
              <p v-if="scope.row.device_status=='DISABLE'"><el-badge is-dot type="danger" style="vertical-align:sub;padding:0 6px;"></el-badge>设备已禁用 </p>
            </template>
          </el-table-column>
          <el-table-column label="最后上线时间" prop="gmt_online" align="center">
            <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.gmt_online }}</span> </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination :current-page="paging.page" :page-size="paging.limit" :page-sizes="[5, 10, 15, 20]" :total="paging.total" layout="total, sizes, prev, pager, next, jumper" style="margin-top: 15px;" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
      </el-tab-pane>
    </el-tabs>
    

    <!-- 新增或编辑设备 -->
    <el-dialog :title="handleType=='add'?'新增设备':'编辑设备'" :visible.sync="deviceDialog" :modal-append-to-body='false' width="50vw">
      <el-form :model="deviceInfo" ref="deviceInfo" :rules="FormRules" label-position="right" label-width="90px" style="overflow:hidden;">
        <el-form-item label="设备名称 :" prop="device_name">
            <el-input v-model="deviceInfo.device_name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="confirmForm()">确认提交</el-button>
          <el-button type="primary" plain @click="deviceDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import TinymceEditor from '@/components/TinymceEditor.vue'
import { Component, Vue } from 'vue-property-decorator'
import { findIotDeviceById, findIotDeviceByName, findAllIotDevice, createIotDevice, updateIotDevice, removeIotDevice } from '@/api/devices'
import { Message } from 'element-ui'
import axios from 'axios'

@Component({
  name: 'Devices',
  components: {
    TinymceEditor
  },
  filters: {
    parseTime: (timestamp: string) => {
      return new Date(Number(timestamp)).toLocaleString()
    }
  }
})
export default class extends Vue {
  private paging = {
    page: 1, // 当前所处分页
    limit: 10, // 页面条数
    total: 10 // 总数量
  }
  private activeName = 'first'
  private listLoading = true
  private searchValue = ''    // 搜索框value
  private handleType = 'add'  // add代表新增，edit代表编辑
  private deviceList = []  // 设备列表
  private deviceDialog: Boolean = false
  private deviceInfo = {   // 设备内容
    id: '',
    device_name: '',   
    device_status: '',
    utc_create: '',
    gmt_active: '', 
    gmt_online: '',
  }
  private FormRules = {
    device_name: [
      {required: true, message: '请输入设备名称', trigger: 'blur'}
    ]
  }


  created() {
    // 数据初始化
    this.init()
  }

  // 初始化界面
  private init() {
    this.getAllDevice()
  }
  
  // 设置当前所处分页
  private handleCurrentChange(val: number) {
    this.paging.page = val
    this.getAllDevice()

  }
  // 设置页面条数
  private handleSizeChange(val: number) {
    this.paging.limit = val
    this.getAllDevice()
  }

  // 新增设备
  private handleAdd() {
    this.resetForm()
    this.handleType = 'add'
    this.deviceDialog = true
  }
  // 编辑设备
  private handleEdit(index: number, row: any) {
    this.handleType = 'edti'
    this.deviceDialog = true; 
    row.type = String(row.type)
    this.deviceInfo = row 
  }
  // 确认表单
  private confirmForm() {
    (this.$refs.deviceInfo as any).validate((valid:boolean) => {
      if (valid) {
        this.handleType==='add' ? this.addDevice() : this.editDevice();
      } else {
        return false;
      }
    });
  }

  // 重置表单
  private resetForm() {
    this.$nextTick(() => {
      this.deviceInfo = {   // 设备内容
        id: '',
        device_name: '',   
        device_status: '',
        utc_create: '',
        gmt_active: '', 
        gmt_online: '',
      }
    })
  }

  // 删除设备
  private handleDelete(index: number, row: any) {
    this.$confirm('是否删除该设备?', '提示', { type: 'warning' })
      .then(() => {
        this.deviceInfo = row;
        this.deleteDeviceById()  // 删除设备
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' });          
      });
  }

  // 刷新设备管理
  private freshOverviewDevice() {
    axios.get('https://api.karfans.cn/api/cms/manualSyncDevice?token=fc59fe3a5df696a1b644e4bec9c9b291').then(response => {
      if(response.data.code===200) this.getAllDevice('5')
      Message({ message: response.data.msg, type: 'success'})
    }).catch(error => {
      Message({ message: '请求失败', type: 'error' })
    })
  }


  private async addDevice() {
    const { data, code } = await createIotDevice(this.deviceInfo)
    if(code===200) {
      this.getAllDevice()
      this.deviceDialog = false
    }
  }
  private async editDevice() {
    const { data, code } = await updateIotDevice(this.deviceInfo)
    if(code===200) {
      this.getAllDevice()
      this.deviceDialog = false
    }
  }
  private async deleteDeviceById() {
    const { data, code } = await removeIotDevice({id: this.deviceInfo.id})
    if(code===200) {
      this.getAllDevice()
      this.deviceDialog = false
    }
  }

  private async getDeviceByTitle() {
    this.listLoading = true
    const { data } = await findIotDeviceByName({device_name: this.searchValue})
    this.deviceList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  private async getAllDevice(time:any='0.5') {
    this.listLoading = true
    const { data } = await findAllIotDevice(this.paging)
    this.deviceList = data.rows
    this.paging.total = data.count // 更新分页数据
    setTimeout(() => { this.listLoading = false }, time * 1000)
  }

}
</script>
