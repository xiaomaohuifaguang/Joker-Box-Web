<template>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/console' }">控制台</el-breadcrumb-item>
        <el-breadcrumb-item>身份与权限</el-breadcrumb-item>
        <el-breadcrumb-item>机构管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-divider />
    <el-row>
        <el-col :span="6">
            <el-card style="height: 80vh;">
                <el-tree style="width: 600px;" :data="orgTree" :props="{
                    children: 'children',
                    label: 'name',
                }" @node-click="handleNodeClick" node-key="id" :default-expanded-keys="[-1]">
                    <template #default="{ node, data }">
                        <span>
                            <el-icon style="margin: 0 6px 0 2px;" size="16">
                                <Org />
                            </el-icon>
                            <small @click="handleNodeClick(data)">{{ node.label }}</small>
                        </span>

                    </template>
                </el-tree>
            </el-card>
        </el-col>
        <el-col :span="18">
            <div v-loading="loading">
                <el-card>
                    <el-row :gutter="20">
                        <el-col>
                            <el-input v-model="queryParam.search" style="width: 100%" size="large" placeholder="搜索"
                                @keyup.enter="queryPage" :prefix-icon="Search">
                            </el-input>
                        </el-col>
                        <el-col>
                            <el-button type="primary" plain @click="dialogAdd = true">新建</el-button>
                        </el-col>
                    </el-row>
                </el-card>
                <el-table :data="tableData" style="width: 100%;min-height: 30vh;" stripe border
                    @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                    :default-sort="{ prop: 'date', order: 'descending' }">
                    <el-table-column type="selection" />
                    <!-- <el-table-column prop="id" label="组织id" />
                    <el-table-column prop="parentId" label="父级机构id" /> -->
                    <el-table-column prop="parentName" label="父级机构名称" />
                    <el-table-column prop="name" label="机构名称" />
                    <el-table-column prop="deleted" label="逻辑删除" />
                    <el-table-column prop="createTime" label="创建时间" />
                    <el-table-column prop="updateTime" label="更新时间" />
                    <el-table-column fixed="right" label="操作" min-width="120">
                        <template #default="scope">
                            <el-button link type="primary" size="small"
                                @click="() => { dialogEdit.open = true; dialogEdit.title = '详情'; dialogEdit.id = scope.row.id; dialogEdit.type = 'view'; }">
                                详情
                            </el-button>
                            <el-button link type="primary" size="small"
                                @click="() => { dialogEdit.open = true; dialogEdit.title = '编辑'; dialogEdit.id = scope.row.id; dialogEdit.type = 'edit'; }">
                                编辑
                            </el-button>
                            <el-button link type="danger" size="small" @click="() => {
                                confirm('提示', '确定删除吗', () => {
                                    remove(scope.row.id)
                                })
                            }">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination layout="prev, pager, next, jumper, total" :total="pageInfo.total" :size="pageInfo.size"
                    v-model:current-page="pageInfo.current" @current-change="handleCurrentChange" />
            </div>
        </el-col>
    </el-row>

    <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" width="800" center
        @closed="() => { dialogEdit.id = ''; queryPage() }">
        <OrgInfoView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
    </el-dialog>
    <el-dialog v-model="dialogAdd" title="添加" width="400" center @closed="() => { queryPage(); }">
        <OrgAddView @success="dialogAdd = false; queryOrgTree();" v-model:parentId="selectOrg.parentId"
            v-model:parentName="selectOrg.parentName" :key="selectOrg.parentId" />
    </el-dialog>

</template>

<script setup lang='ts'>
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import { Search } from '@element-plus/icons-vue'
import OrgInfoView from './OrgInfoView.vue';
import OrgAddView from './OrgAddView.vue';
import Org from '@/components/icon/Org.vue';

const loading = ref(false)

const multipleSelection = ref([])

const tableData = ref([])

const queryParam = ref({
    search: '',
    parentId: ''
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
    id: '',
    type: 'view',
})

const dialogAdd = ref(false)


const orgTree = ref([])

const selectOrg = ref({ parentId: '', parentName: '' })

const handleNodeClick = (data: any) => {
    selectOrg.value.parentId = data.id
    selectOrg.value.parentName = data.name
    queryParam.value.parentId = data.id
    queryPage()
    // console.log(data)
}


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


const queryOrgTree = () => {
    http.result({
        url: '/org/getOrgTree',
        method: 'POST',
        success(result) {
            orgTree.value = []
            orgTree.value.push(result.data);
            selectOrg.value.parentId = orgTree.value[0]['id']
            selectOrg.value.parentName = orgTree.value[0]['name']
            queryPage();
        }
    })
}


const queryPage = () => {
    loading.value = true
    http.result({
        url: '/org/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            parentId: queryParam.value.parentId
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


onMounted(() => {
    queryOrgTree();
    // queryPage();
})

const remove = (id: any) => {
    http.result({
        url: '/org/remove',
        method: 'POST',
        data: {
            id: id
        },
        success(result) {
            if (result.code == '200') {
                alert('删除成功', 'success')
            }
            queryPage()
        }
    })
}

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>