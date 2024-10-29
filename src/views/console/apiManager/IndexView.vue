<template>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/console' }">控制台</el-breadcrumb-item>
        <el-breadcrumb-item>API管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-divider />
    <div v-loading="loading">
        <el-card>
            <el-row :gutter="20">
                <el-col>
                    <el-input v-model="queryParam.search" style="width: 100%" size="large" placeholder="搜索"
                        @keyup.enter="queryPage" :prefix-icon="Search">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="queryParam.roleId" placeholder="角色" size="large" style="width: 100%;" clearable
                        @change="queryPage">
                        <el-option v-for="item in roles" :key="item.key" :label="item.value" :value="item.key" />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-cascader :options="cascade" props="{checkStrictly: true,}" placeholder="分组" size="large"
                        style="width: 100%;" clearable @change="(value: any) => {
                            if (value.length > 0) {
                                queryParam.server = value[0]
                            }
                            if (value.length > 1) {
                                queryParam.groupName = value[1]
                            }
                            queryPage();
                        }" />
                </el-col>
            </el-row>
        </el-card>
        <el-table :data="tableData" style="width: 100%;min-height: 30vh;" stripe border
            @selection-change="handleSelectionChange" @sort-change="handleSortChange"
            :default-sort="{ prop: 'date', order: 'descending' }">
            <el-table-column type="selection" />
            <el-table-column prop="path" label="路径" sortable="custom" />
            <el-table-column prop="server" label="服务名称·" />
            <el-table-column prop="groupName" label="分组名称" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="whiteListStr" label="白名单" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column prop="updateTime" label="更新时间" />
            <el-table-column fixed="right" label="操作" min-width="120">
                <template #default="scope">
                    <el-button link type="primary" size="small"
                        @click="() => { dialogEdit.open = true; dialogEdit.title = '详情'; dialogEdit.server = scope.row.server; dialogEdit.path = scope.row.path; dialogEdit.type = 'view'; }">
                        详情
                    </el-button>
                    <el-button link type="primary" size="small"
                        @click="() => { dialogEdit.open = true; dialogEdit.title = '编辑'; dialogEdit.server = scope.row.server; dialogEdit.path = scope.row.path; dialogEdit.type = 'edit'; }">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next, jumper, total" :total="pageInfo.total" :size="pageInfo.size"
            v-model:current-page="pageInfo.current" @current-change="handleCurrentChange" />
    </div>
    <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" width="800" center
        @closed="() => { dialogEdit.server = ''; queryPage() }">
        <ApiEditView v-model:server="dialogEdit.server" v-model:path="dialogEdit.path" v-model:type="dialogEdit.type"
            :key="dialogEdit.server + dialogEdit.path" />
    </el-dialog>

</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';
import { Search } from '@element-plus/icons-vue'
import ApiEditView from './ApiEditView.vue';

const loading = ref(false)

const multipleSelection = ref([])

const tableData = ref([])

const queryParam = ref({
    search: '',
    roleId: '',
    server: '',
    groupName: ''
})
const pageInfo = ref({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
})

const dialogEdit = ref({
    open: false,
    title: '',
    server: '',
    path: '',
    type: 'view',
})

const roles = ref([])
const cascade = ref([])

const handleSelectionChange = (val: any) => {
    multipleSelection.value = val
    console.log(val)
}

const handleSortChange = (column: any) => {
    console.log(column)
}

const handleCurrentChange = (val: number) => {
    queryPage()
}

const queryPage = () => {
    loading.value = true
    http.result({
        url: '/apiPath/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            roleId: queryParam.value.roleId,
            server: queryParam.value.server,
            groupName: queryParam.value.groupName
        },
        success(result) {
            tableData.value = result.data.records
            pageInfo.value.current = result.data.current
            pageInfo.value.size = result.data.size
            pageInfo.value.total = result.data.total
            pageInfo.value.pages = result.data.pages
            loading.value = false
        }
    })
}

const selectorRole = () => {
    http.result({
        url: '/role/selector',
        method: 'POST',
        success(result) {
            roles.value = result.data
        }
    })
}

const cascadeServerGroup = () => {
    http.result({
        url: '/apiPath/cascadeServerGroup',
        method: 'POST',
        success(result) {
            cascade.value = result.data
        }
    })
}

onMounted(() => {
    selectorRole()
    cascadeServerGroup()
    queryPage()
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>