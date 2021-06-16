<template>
  <div class="app-container">
    <!-- 顶部功能按钮 -->
    <el-row>
      <el-col :span="14">
        <el-button plain type="primary" icon="el-icon-plus" :disabled="false" @click="handleAdd('menu')">添加菜单</el-button>
        <el-button plain type="primary" icon="el-icon-plus" :disabled="false" @click="handleAdd('file')">刷写文件上传</el-button>
      </el-col>
      <el-col :span="4">
        <el-select v-model="selectValue" placeholder="请选择" @change="changeSelect"> 
          <el-option label="全部" value="all"> </el-option> 
          <el-option label="菜单" value="1"> </el-option>
          <el-option label="文件" value="2"> </el-option> 
        </el-select> 
      </el-col>
      <el-col :span="6">
        <el-input v-model="searchValue" placeholder="菜单名称"> <el-button slot="append" icon="el-icon-search" @click="getFlashMenuByName()" /> </el-input>
      </el-col>
    </el-row>


    <!-- 菜单列表 -->
    <el-table v-loading="listLoading" :data="flashList" row-key="id" element-loading-text="Loading" fit highlight-current-row :tree-props="{children: 'children'}">
      <el-table-column align="center" label="" width="80"></el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope"> {{ scope.row.name }} </template>
      </el-table-column>
      <el-table-column label="ID" align="center">
        <template slot-scope="scope"> {{ scope.row.id }} </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope"> <i :class="scope.row.type=='1'?'el-icon-menu':'el-icon-document'" @click="downloadFile(scope.row)"></i> </template>
      </el-table-column>
      <el-table-column label="图标" align="center">
        <template slot-scope="scope"> <el-image style="width:50px; height:50px" :src='"https://diag.karfans.cn/flash"+scope.row.icon'></el-image> </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.create_date | parseTime }}</span> </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button v-if="scope.row.type!='1'" size="mini" type="warning">
            <el-link v-if="!scope.row.files" :underline="false">暂无文件</el-link>
            <el-link v-else :underline="false" target="_blank" :href='"https://diag.karfans.cn/flash"+scope.row.files.file_path'>文件下载</el-link>
          </el-button>
          <el-button plain size="mini" type="info" @click="handleEdit(scope.$index, scope.row)"> 编辑 </el-button>
          <el-button plain size="mini" type="danger" @click="handleDele(scope.$index, scope.row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination :current-page="paging.page" :page-size="paging.limit" :page-sizes="[5, 10, 15, 20]" :total="paging.total" layout="total, sizes, prev, pager, next, jumper" style="margin-top: 15px;" @current-change="handleCurrentChange" @size-change="handleSizeChange" />


    <!--新增菜单界面-->
    <el-dialog :title="handleType=='add'?'新增菜单':'编辑菜单'" :visible.sync="flashMenuDialog" :modal-append-to-body='false' width="50vw">
      <el-form label-position="right" label-width="100px" :model="flashMenuForm" :rules="MenuFormRules" ref="flashMenuForm">
        <el-form-item label="所属父级 :" prop="parent_id">
          <el-select v-model="flashMenuForm.parent_id" placeholder="请选择所属父级" style="width: 100%;">
            <el-option label="第一级根级" :value="0"></el-option>
            <el-option v-for="(item,index) in flashMenuList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称 :" prop="name">
          <el-input v-model="flashMenuForm.name"></el-input>
        </el-form-item>
        <el-form-item label="类型 :" prop="type">
          <el-select v-model="flashMenuForm.type" placeholder="请选择菜单类型" style="width: 100%;">
            <el-option label="菜单" value="1"> </el-option>
            <el-option label="文件" value="2"> </el-option> 
          </el-select>
        </el-form-item>
        <el-form-item label="刷写文件 :" v-show="flashMenuForm.type=='2'">
          <el-upload class="upload-demo" action='' :auto-upload="false" :limit="1" ref="uploadTxt" :on-change="beforeFileUpload">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <span slot="tip" class="el-upload__tip">只能上传文件，且不超过3M。</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="图标 :">
          <el-upload class="upload-demo" action='' :auto-upload="false" :limit="1" ref="uploadImg" :on-change="beforeIconUpload">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <span slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件，且不超过3M。</span>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" type="primary" @click="confirmForm('menu')">保 存</el-button>
          <el-button size="medium" @click="flashMenuDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--刷写文件上传-->
    <el-dialog title="刷写文件上传" :visible.sync="flashFileDialog" :modal-append-to-body='false' width="50vw">
      <el-form label-position="right" label-width="100px" :model="flashFileForm" :rules="FileFormRules" ref="flashFileForm">
        <el-form-item label="所属父级 :" prop="menu_id">
          <el-select v-model="flashFileForm.menu_id" placeholder="请选择" style="width: 100%;">
            <el-option v-for="(item,index) in flashFileList" :label="item.name" :value="item.id" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="刷写文件 :">
          <el-upload class="upload-demo" action='' :auto-upload="false" :limit="1" ref="uploadTxt" :on-change="beforeFileUpload">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <span slot="tip" class="el-upload__tip">只能上传文件，且不超过3M。</span>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" type="primary" @click="confirmForm('file')">保 存</el-button>
          <el-button size="medium" @click="flashFileDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { 
  findAllFlashMenu, findFlashMenuByName, findFlashMenuByType, createFlashMenu, updateFlashMenu, removeFlashMenu, uploadFlashFile,
  findAllFlashFile, findFlashFileById, createFlashFile, updateFlashFile, removeFlashFile
} from '@/api/flash'


@Component({
  name: 'Flash',
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
  private listLoading = true
  private selectValue = 'all' // 选择框value
  private searchValue = ''    // 搜索框value
  private handleType = 'add'  // add代表新增，edit代表编辑
  private flashList = []        // 菜单列表
  private flashAllList = []     // 所有的菜单列表
  private flashMenuList = []    // 所有类型为菜单的列表
  private flashFileList = []    // 所有类型为文件的列表
  private flashFileDialog: Boolean = false
  private flashMenuDialog: Boolean = false
  private flashFileForm = {
    menu_id: ''
  }
  private flashMenuForm = {   
    id: '',
    parent_id: '0',
    type: '1',
    name: '',
    icon: '',
    create_date: '',
    files: null
  }
  private MenuFormRules = {
    name: [
      {required: true, message: '请输入菜单名称', trigger: 'blur'}
    ],
    type: [
      {required: true, message: '请选择菜单类型', trigger: 'blur'}
    ]
  }
  private FileFormRules = {
    menu_id: [
      {required: true, message: '请选择所属父级', trigger: 'blur'}
    ]
  }


  created() {
    // 数据初始化
    this.init()
  }

  // 初始化界面
  private init() {
    this.getAllFlashMenu()
    // 获取不同类型的内容
    this.getFlashMenuByType('all')
    this.getFlashMenuByType('1')
    this.getFlashMenuByType('2')
  }
  
  // 设置当前所处分页
  private handleCurrentChange(val: number) {
    this.paging.page = val
    this.getAllFlashMenu()
  }
  // 设置页面条数
  private handleSizeChange(val: number) {
    this.paging.limit = val
    this.getAllFlashMenu()
  }

  // 下载文件
  private downloadFile(row: any) {
    if(row.type === 2) {  // 菜单类型为文件
      this.getFlashFileById(row.id)
    }
  }
  // 上传图片
  private beforeIconUpload(file:any) {
    var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
    const rigthType = 'jpg jpeg png'.includes(testmsg);
    const isLt3M = file.size;
    if (!rigthType) {
      this.$message({ message: '上传文件只能是 jpg、jpeg、png格式!', type: 'warning' });
      (this.$refs.uploadImg as any).clearFiles();
    }
    if (isLt3M > 1024 * 1024 * 3) {
      this.$message({ message: '上传文件大小不能超过 3MB!', type: 'warning' });
      (this.$refs.uploadImg as any).clearFiles();
    }
    return rigthType && isLt3M
  }
  // 上传文件
  private beforeFileUpload(file:any) {
    console.log(file);
    var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
    const rigthType = /txt|ipk|bin|hex|tar|xml/ig.test(testmsg);
    const isLt3M = file.size > 1024 * 1024 * 3;
    if (!rigthType) {
      this.$message({ message: '上传文件只能是 txt ipk bin hex tar xml 格式!', type: 'warning' });
      (this.$refs.uploadTxt as any).clearFiles();
    }
    if (isLt3M) {
      this.$message({ message: '上传文件大小不能超过 3MB!', type: 'warning' });
      (this.$refs.uploadTxt as any).clearFiles();
    }
    return rigthType && isLt3M
  }

  // 切换类型
  private changeSelect(value: string) {
    this.listLoading = true
    if(value=='all') {
      this.flashList = this.flashAllList
    }else if(value=='1') {   // 查找所有类型为菜单的列表
      this.flashList = this.flashMenuList
    }else {     // 查找所有类型为文件的列表
      this.flashList = this.flashFileList
    }
    setTimeout(() => { this.listLoading = false }, 0.3 * 1000)
  }
  // 新增菜单
  private handleAdd(type: string) {
    if(type==='menu') {
      this.flashMenuDialog = true;
    }else {
      this.flashFileDialog = true;
    }
    this.resetForm()
    this.handleType = 'add'
  }
  // 编辑菜单
  private handleEdit(index: number, row: any) {
    this.handleType = 'edti'
    row.type = String(row.type)
    this.flashMenuForm = row 
    this.flashMenuDialog = true;
  }
  // 删除菜单
  private handleDele(index: number, row: any) {
    this.flashMenuForm.id = row.id
    this.$confirm('是否删除该菜单?', '提示', { type: 'warning' })
      .then(() => {
        this.deleFlashMenu()
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' });          
      });
  }
  // 确认表单
  private confirmForm(type: string) {
    if(type === 'menu') {
      (this.$refs.flashMenuForm as any).validate((valid:boolean) => {
        if (valid) {
          this.handleType==='add' ? this.addFlashMenu() : this.editFlashMenu();
        } else {
          return false;
        }
      });
    }else {
      (this.$refs.flashFileForm as any).validate((valid:boolean) => {
        if (valid) {
          if(!(this.$refs.uploadTxt as any).uploadFiles[0]) {
            this.$message({ type: 'warning', message: '请上传刷写文件' });
            return false; 
          } 
          this.addFlashFile();
        } else {
          return false;
        }
      });
    }
    this.resetForm()
  }
  // 重置表单
  private resetForm() {
    this.$nextTick(() => {
      this.flashMenuForm = {   
        id: '',
        parent_id: '0',
        type: '1',
        name: '',
        icon: '',
        create_date: '',
        files: null
      }
      this.$refs.uploadTxt && (this.$refs.uploadTxt as any).clearFiles();
      this.$refs.uploadImg && (this.$refs.uploadImg as any).clearFiles();
    })
  }
  

  
  private async getFlashMenuByName() {
    this.listLoading = true
    const { data } = await findFlashMenuByName({name: this.searchValue})
    this.flashList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  private async getFlashMenuByType(value: string) {
    if(value=='all') {
      const { data } = await findAllFlashMenu(this.paging)
      this.flashAllList = data
    }else if(value=='1') {   // 查找所有类型为文件的菜单
      const { data } = await findFlashMenuByType({type: value})
      this.flashMenuList = data
    }else {
      const { data } = await findFlashMenuByType({type: value})
      this.flashFileList = data
    }
  }
  private async getAllFlashMenu() {
    this.listLoading = true
    const { data } = await findAllFlashMenu(this.paging)
    this.flashList = data.rows
    this.paging.total = data.count // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }
  
  private async addFlashFile() {
    const formData = new FormData();
    const file = (this.$refs.uploadTxt as any).uploadFiles[0];
    if(file) {
      formData.append('file', file.raw);
    }
    formData.append('menu_id', this.flashFileForm.menu_id);
    formData.append('user_id', '1');
    const { data, code } = await createFlashFile(formData)
    this.flashFileDialog = false
  }
  private async addFlashMenu() {
    const formData = new FormData();
    const file = (this.$refs.uploadTxt as any).uploadFiles[0];
    const icon = (this.$refs.uploadImg as any).uploadFiles[0];
    if(file) {
      formData.append('file', file.raw);
    }
    if(icon) {
      formData.append('icon', icon.raw);
    }
    formData.append('type', this.flashMenuForm.type);
    formData.append('name', this.flashMenuForm.name);
    formData.append('parent_id', this.flashMenuForm.parent_id);
    formData.append('user_id', '1');
    const { data, code } = await createFlashMenu(formData)
    if(code===200) {
      this.getAllFlashMenu()
      this.flashMenuDialog = false
    } 
  }
  private async editFlashMenu() {
    const formData = new FormData();
    const file = (this.$refs.uploadTxt as any).uploadFiles[0];
    const icon = (this.$refs.uploadImg as any).uploadFiles[0];
    if(file) {
      formData.append('file', file.raw);
    }
    if(icon) {
      formData.append('icon', icon.raw);
    }
    formData.append('type', this.flashMenuForm.type);
    formData.append('name', this.flashMenuForm.name);
    formData.append('id', this.flashMenuForm.id);
    formData.append('parent_id', this.flashMenuForm.parent_id);
    formData.append('user_id', '1');
    formData.append('icon', this.flashMenuForm.icon);
    const { data, code } = await updateFlashMenu(formData)
    if(code===200) {
      this.getAllFlashMenu()
      this.flashMenuDialog = false
    } 
  }
  private async deleFlashMenu() {
    const { data, code } = await removeFlashMenu({id: this.flashMenuForm.id})
    if(code===200) this.getAllFlashMenu()
  }

  
  private async getFlashFileById(id: number) {
    const { data } = await findFlashFileById({menu_id: id})
    if(data === {}) {
      this.$message({ type: 'warning', message: '空文件' });
    }else {
      this.$message({ type: 'info', message: data.file_path });
    }
  }
}
</script>
