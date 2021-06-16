<template>
  <div class="app-container">
    <!-- 顶部功能按钮 -->
    <el-row>
      <!-- <el-col :span="14">
        <el-button plain type="primary" icon="el-icon-plus" :disabled="false" @click="handleAdd()">添加管理员账号</el-button>
      </el-col> -->
      <el-col :span="10" :offset="14">
        <el-input v-model="searchValue" placeholder="请输入用户名称"> <el-button slot="append" icon="el-icon-search" @click="getUserByUsername()" /> </el-input>
      </el-col>
    </el-row>

    <!-- 用户列表 -->
    <el-table v-loading="listLoading" :data="userinfoList" element-loading-text="Loading" fit highlight-current-row>
      <el-table-column align="center" label="ID" width="70">
        <template slot-scope="scope"> {{ scope.$index + 1 }} </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope"> {{ scope.row.account }} </template>
      </el-table-column>
      <el-table-column label="姓名" align="center">
        <template slot-scope="scope"> <span>{{ scope.row.user_name }}</span> </template>
      </el-table-column>
      <el-table-column label="设备ID" align="center">
        <template slot-scope="scope"> <span>{{ scope.row.device_id }}</span> </template>
      </el-table-column>
      <el-table-column label="维修站" align="center">
        <template slot-scope="scope"> <span>{{ scope.row.station_name }}</span> </template>
      </el-table-column>
      <el-table-column label="注册IP" align="center">
        <template slot-scope="scope"> <span>{{ scope.row.register_ip }}</span> </template>
      </el-table-column>
      <el-table-column align="center" prop="create_date" label="创建时间">
        <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.create_date | parseTime }}</span> </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="warning" @click="handleDeviceInfo(scope.row)"> 设备信息 </el-button>
          <el-button plain size="mini" type="info" @click="handleEdit(scope.$index, scope.row)"> 编辑 </el-button>
          <el-button plain size="mini" type="danger" @click="handleDele(scope.$index, scope.row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination :current-page="paging.page" :page-size="paging.limit" :page-sizes="[5, 10, 15, 20]" :total="paging.total" layout="total, sizes, prev, pager, next, jumper" style="margin-top: 15px;" @current-change="handleCurrentChange" @size-change="handleSizeChange" />


    <!--新增用户界面-->
    <el-dialog title="新增用户" :visible.sync="userDialog" :modal-append-to-body='false' :show-close="true" width="50vw">
      <el-form label-position="right" label-width="100px" :model="userinfo" ref="userinfoForm" :rules="userinfoFormRules">
        <el-form-item label="账号 :" prop="account">
          <el-input v-model="userinfo.account"></el-input>
        </el-form-item>
        <el-form-item label="密码 :" prop="password">
          <el-input type="password" v-model="userinfo.password"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名 :" prop="user_name">
          <el-input v-model="userinfo.user_name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" type="primary" @click="confirmForm()">保 存</el-button>
          <el-button size="medium" @click="userDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { findAllUser, findUserByUsername, createUser, updateUser, removeUser } from '@/api/users'
import { createAdmin } from '@/api/admin'
import { findUserDevicsByUid } from '@/api/devices'


@Component({
  name: 'User',
  filters: {
    parseTime: (timestamp: string) => {
      return new Date(timestamp).toLocaleString()
    }
  }
})

export default class extends Vue {
  private paging = {
    page: 1, // 当前所处分页
    limit: 10, // 页面条数
    total: 10 // 总数量
  }
  private fileList = []   // 图片列表
  private userinfoList = []  // 用户列表
  private listLoading = true  // 加载状态
  private searchValue = '' // 搜索框value
  private handleType = 'add'  // add代表新增，edit代表编辑
  private userDialog: Boolean = false
  private userinfo = {   
    uid: '',
    account: '',    
    password: '',
    user_name: ''
  }
  private userinfoFormRules = {
    account: [
      {required: true, message: '请输入用户名', trigger: 'blur'},
      {pattern: /^[0-9a-zA-Z]+$/, message: '用户名为英文或数字！', trigger: 'blur'}
    ],
    user_name: [
      {required: true, message: '请输入姓名', trigger: 'blur'},
      {pattern: /^[\u4e00-\u9fa5]+$/, message: '请输入真实姓名', trigger: 'blur'}
    ],
    password: [
      {required: true, message: '请输入密码', trigger: 'blur'},
      {pattern: /^[0-9a-zA-Z]+$/, message: '密码为英文或数字！', trigger: 'blur'}
    ]
  }

  // 监听是否点击了“新增用户”或“编辑用户”
  // @Watch('handleType')
  // getHandleType(newVal: string){
  //   if(newVal !== 'dele') {
  //     this.userDialog = true
  //   }
  // }


  created() {
    // 数据初始化
    this.init()
  }

  // 初始化界面
  private init() {
    this.getAllUser()
  }

  // 设置当前所处分页
  private handleCurrentChange(val: number) {
    this.paging.page = val
    this.getAllUser()
  }
  // 设置页面条数
  private handleSizeChange(val: number) {
    this.paging.limit = val
    this.getAllUser()
  }


  // 查看设备信息
  private async handleDeviceInfo(row: any) {
    console.log(row);
    const uid = row.uid
    const title = `用户【${row.user_name}】的设备信息`
    const { data, code } = await findUserDevicsByUid({uid})
    if( code === 200 ) {
      const h = this.$createElement;
      if(data.length>0) {
        let newDatas:any = []
        data.forEach((element:any) => {
          newDatas.push(h('p', null, `设备sn：${element.sn}  创建时间：${element.create_date}`))
        });
        this.$alert(h('p', null, newDatas), title, {
          confirmButtonText: '确定',
        });
      }else {
        this.$alert('暂无设备信息', title, {
        confirmButtonText: '确定',
      });
      }
    }
  }
  // 新增用户
  private handleAdd() {
    this.resetForm()
    this.handleType = 'add'
    this.userDialog = true;
  }
  // 编辑用户
  private handleEdit(index: number, row: any) {
    this.handleType = 'edti'
    this.userDialog = true;
    this.userinfo = row 
  }
  // 删除用户
  private handleDele(index: number, row: any) {
    this.$confirm('是否删除该用户?', '提示', { type: 'warning' })
      .then(() => {
        this.userinfo = row 
        this.deleUser()
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' });          
      });
  }
  // 确认表单
  private confirmForm(index: number, row: any) {
    (this.$refs.userinfoForm as any).validate((valid:boolean) => {
      if (valid) {
        this.handleType==='add' ? this.addUser() : this.editUser();
      } else {
        return false;
      }
    })
  }
  // 重置表单
  private resetForm() {
    this.$nextTick(() => {
      this.userinfo = {   
        uid: '',
        account: '',    
        password: '',
        user_name: ''
      }
      this.$refs.uploadImg && (this.$refs.uploadImg as any).clearFiles();
    })
  }
  

  private async getAllUser() {
    this.listLoading = true
    const { data } = await findAllUser(this.paging)
    this.userinfoList = data.rows
    this.paging.total = data.count // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  private async getUserByUsername() {
    this.listLoading = true
    const { data } = await findUserByUsername({username: this.searchValue})
    this.userinfoList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  
  private async addUser() {
    const { data, code } = await createAdmin(this.userinfo)
    if(code===200) {
      // this.getAllUser()
      this.userDialog = false
    }
  }
  private async editUser() {
    const { data, code } = await updateUser(this.userinfo)
    if(code===200) {
      this.userDialog = false
    }
  }
  private async deleUser() {
    const { data, code } = await removeUser({uid: this.userinfo.uid})
    if(code===200) this.getAllUser()
  }
}
</script>
