<template>
    <div class="code-table-page">
        <PageHeader :icon="Collection" title="码表管理" description="维护动态表单和业务通用候选项" />

        <div class="page-container">
            <div class="breadcrumb-wrapper">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item :to="{ path: '/console' }">
                        <el-icon><House /></el-icon>
                        <span>控制台</span>
                    </el-breadcrumb-item>
                    <el-breadcrumb-item>系统管理</el-breadcrumb-item>
                    <el-breadcrumb-item>码表管理</el-breadcrumb-item>
                </el-breadcrumb>
            </div>

            <div class="search-section">
                <div class="section-header">
                    <div class="header-icon search"><el-icon><Search /></el-icon></div>
                    <span class="header-title">筛选条件</span>
                </div>
                <div class="search-form">
                    <el-row :gutter="16">
                        <el-col :xs="24" :sm="12" :md="6">
                            <el-input v-model="queryParam.code" placeholder="码表编码" clearable @keyup.enter="queryPage" />
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="6">
                            <el-input v-model="queryParam.name" placeholder="码表名称" clearable @keyup.enter="queryPage" />
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="4">
                            <el-select v-model="queryParam.tree" placeholder="类型" clearable style="width: 100%">
                                <el-option label="平铺" value="0" />
                                <el-option label="树形" value="1" />
                            </el-select>
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="4">
                            <el-select v-model="queryParam.status" placeholder="状态" clearable style="width: 100%">
                                <el-option label="启用" value="1" />
                                <el-option label="停用" value="0" />
                            </el-select>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="4" class="search-actions">
                            <el-button type="primary" @click="queryPage">查询</el-button>
                            <el-button @click="resetQuery">重置</el-button>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <div class="table-section" v-loading="loading" element-loading-text="加载中...">
                <div class="section-header">
                    <div class="header-icon table"><el-icon><List /></el-icon></div>
                    <span class="header-title">码表列表</span>
                    <span class="header-count">共 {{ pageInfo.total }} 条</span>
                    <el-button class="header-action" type="primary" @click="openAddDialog">
                        <el-icon><Plus /></el-icon>
                        新增码表
                    </el-button>
                </div>

                <div class="table-wrapper">
                    <el-table :data="tableData" stripe style="width: 100%">
                        <el-table-column prop="code" label="编码" min-width="160" show-overflow-tooltip />
                        <el-table-column prop="name" label="名称" min-width="150" show-overflow-tooltip />
                        <el-table-column prop="tree" label="类型" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.tree === '1' ? 'success' : 'info'" effect="light">
                                    {{ row.tree === '1' ? '树形' : '平铺' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.status === '1' ? 'success' : 'danger'" effect="light">
                                    {{ row.status === '1' ? '启用' : '停用' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
                        <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip />
                        <el-table-column prop="updateTime" label="更新时间" width="170" show-overflow-tooltip />
                        <el-table-column label="操作" fixed="right" width="220" align="center">
                            <template #default="{ row }">
                                <el-button type="success" link size="small" @click="openItemDialog(row)">码项</el-button>
                                <el-button type="primary" link size="small" @click="openEditDialog(row.id)">编辑</el-button>
                                <el-button type="danger" link size="small" @click="confirmDelete(row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <div class="pagination-wrapper">
                    <el-pagination v-model:current-page="pageInfo.current" :page-size="pageInfo.size"
                        :total="pageInfo.total" layout="total, sizes, prev, pager, next, jumper"
                        :page-sizes="[10, 20, 50, 100]" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" />
                </div>
            </div>
        </div>

        <CodeTableDialog v-model="tableDialog.open" :type="tableDialog.type" :id="tableDialog.id" @success="onTableSaved" />
        <CodeItemManagerDialog v-model="itemDialog.open" :table="itemDialog.table" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Collection, House, List, Plus, Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { alert, confirm, http } from '@/utils'
import CodeTableDialog from './CodeTableDialog.vue'
import CodeItemManagerDialog from './CodeItemManagerDialog.vue'

interface CodeTable {
    id?: string
    code: string
    name: string
    tree: '0' | '1'
    status: '0' | '1'
    remark?: string
    createTime?: string
    updateTime?: string
}

const loading = ref(false)
const tableData = ref<CodeTable[]>([])
const queryParam = ref({ code: '', name: '', tree: '', status: '' })
const pageInfo = ref({ current: 1, size: 10, total: 0, pages: 0 })
const tableDialog = ref<{ open: boolean; type: 'add' | 'edit'; id?: string }>({ open: false, type: 'add', id: undefined })
const itemDialog = ref<{ open: boolean; table: CodeTable | null }>({ open: false, table: null })

const queryPage = async () => {
    loading.value = true
    try {
        const result: any = await http.post('/code-table/page', {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            code: queryParam.value.code || undefined,
            name: queryParam.value.name || undefined,
            tree: queryParam.value.tree || undefined,
            status: queryParam.value.status || undefined,
        })
        tableData.value = result?.records || []
        pageInfo.value.current = result?.current || pageInfo.value.current
        pageInfo.value.size = result?.size || pageInfo.value.size
        pageInfo.value.total = result?.total || 0
        pageInfo.value.pages = result?.pages || 0
    } finally {
        loading.value = false
    }
}

const resetQuery = () => {
    queryParam.value = { code: '', name: '', tree: '', status: '' }
    pageInfo.value.current = 1
    queryPage()
}

const handleSizeChange = (size: number) => {
    pageInfo.value.size = size
    pageInfo.value.current = 1
    queryPage()
}

const handleCurrentChange = () => {
    queryPage()
}

const openAddDialog = () => {
    tableDialog.value = { open: true, type: 'add', id: undefined }
}

const openEditDialog = (id?: string) => {
    if (!id) return
    tableDialog.value = { open: true, type: 'edit', id }
}

const openItemDialog = (table: CodeTable) => {
    itemDialog.value = { open: true, table }
}

const onTableSaved = () => {
    tableDialog.value.open = false
    queryPage()
}

const confirmDelete = (row: CodeTable) => {
    confirm('提示', `确定删除码表「${row.name}」吗？删除后会同步删除该码表下所有码项。`, async () => {
        await http.post('/code-table/delete', undefined, { params: { id: row.id } })
        alert('删除成功', 'success')
        queryPage()
    })
}

onMounted(queryPage)
</script>

<style scoped lang="scss">
.code-table-page {
    min-height: 100%;
}

.page-container {
    padding: 20px;
}

.breadcrumb-wrapper,
.search-section,
.table-section {
    background: var(--bg-container);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.breadcrumb-wrapper {
    padding: 14px 16px;
    margin-bottom: 16px;
}

.search-section,
.table-section {
    padding: 18px;
    margin-bottom: 16px;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.header-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.search {
        background: var(--brand-gradient);
    }

    &.table {
        background: var(--success);
    }
}

.header-title {
    font-size: var(--fs-lg);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
}

.header-count {
    color: var(--text-secondary);
    font-size: var(--fs-sm);
}

.header-action {
    margin-left: auto;
}

.search-actions {
    display: flex;
    gap: 8px;
}

.table-wrapper {
    overflow: hidden;
    border-radius: var(--radius-md);
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}
</style>
