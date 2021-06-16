<template>
  <div class="app-container">
    <!-- 顶部功能按钮 -->
    <el-row>
      <el-col :span="14">
        <el-button plain type="primary" icon="el-icon-plus" :disabled="false" @click="handleAdd()">添加文章</el-button>
      </el-col>
      <el-col :span="4">
        <el-select v-model="selectValue" placeholder="请选择" @change="getArticleByType"> 
          <el-option label="全部" value="all"> </el-option> 
          <el-option label="文章" value="1"> </el-option>
          <el-option label="视频" value="2"> </el-option> 
        </el-select> 
      </el-col>
      <el-col :span="6">
        <el-input v-model="searchValue" placeholder="请输入搜索内容"> <el-button slot="append" icon="el-icon-search" @click="getArticleByTitle()" /> </el-input>
      </el-col>
    </el-row>

    <!-- 文章列表 -->
    <el-table v-loading="listLoading" :data="articleList" element-loading-text="Loading" fit highlight-current-row>
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope"> {{ scope.$index + 1 }} </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="scope"> {{ scope.row.title }} </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="80">
        <template slot-scope="scope"> <span>{{ scope.row.type=='1'?'文章':'视频' }}</span> </template>
      </el-table-column>
      <el-table-column label="资源URL" align="center">
        <template slot-scope="scope"> <span>{{ scope.row.url }}</span> </template>
      </el-table-column>
      <el-table-column label="缩略图" align="center" width="100">
        <template slot-scope="scope"> <el-image style="width:50px; height:50px" :src='"https://diag.karfans.cn/flash"+scope.row.image'></el-image> </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope"> <i class="el-icon-time" /> <span>{{ scope.row.create_date | parseTime }}</span> </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button plain size="mini" type="info" @click="handleEdit(scope.$index, scope.row)"> 编辑 </el-button>
          <el-button plain size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination :current-page="paging.page" :page-size="paging.limit" :page-sizes="[1,5, 10, 15, 20]" :total="paging.total" layout="total, sizes, prev, pager, next, jumper" style="margin-top: 15px;" @current-change="handleCurrentChange" @size-change="handleSizeChange" />

    <!-- 新增或编辑文章 -->
    <el-dialog :title="handleType=='add'?'新增文章':'编辑文章'" :modal-append-to-body='false' :fullscreen="true" :visible.sync="articleDialog">
      <el-form :model="articleInfo" ref="articleInfo" :rules="FormRules" label-position="right" label-width="90px" style="overflow:hidden;">
        <el-row>
          <el-col :span="7">
            <el-form-item label="标题 :" prop="title"><el-input v-model="articleInfo.title"></el-input></el-form-item>
          </el-col>
          <el-col :span="7" :offset="1">
            <el-form-item label="类型 :" prop="type">
              <el-select v-model="articleInfo.type" placeholder="请选择"> 
                <el-option label="文章" value="1"> </el-option>
                <el-option label="视频" value="2"> </el-option> 
              </el-select> 
            </el-form-item>
          </el-col>
          <el-col :span="7" :offset="1">
            <el-form-item label="资源URL :" prop="url"><el-input v-model="articleInfo.url"></el-input></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="缩略图 :">
          <el-upload class="upload-demo" action='' :auto-upload="false" :limit="1" ref="uploadImg" :on-change="beforeIconUpload">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <span slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件，且不超过3M。</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="文章详情：" prop="summary">
          <div class="edit_container">
            <tinymce-editor v-model="articleInfo.summary" :disabled="false" ref="editor"></tinymce-editor>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="confirmForm()">确认提交</el-button>
          <el-button type="primary" plain @click="articleDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import TinymceEditor from '@/components/TinymceEditor.vue'
import { Component, Vue } from 'vue-property-decorator'
import { findArticleByTitle, findArticleById, findArticleByType, findAllArticle, createArticle, updateArticle, removeArticle } from '@/api/articles'

@Component({
  name: 'Article',
  components: {
    TinymceEditor
  },
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
  private articleList = []  // 文章列表
  private articleDialog: Boolean = false
  private articleInfo = {   // 文章内容
    id: '',   
    url: '',
    type: '1', 
    image: '',
    title: '',
    summary: '',
    create_date: ''
  }
  private FormRules = {
    title: [
      {required: true, message: '请输入标题', trigger: 'blur'}
    ],
    summary: [
      {required: true, message: '请输入标题55', trigger: 'blur'}
    ],
    type: [
      {required: true, message: '请选择类型', trigger: 'blur'}
    ]
  }


  created() {
    // 数据初始化
    this.init()
  }

  // 初始化界面
  private init() {
    this.getAllArticle()
  }
  
  // 设置当前所处分页
  private handleCurrentChange(val: number) {
    this.paging.page = val
    this.getAllArticle()
  }
  // 设置页面条数
  private handleSizeChange(val: number) {
    this.paging.limit = val
    this.getAllArticle()
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

  // 新增文章
  private handleAdd() {
    this.resetForm()
    this.handleType = 'add'
    this.articleDialog = true; 
    this.selectValue = '1'
  }
  // 编辑文章
  private handleEdit(index: number, row: any) {
    this.$refs.uploadImg && (this.$refs.uploadImg as any).clearFiles();
    this.handleType = 'edti'
    this.articleDialog = true; 
    row.type = String(row.type)
    this.articleInfo = row 
  }
  // 确认表单
  private confirmForm() {
    (this.$refs.articleInfo as any).validate((valid:boolean) => {
      if (valid) {
        this.handleType==='add' ? this.addArticle() : this.editArticle();
      } else {
        return false;
      }
    });
  }

  // 重置表单
  private resetForm() {
    this.$nextTick(() => {
      this.articleInfo = {   // 文章内容
        id: '',   
        url: '',
        type: '1', 
        image: '',
        title: '',
        summary: '',
        create_date: ''
      }
      this.$refs.uploadImg && (this.$refs.uploadImg as any).clearFiles();
    })
  }

  // 删除文章
  private handleDelete(index: number, row: any) {
    this.$confirm('是否删除该文章?', '提示', { type: 'warning' })
      .then(() => {
        this.deleteArticleById(index, row)  // 删除文章
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' });          
      });
  }
  
  
  private async addArticle() {
    const formData = new FormData();
    const icon = (this.$refs.uploadImg as any).uploadFiles[0];
    if(icon) {
      formData.append('icon', icon.raw);
    }
    formData.append('url', this.articleInfo.url);
    formData.append('title', this.articleInfo.title);
    formData.append('type', this.articleInfo.type);
    formData.append('summary', this.articleInfo.summary);
    const { data, code } = await createArticle(formData)
    if(code===200) {
      this.getAllArticle()
      this.articleDialog = false
    }
  }
  private async editArticle() {
    const formData = new FormData();
    const icon = (this.$refs.uploadImg as any).uploadFiles[0];
    if(icon) {
      formData.append('icon', icon.raw);
    }
    formData.append('id', this.articleInfo.id);
    formData.append('url', this.articleInfo.url);
    formData.append('title', this.articleInfo.title);
    formData.append('type', this.articleInfo.type);
    formData.append('summary', this.articleInfo.summary);
    const { data, code } = await updateArticle(formData)
    if(code===200) {
      this.getAllArticle()
      this.articleDialog = false
    }
  }
  private async deleteArticleById(index: number, row: any) {
    const { data, code } = await removeArticle({id: row.id})
    if(code===200) {
      this.getAllArticle()
      this.articleDialog = false
    }
  }

  private async getArticleByTitle() {
    this.listLoading = true
    const { data } = await findArticleByTitle({title: this.searchValue})
    this.articleList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }

  private async getArticleByType(value: string) {
    if(value=='all') return this.getAllArticle()
    this.listLoading = true
    const { data } = await findArticleByType({type: value}) // 查找所有类型为文件的菜单
    this.articleList = data
    this.paging.total = data.length // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }

  private async getAllArticle() {
    this.listLoading = true
    const { data } = await findAllArticle(this.paging)
    this.articleList = data.rows
    this.paging.total = data.count // 更新分页数据
    setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
  }

}
</script>
