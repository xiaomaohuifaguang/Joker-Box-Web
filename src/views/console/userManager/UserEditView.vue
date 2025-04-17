<template>
    <div class="user-detail-container">
        <div v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.7)">
            <el-row :gutter="24">
                <!-- 用户基本信息 -->
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <el-card class="info-card" shadow="never">
                        <template #header>
                            <div class="card-header">
                                <span>基本信息</span>
                            </div>
                        </template>

                        <el-form label-position="left" label-width="100px">
                            <el-form-item label="用户ID">
                                <el-input v-model="info.idStr" disabled />
                            </el-form-item>
                            <el-form-item label="用户名">
                                <el-input v-model="info.username" disabled />
                            </el-form-item>
                            <el-form-item label="用户昵称">
                                <el-input v-model="info.nickname" disabled />
                            </el-form-item>
                            <el-form-item label="创建时间">
                                <el-input v-model="info.createTime" disabled />
                            </el-form-item>
                            <el-form-item label="更新时间">
                                <el-input v-model="info.updateTime" disabled />
                            </el-form-item>
                            <el-form-item label="性别">
                                <el-input v-model="info.userExtend.sex" disabled />
                            </el-form-item>
                            <el-form-item label="邮箱">
                                <el-input v-model="info.userExtend.mail" disabled />
                            </el-form-item>
                            <el-form-item label="手机号">
                                <el-input v-model="info.userExtend.phone" disabled />
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-col>

                <!-- 角色和机构信息 -->
                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <!-- 角色信息 -->
                    <el-card class="role-card" shadow="never">
                        <template #header>
                            <div class="card-header">
                                <span>角色信息</span>
                                <el-button v-if="props.type === 'edit'" type="primary" size="small" plain
                                    @click="dialogAddRole.open = true">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                    <span>添加角色</span>
                                </el-button>
                            </div>
                        </template>

                        <el-empty v-if="roles.length === 0" description="暂无角色" :image-size="80" />

                        <el-space wrap :size="20" v-else>
                            <el-tag v-for="role in roles" :key="role.id" closable :disable-transitions="false"
                                @close="confirmRemoveRole(role.id)" size="large">
                                {{ role.name }}
                            </el-tag>
                        </el-space>
                    </el-card>

                    <!-- 机构信息 -->
                    <el-card class="org-card" shadow="never">
                        <template #header>
                            <div class="card-header">
                                <span>机构信息</span>
                                <el-button v-if="props.type === 'edit'" type="primary" size="small" plain
                                    @click="dialogAddOrg.open = true">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                    <span>选择机构</span>
                                </el-button>
                            </div>
                        </template>

                        <el-empty v-if="orgs.length === 0" description="暂无机构" :image-size="80" />

                        <el-space wrap :size="20" v-else>
                            <el-tag v-for="org in orgs" :key="org.id" closable :disable-transitions="false"
                                @close="confirmRemoveOrg(org.id)" size="large">
                                {{ org.name }}
                            </el-tag>
                        </el-space>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 添加角色对话框 -->
        <el-dialog v-model="dialogAddRole.open" title="关联角色" width="500px" center destroy-on-close
            @closed="dialogAddRole.roleId = ''">
            <el-select v-model="dialogAddRole.roleId" placeholder="请选择角色" size="large" style="width: 100%" clearable>
                <el-option v-for="item in selectorRoles" :key="item.key" :label="item.value" :value="item.key" />
            </el-select>

            <template #footer>
                <el-button @click="dialogAddRole.open = false">取消</el-button>
                <el-button type="primary" @click="addRole">关联</el-button>
            </template>
        </el-dialog>

        <!-- 添加机构对话框 -->
        <el-dialog v-model="dialogAddOrg.open" title="关联机构" width="500px" center destroy-on-close
            @closed="dialogAddOrg.orgId = ''">
            <el-cascader v-model="dialogAddOrg.orgId" :options="orgTree" :props="{
                children: 'children',
                label: 'name',
                value: 'id',
                emitPath: false,
                checkStrictly: true,
            }" placeholder="请选择机构" size="large" style="width: 100%" clearable />

            <template #footer>
                <el-button @click="dialogAddOrg.open = false">取消</el-button>
                <el-button type="primary" @click="addOrg">关联</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { alert, http, confirm } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)

const info = ref({
    "id": "",
    "type": "0",
    "deleted": "0",
    "username": "",
    "password": "",
    "nickname": "",
    "createTime": "",
    "updateTime": "",
    "userExtend": {
        "userId": null,
        "sex": null,
        "mail": null,
        "phone": null
    },
    "idStr": ""
})

const roles = ref([])
const selectorRoles = ref([])
const orgs = ref([])
const orgTree = ref([])

const dialogAddRole = ref({
    open: false,
    roleId: ''
})

const dialogAddOrg = ref({
    open: false,
    orgId: ''
})

const queryInfo = () => {
    if (!props.id) return;

    loading.value = true
    http.result({
        url: '/user/userInfo',
        method: 'POST',
        params: { userId: props.id },
        success(result) {
            info.value = result.data
            queryRoles()
            selectorRole()
            queryOrgs()
            queryOrgTree()
            loading.value = false
        }
    })
}

const queryRoles = () => {
    http.result({
        url: '/user/roles',
        method: 'POST',
        params: { userId: props.id },
        success(result) {
            roles.value = result.data
        }
    })
}

const queryOrgs = () => {
    http.result({
        url: '/user/orgs',
        method: 'POST',
        params: { userId: props.id },
        success(result) {
            orgs.value = result.data
        }
    })
}

const selectorRole = () => {
    http.result({
        url: '/role/selector',
        method: 'POST',
        success(result) {
            selectorRoles.value = result.data
        }
    })
}

const queryOrgTree = () => {
    http.result({
        url: '/org/getOrgTree',
        method: 'POST',
        success(result) {
            orgTree.value = [result.data]
        }
    })
}

const confirmRemoveRole = (roleId: string) => {
    confirm('提示', '确定删除该角色吗？', () => removeRole(roleId))
}

const removeRole = (roleId: string) => {
    http.result({
        url: '/user/deleteRole',
        method: 'POST',
        params: { userId: props.id, roleId },
        success(result) {
            if (result.code == 200) {
                alert('删除成功', 'success')
            }
            queryInfo()
        }
    })
}

const confirmRemoveOrg = (orgId: string) => {
    confirm('提示', '确定删除该机构吗？', () => removeOrg(orgId))
}

const removeOrg = (orgId: string) => {
    http.result({
        url: '/user/deleteOrg',
        method: 'POST',
        params: { userId: props.id, orgId },
        success(result) {
            if (result.code == 200) {
                alert('删除成功', 'success')
            }
            queryInfo()
        }
    })
}

const addRole = () => {
    if (!dialogAddRole.value.roleId) {
        alert('请选择角色', 'warning')
        return
    }

    http.result({
        url: '/user/addRole',
        method: 'POST',
        params: { userId: props.id, roleId: dialogAddRole.value.roleId },
        success(result) {
            if (result.code == 200) {
                alert('关联成功', 'success')
                dialogAddRole.value.open = false
                queryInfo()
            }
        }
    })
}

const addOrg = () => {
    if (!dialogAddOrg.value.orgId) {
        alert('请选择机构', 'warning')
        return
    }

    http.result({
        url: '/user/addOrg',
        method: 'POST',
        params: { userId: props.id, orgId: dialogAddOrg.value.orgId },
        success(result) {
            if (result.code == 200) {
                alert('关联成功', 'success')
                dialogAddOrg.value.open = false
                queryInfo()
            }
        }
    })
}

onMounted(() => {
    queryInfo()
})
</script>

<style scoped lang="scss">
.user-detail-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.info-card,
.role-card,
.org-card {
    margin-bottom: 20px;
    border-radius: 8px;

    :deep(.el-card__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding: 16px 20px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

.el-form-item {
    margin-bottom: 18px;
}

.el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 0 16px;
    height: 32px;
    line-height: 32px;
    font-size: 14px;
}

@media (max-width: 768px) {
    .el-col {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }
    }
}
</style>