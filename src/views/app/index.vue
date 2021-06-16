<template>
  <div class="app-container">
    <!-- 顶部功能按钮 -->
    <el-row>
      <el-col :span="14">
        <el-button plain user_id="primary" file_name="el-file_name-plus" :disabled="false" @click="handleAdd()">添加升级包</el-button>
      </el-col>
      <el-col :span="10">
        <el-input v-model="searchValue" placeholder="请输入描述名称"> <el-button slot="append" icon="el-icon-search" @click="getAppByDesc()" /> </el-input>
      </el-col>
    </el-row>


    <!-- 升级包列表 -->
    <el-table v-loading="listLoading" :data="appList" row-key="id" element-loading-text="Loading" fit highlight-current-row>
      <el-table-column label="版本号" align="center">
        <template slot-scope="scope"> {{ scope.row.version }} </template>
      </el-table-column>
      <el-table-column label="版本名称" align="center">
        <template slot-scope="scope"> {{ scope.row.version_name }} </template>
      </el-table-column>
      <el-table-column label="文件名称" align="center">
        <template slot-scope="scope"> {{ scope.row.file_name }} </template>
      </el-table-column>
      <el-table-column label="文件MD5" align="center">
        <template slot-scope="scope"> {{ scope.row.file_md5 }} </template>
      </el-table-column>
      <el-table-column label="描述信息" align="center">
        <template slot-scope="scope"> {{ scope.row.description }} </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope"> {{ scope.row.status | parseStatus }} </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope"> <i class="el-file_name-time" /> <span>{{ scope.row.create_at }}</span> </template>
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


    <!--新增升级包界面-->
    <el-dialog :title="handleType=='add'?'新增升级包':'编辑升级包'" :visible.sync="appDialog" :modal-append-to-body='false' width="50vw">
      <el-form label-position="right" label-width="100px" :model="appForm" :rules="AppFormRules" ref="appForm">
        <el-form-item label="版本号 :" prop="version">
          <el-input v-model="appForm.version"></el-input>
        </el-form-item>
        <el-form-item label="版本名称 :" prop="version_name">
          <el-input v-model="appForm.version_name"></el-input>
        </el-form-item>
        <el-form-item label="描述信息 :" prop="description">
          <el-input v-model="appForm.description"></el-input>
        </el-form-item>
        <!-- <el-form-item label="状态 :" prop="status">
          <el-switch v-model="appForm.status" active-color="#13ce66" inactive-color="#ff4949" active-value="1" inactive-value="0"></el-switch>
        </el-form-item> -->
        <el-form-item label="程序文件 :">
          <el-upload class="upload-demo" action='' :auto-upload="false" :limit="1" ref="uploadApk" :on-change="beforeFileUpload">
            <el-button slot="trigger" size="small" user_id="primary">选取文件</el-button>
            <span slot="tip" class="el-upload__tip">只能上传apk文件。</span>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" user_id="primary" @click="confirmForm()">保 存</el-button>
          <el-button size="medium" @click="appDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { findAllApp, findAppById, findAppByDesc, createApp, updateApp, removeApp } from '@/api/app'


@Component({
  name: 'App',
  filters: {
    parseTime: (timestamp: string) => {
      return new Date(timestamp).toLocaleString()
    },
    parseStatus: (status: number) => {
      const list = ['未发布', '已发布', '下架']
      return list[status]
    }
  }
})

export default class extends Vue {
  private paging = {
    page: 1, // 当前所处分页
    limit: 10, // 页面条数
    total: 10 // 总数量
  }
  private listLoading = true
  private selectValue = 'all' // 选择框value
  private searchValue = ''    // 搜索框value
  private handleType = 'add'  // add代表新增，edit代表编辑
  private appList = []        // 升级包列表
  private appDialog: Boolean = false
  private appFileForm = {
    menu_id: ''
  }
  private appForm = {   
    id: '',
    version: '',
    version_name: '',
    description: '',
    file_name: '',
    file_md5: '',
    status: '0',
    create_at: '',
    user_id: '1'
  }
  private AppFormRules = {
    version: [
      {required: true, message: '请输入版本号', trigger: 'blur'},
      {max: 11, message: '长度不能超过11', trigger: 'blur'},
      {pattern: /^[0-9]+$/, message: '只能为数字！', trigger: 'blur'}
    ],
    version_name: [
      {required: true, message: '请输入版本名称', trigger: 'blur'}
    ]
  }


  created() {
    // 数据初始化
    this.init()
  }

  // 初始化界面
  private init() {
    this.getAllApp()
  }
  
  // 设置当前所处分页
  private handleCurrentChange(val: number) {
    this.paging.page = val
    this.getAllApp()
  }
  // 设置页面条数
  private handleSizeChange(val: number) {
    this.paging.limit = val
    this.getAllApp()
  }

  // 下载文件
  private downloadFile(row: any) {
    if(row.user_id === 2) {  // 升级包类型为文件
      this.getFlashFileById(row.id)
    }
  }
  // 上传文件
  private beforeFileUpload(file:any) {
    console.log(file);
    var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
    const rigthType = 'apk'.includes(testmsg);
    if (!rigthType) {
      this.$message({ message: '上传文件只能是 apk 格式!', type: 'warning' });
      (this.$refs.uploadApk as any).clearFiles();
    }
    // if (isLt3M) {
    //   this.$message({ message: '上传文件大小不能超过 3MB!', type: 'warning' });
    //   (this.$refs.uploadApk as any).clearFiles();
    // }
    return rigthType
  }

  // 新增升级包
  private handleAdd() {
    this.resetForm()
    this.handleType = 'add'
    this.appDialog = true;
  }
  // 编辑升级包
  private handleEdit(index: number, row: any) {
    this.handleType = 'edti'
    row.status = String(row.status)
    this.appForm = row 
    this.appDialog = true;
  }
  // 删除升级包
  private handleDele(index: number, row: any) {
    this.appForm.id = row.id
    this.$confirm('是否删除该升级包?', '提示', { type: 'warning' })
      .then(() => {
        this.deleApp()
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' });          
      });
  }
  // 确认表单
  private confirmForm() {
    (this.$refs.appForm as any).validate((valid:boolean) => {
      if (valid) {
        if(!(this.$refs.uploadApk as any).uploadFiles[0]) {
          this.$message({ type: 'warning', message: '请上传刷写文件' });
          return false; 
        } 
        this.handleType==='add' ? this.addApp() : this.editApp();
      } else {
        return false;
      }
    });
  }
  // 重置表单
  private resetForm() {
    this.$nextTick(() => {
      this.appForm = {   
        id: '',
        version: '',
        version_name: '',
        description: '',
        file_name: '',
        file_md5: '',
        status: '0',
        create_at: '',
        user_id: '1'
      }
      this.$refs.uploadApk && (this.$refs.uploadApk as any).clearFiles();
    })
  }
  
  private async getAppByDesc() {
    this.listLoading = true
    const { data } = await findAppByDesc({description: this.searchValue})
    this.appList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  private async getAllApp() {
    this.listLoading = true
    const { data } = await findAllApp(this.paging)
    this.appList = data.rows
    this.paging.total = data.count // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  
  private async addApp() {
    const formData = new FormData();
    const file = (this.$refs.uploadApk as any).uploadFiles[0];
    if(file) {
      formData.append('file', file.raw);
    }
    formData.append('user_id', this.appForm.user_id);
    formData.append('version', this.appForm.version);
    formData.append('version_name', this.appForm.version_name);
    formData.append('description', this.appForm.description);
    formData.append('status', this.appForm.status);
    const { data, code } = await createApp(formData)
    if(code===200) {
      this.getAllApp()
      this.appDialog = false
    } 
  }
  private async editApp() {
    const formData = new FormData();
    const file = (this.$refs.uploadApk as any).uploadFiles[0];
    if(file) {
      formData.append('file', file.raw);
    }
    formData.append('id', this.appForm.id);
    formData.append('user_id', this.appForm.user_id);
    formData.append('version', this.appForm.version);
    formData.append('version_name', this.appForm.version_name);
    formData.append('description', this.appForm.description);
    formData.append('status', this.appForm.status);
    const { data, code } = await updateApp(formData)
    if(code===200) {
      this.getAllApp()
      this.appDialog = false
    } 
  }
  private async deleApp() {
    const { data, code } = await removeApp({id: this.appForm.id})
    if(code===200) this.getAllApp()
  }

  
  private async getFlashFileById(id: number) {
    const { data } = await findAppById({menu_id: id})
    if(data === {}) {
      this.$message({ type: 'warning', message: '空文件' });
    }else {
      this.$message({ type: 'info', message: data.file_path });
    }
  }
}
</script>
