<template>
  <div class="app-container">
    <!-- 顶部功能按钮 -->
    <el-row>
      <el-col :span="14">
        <el-button plain type="primary" icon="el-icon-plus" :disabled="false" @click="handleAdd()">添加管理员账号</el-button>
      </el-col>
      <el-col :span="10">
        <el-input v-model="searchValue" placeholder="请输入用户姓名"> <el-button slot="append" icon="el-icon-search" @click="getUserByUsername()" /> </el-input>
      </el-col>
    </el-row>

    <!-- 用户列表 -->
    <el-table v-loading="listLoading" :data="userinfoList" element-loading-text="Loading" fit highlight-current-row>
      <el-table-column align="center" label="ID" width="70">
        <template slot-scope="scope"> {{ scope.$index + 1 }} </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope"> {{ scope.row.user_id }} </template>
      </el-table-column>
      <el-table-column label="姓名" align="center">
        <template slot-scope="scope"> <span>{{ scope.row.name }}</span> </template>
      </el-table-column>
      <el-table-column align="center" prop="create_date" label="创建时间">
        <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.create_date | parseTime }}</span> </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
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
        <el-form-item label="账号 :" prop="user_id">
          <el-input v-model="userinfo.user_id"></el-input>
        </el-form-item>
        <el-form-item label="密码 :" prop="password">
          <el-input type="password" v-model="userinfo.password"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名 :" prop="name">
          <el-input v-model="userinfo.name"></el-input>
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
import { findAllAdmin, findAdminByName, createAdmin, updateAdmin, removeAdmin } from '@/api/admin'


@Component({
  name: 'Admin',
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
  private userinfoList = []  // 用户列表
  private listLoading = true  // 加载状态
  private searchValue = '' // 搜索框value
  private handleType = 'add'  // add代表新增，edit代表编辑
  private userDialog: Boolean = false
  private userinfo = {   
    id: '',
    user_id: '',    
    password: '',
    name: ''
  }
  private userinfoFormRules = {
    user_id: [
      {required: true, message: '请输入用户名', trigger: 'blur'},
      {pattern: /^[0-9a-zA-Z]+$/, message: '用户名为英文或数字！', trigger: 'blur'}
    ],
    name: [
      {required: true, message: '请输入姓名', trigger: 'blur'},
      {pattern: /^[\u4e00-\u9fa5]+$/, message: '请输入真实姓名', trigger: 'blur'}
    ],
    password: [
      {required: true, message: '请输入密码', trigger: 'blur'},
      {pattern: /^[0-9a-zA-Z]+$/, message: '密码为英文或数字！', trigger: 'blur'}
    ]
  }
  

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
        id: '',
        user_id: '',    
        password: '',
        name: ''
      }
    })
  }
  

  private async getAllUser() {
    this.listLoading = true
    const { data } = await findAllAdmin(this.paging)
    this.userinfoList = data.rows
    this.paging.total = data.count // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  private async getUserByUsername() {
    this.listLoading = true
    const { data } = await findAdminByName({name: this.searchValue})
    this.userinfoList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  
  private async addUser() {
    const { data, code } = await createAdmin(this.userinfo)
    if(code===200) {
      this.getAllUser()
      this.userDialog = false
    }
  }
  private async editUser() {
    const { data, code } = await updateAdmin(this.userinfo)
    if(code===200) {
      this.getAllUser()
      this.userDialog = false
    }
  }
  private async deleUser() {
    const { data, code } = await removeAdmin(this.userinfo)
    if(code===200) this.getAllUser()
  }
}
</script>
