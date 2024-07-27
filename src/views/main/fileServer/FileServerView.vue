<template>
    <div>
        <div class="mt-2">
            <cat-row>
                <cat-col :span="6">
                    <button class="btn btn-block btn-primary" @click="modalUpload = !modalUpload">立即上传</button>
                </cat-col>
                <cat-col :span="6">
                    <button class="btn btn-block btn-primary" @click="modalCreateFolder.flag = !modalCreateFolder.flag">新建文件夹</button>
                </cat-col>
            </cat-row>
            
        </div>
        <div class="flex justify-end mt-2">
            
        </div>
        <div class="divider"></div>
        <div className="breadcrumbs text-sm">
            <ul>
                <li v-for="parentInfo in parent" class="shadow-xl">
                    <a @click="handleParent(parentInfo.index)">
                        <el-icon v-if="parentInfo.index < parent.length-1"><Folder /></el-icon>
                        <el-icon v-if="parentInfo.index == parent.length-1"><FolderOpened /></el-icon>
                        {{ parentInfo.name }}
                    </a>
                </li>
            </ul>
        </div>
        <div class="divider"></div>
        <div class='cat-file-list'>
            <cat-row>
                <cat-col v-for="fileInfo in list" class="mb-1">
                    <div class="card shadow-xl p-2 cat-file">
                        <div class="flex justify-between">
                            <a class="link-hover cat-file-name" @click="handle(fileInfo)">
                                <el-icon v-if="fileInfo['type'] == 'file'"><Document /></el-icon>
                                <el-icon v-if="fileInfo['type'] == 'folder'"><Folder /></el-icon>
                                {{ fileInfo['filename'] }}
                            </a>
                            <a>
                                <span v-if="fileInfo['type'] == 'file'">{{ handleFileSize(fileInfo['size']) }}</span>
                                <span v-if="fileInfo['type'] == 'folder'">文件夹</span>
                                ||
                                {{ fileInfo['createTime'] }}
                                <div :class="infoDropdownClass">
                                    <div tabIndex={0} role="button" className="btn btn-circle btn-sm">...</div>
                                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li><a @click="handle(fileInfo)">打开</a></li>
                                        <li v-if="fileInfo['type'] == 'file'"><a>下载</a></li>
                                        <li><a @click="()=>{
                                            closeInfoDropdown()
                                            modalRename.flag = true;
                                            modalRename.id = fileInfo['id'];
                                            modalRename.newFilename = fileInfo['filename'];
                                        }">重命名</a></li>
                                        <li><a @click="deleteFile(fileInfo['id'])">删除</a></li>
                                        <li><a>详情</a></li>
                                    </ul>
                                </div>
                            </a>
                        </div>
                        
                    </div>
                </cat-col>
            </cat-row>
        </div>

        <cat-modal v-model="modalUpload" title="上传" @close="()=>{
            uploadRadia = 0
        }">
            <div class="flex justify-center">
                <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">选择文件</span>
                </div>
                <input type="file" className="file-input file-input-bordered w-full max-w-xs" @change="handleFileChange"/>
                </label>
            </div>
            <div class="flex justify-center mt-1 mb-1">
                <progress v-if="uploadRadia != 0" className="progress progress-primary w-full h-4" :value="uploadRadia" max="100">{{ uploadRadia }}</progress>
            </div>
            <div class="flex justify-center p-5">
                
                <button class="btn btn-block btn-primary max-w-xs" @click="upload">上传</button>
            </div>
        </cat-modal>
        <cat-modal v-model="modalCreateFolder.flag" title="新建文件夹" @close="()=>{
        }">
            <div class="flex justify-center">
                <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">文件夹名称</span>
                </div>
                <input type="text" className="input input-bordered w-full max-w-xs" v-model="modalCreateFolder.filename"/>
                </label>
            </div>
            
            <div class="flex justify-center p-5">
                <button class="btn btn-block btn-primary max-w-xs" @click="createFolder">创建</button>
            </div>
        </cat-modal>
        <cat-modal v-model="modalView.flag" :title="modalView.title" @close="modalView.viewUrl=''" large>
            <iframe :src="modalView.viewUrl" style="height: 80vh; width: 100%;"/>
        </cat-modal>
        <cat-modal v-model="modalRename.flag" title="重命名" @close="()=>{
            modalRename.id = ''
            modalRename.newFilename = ''
        }">
            <div class="flex justify-center">
                <label className="form-control w-full max-w-xs">
                <div className="label">
                    <span className="label-text">文件名称</span>
                </div>
                <input type="text" className="input input-bordered w-full" v-model="modalRename.newFilename"/>
                </label>
            </div>
            
            <div class="flex justify-center p-5">
                <button class="btn btn-block btn-primary max-w-xs" @click="rename">保存</button>
            </div>
        </cat-modal>
    </div>
</template>

<script lang="ts" setup>
import { http, alert, CONSTANTS } from '@/utils';
import { onMounted, ref } from 'vue';
import * as Base64 from 'js-base64';

const list = ref([])
const parent = ref([
    {
        id: '0',
        name: '根目录',
        index: 0
    }
])
const modalUpload = ref(false)
const uploadRadia = ref(0)
const uploadFile = ref([] as any);

const modalCreateFolder = ref({
    flag: false,
    filename: ''
})

const modalView = ref({
    flag: false,
    title: "",
    viewUrl: ""
})

const modalRename = ref({
    flag: false,
    id: '',
    newFilename: ''
})

const infoDropdownClass=ref("dropdown");
const closeInfoDropdown = () => {
    infoDropdownClass.value = "dropdown dropdwon-close";
}

const handleFileSize = (size: number): string => {
    const unit = 1024;
    if (size < unit) {
        return `${size.toFixed(2)} B`; // 字节（Bytes）
    } else if (size < unit * unit) {
        return `${(size / unit).toFixed(2)} KB`; // 千字节（Kilobytes）
    } else if (size < unit * unit * unit) {
        return `${(size / (unit * unit)).toFixed(2)} MB`; // 兆字节（Megabytes）
    } else if (size < unit * unit * unit * unit) {
        return `${(size / (unit * unit * unit)).toFixed(2)} GB`; // 吉字节（Gigabytes）
    } else {
        return `${(size / (unit * unit * unit * unit)).toFixed(2)} TB`; // 太字节（Terabytes）
    }
};

const handleFileChange = (event: Event) => {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement.files) {
    uploadFile.value = inputElement.files; // 将文件列表赋值给 ref
  }
}

const handleParent = (index: number) => {
    parent.value = parent.value.slice(0,index+1)
    query()
}
const handle = (fileInfo: any) => {
    if(fileInfo['type'] == 'folder'){
        parent.value.push({
            id: fileInfo['id'],
            name: fileInfo['filename'],
            index: parent.value.length
        })
        query()
    }else if(fileInfo['type'] == 'file'){

        let local = "http://"+window.location.hostname + (window.location.port&&window.location.port!='' ? ':'+window.location.port : '')
        console.log(local)
        const downloadUrl  = local+CONSTANTS.SYSTEM.SERVERS.FILE+'/file/download?fileId='+fileInfo['id']+"&fullfilename="+fileInfo['filename'];
        const base64 = encodeURIComponent(Base64.encode(downloadUrl))
        const previewUrl = CONSTANTS.SYSTEM.SERVERS.FIELVIEWSERVER+"?url="+base64;
        // window.open(previewUrl);
        modalView.value.flag = true
        modalView.value.title = fileInfo['filename']
        modalView.value.viewUrl = previewUrl
        // window.open(previewUrl);
    }
    infoDropdownClass.value = "dropdown dropdown-close"
}

const upload = () => {
    if(uploadFile.value.length == 0){
        alert('请选择文件再进行上传','warning')
        return;
    }
    http.result({
        server:'FILE',
        url:'/file/upload',
        method:'POST',
        headers:{
            'Content-Type': 'multipart/form-data'
        },
        data:{
            uploadFile: uploadFile.value[0],
            parentId: parent.value[parent.value.length - 1].id
        },
        onUploadProgress: function (progressEvent: any) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadRadia.value = percent
            console.log(percent)
        },
        success(result){
            uploadRadia.value = 100
            alert(result.msg,'success')
            query()
            modalUpload.value = false;
        }
    })
}

const createFolder = () =>{
    if(modalCreateFolder.value.filename == ''){
        alert('文件夹名称不能为空','warning')
        return;
    }
    http.result({
        server:'FILE',
        url:'/file/createFolder',
        method: 'POST',
        params:{
            fileName: modalCreateFolder.value.filename,
            parentId: parent.value[parent.value.length-1].id
        },
        success(result){
            alert(result.msg,'success')
            query()
        }
    })
}

const deleteFile = (fileId: string) => {
    http.result({
        server:'FILE',
        url:'/file/delete',
        method: 'POST',
        params:{
            fileId: fileId
        },
        success(result){
            alert(result.msg,'success')
            query()
        }
    })
    infoDropdownClass.value = "dropdown dropdown-close"
}

const rename = () => {
    http.result({
        server: 'FILE',
        url: '/file/rename',
        method: 'POST',
        params: {
            fileId: modalRename.value.id,
            filename: modalRename.value.newFilename
        },
        success(result) {
            modalRename.value.flag = false;
            modalRename.value.id = '';
            modalRename.value.newFilename = '';
            query()
        }
    })
}

const query = () => {
    http.result({
        server: 'FILE',
        url: '/file/list',
        method: 'POST',
        params: {
            parentId: parent.value[parent.value.length-1].id
        },
        success(result) {
            list.value = result.data
        }
    })
}

onMounted(() => {
    query()
})

</script>

<style lang="scss" scoped>
.cat-file {
    cursor: pointer;
}
.cat-file .cat-file-name:hover{
    color: oklch(var(--p));
}
</style>