<template>
    <div class="tinymce-box">
        <editor v-model="myValue" :init="init" :disabled="disabled" @onClick="onClick" style="z-index:9999">
        </editor>
    </div>
</template>

<script>
import tinymce from 'tinymce/tinymce' //tinymce默认hidden，不引入不显示
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver'
// 编辑器插件plugins
// 更多插件参考：https://www.tiny.cloud/docs/plugins/
import 'tinymce/plugins/image'// 插入上传图片插件
import 'tinymce/plugins/media'// 插入视频插件
import 'tinymce/plugins/table'// 插入表格插件
import 'tinymce/plugins/emoticons'// 插入表格插件
import 'tinymce/plugins/fullscreen'// 插入表格插件
import 'tinymce/plugins/lists'// 列表插件
import 'tinymce/plugins/advlist'// 列表插件
import 'tinymce/plugins/wordcount'// 字数统计插件
import 'tinymce/plugins/autosave'// 字数统计插件
import 'tinymce/plugins/hr'// 字数统计插件
import 'tinymce/plugins/preview'// 字数统计插件
export default {
    components:{
        Editor
    },
    name:'tinymce',
    props: {
        value: {
          type: String,
          default: ''
        },
        disabled: {
          type: Boolean,
          default: false
        },
        plugins: {
          type: [String, Array],
          default: 'lists advlist image media table wordcount emoticons fullscreen autosave hr preview'
        },
        toolbar: {
          type: [String, Array],
          default: 'undo redo restoredraft | formatselect | bold italic forecolor backcolor hr | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists image table | removeformat emoticons fullscreen preview'
        }
    },
    data(){
        return{
            init: {
                // setup: (editor) => {
                //   editor.on('blur', () => {
                //     console.log(1111111);
                //   })
                // },
                language_url: '/tinymce/langs/zh_CN.js',
                language: 'zh_CN',
                skin_url: '/tinymce/skins/ui/oxide',
                // skin_url: 'tinymce/skins/ui/oxide-dark',//暗色系
                height: 400,
                plugins: this.plugins,
                toolbar: this.toolbar,
                branding: false,
                menubar: false,
                images_upload_handler: function (blobInfo, success, failure) {
                  var file = blobInfo.blob();
                  var reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onloadend = function () {
                    if (file.size > 1048576) {
                      failure('图片请不要大于 1MB');
                    } else {
                      success(reader.result);
                    }
                  }
                }
              },
              myValue: this.value
        }
    },
    mounted () {
        tinymce.init({})
    },
    methods: {
        // 添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
        // 需要什么事件可以自己增加
        onClick (e) {
          this.$emit('onClick', e, tinymce)
        },
        // 可以添加一些自己的自定义事件，如清空内容
        clear () {
          this.myValue = ''
        }
    },
    watch: {
        value (newValue) {
          this.myValue = newValue
        },
        myValue (newValue) {
          this.$emit('input', newValue)
        }
    }
}
    
</script>
<style scoped>

</style>