<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto">
                    <!-- <el-form-item label="id">
                        <el-input v-model="info.id" autocomplete="off" />
                    </el-form-item>-->
                    <!-- <el-form-item label="父级id">
                        <el-input v-model="info.parentId" autocomplete="off" />
                    </el-form-item> -->
                    <el-form-item label="选择类型">
                        <el-radio-group v-model="menuType" size="large" @change="(value) => { queryMenuTree() }">
                            <el-radio-button label="前台" value="-2" />
                            <el-radio-button label="后台" value="-1" />
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="父级机构">
                        <el-cascader :options="menuTree" :props="{
                            children: 'children',
                            label: 'name',
                            value: 'id',
                            // multiple: true,
                            emitPath: false,
                            checkStrictly: true,
                        }" placeholder="选择父级机构，默认 根路径" size="large" style="width: 100%;" clearable
                            @change="(value) => { info.parentId = value; }" v-model="info.parentId">
                        </el-cascader>
                    </el-form-item>
                    <el-form-item label="路由">
                        <el-input v-model="info.path" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="名称">
                        <el-input v-model="info.name" autocomplete="off" />
                    </el-form-item>
                    <!-- <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="创建人">
                        <el-input v-model="info.userId" autocomplete="off" />   
                    </el-form-item> -->
                    <!-- <el-form-item label="图标">
                        <el-input v-model="info.icon" autocomplete="off" />
                    </el-form-item> -->
                    <el-form-item label="图标">
                        <!-- <el-input v-model="info.icon" autocomplete="off" :disabled="props.type != 'edit'" /> -->
                        <el-icon size="50" color="#409eff">
                            <component :is="info.icon" />
                        </el-icon>
                        <el-button @click="() => { dialogIcon.open = true }">选择图标</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider />
        <div style="display: flex;justify-content: center;">
            <el-button type="primary" plain @click="add" size="large">添加</el-button>
        </div>
    </div>
    <el-dialog v-model="dialogIcon.open" :title="dialogIcon.title" width="800" center @closed="() => { }">
        <IconSelector v-model:name="info.icon" />
    </el-dialog>
</template>

<script setup lang='ts'>
import IconSelector from '@/components/icon/IconSelector.vue';
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';


const props = defineProps({
    id: String
})

const emit = defineEmits(['success']);

const menuType = ref("-1")

const dialogIcon = ref({
    open: false,
    title: '图标选择'
})

const info = ref({
    // id: '',
    parentId: '',
    path: '',
    name: '',
    // createTime: '',
    // updateTime: '',
    // userId: '',
    icon: '',
    menuType: ''
})

const menuTree = ref([])

const add = () => {
    console.log(info.value.parentId)
    info.value.menuType = menuType.value
    info.value.parentId = info.value.parentId == '' || info.value.parentId == undefined ? menuType.value : ''
    http.result({
        url: '/menu/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success');
            info.value.icon = ''
            info.value.name = ''
            info.value.parentId = ''
            info.value.path = ''
            // queryInfo()
        }
    })
}




const queryMenuTree = () => {
    menuTree.value = []
    http.result({
        url: '/menu/menuTreeAll',
        method: 'GET',
        params: {
            menuType: menuType.value
        },
        success(result) {
            menuTree.value = result.data
        }
    })
}


onMounted(() => {
    queryMenuTree()
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>