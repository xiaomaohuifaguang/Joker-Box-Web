<template>
    <div v-loading="loading">
        <el-row :gutter="20">
            <el-col :span="8">
                <el-form label-position="left" label-width="auto">
                    <el-form-item label="ID">
                        <el-input v-model="info.idStr" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="用户名">
                        <el-input v-model="info.username" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="用户昵称">
                        <el-input v-model="info.nickname" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-input v-model="info.userExtend.sex" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="info.userExtend.mail" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input v-model="info.userExtend.phone" autocomplete="off" disabled />
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="16">
                <div>
                    <el-card style="display: flex;justify-content: center;" v-if="props.type == 'edit'">
                        <el-button type="primary" plain @click="dialogAddRole.open = true" size="large">添加角色</el-button>
                    </el-card>
                    <el-row :gutter="20">
                        <el-col :span="8" v-for="role in roles">
                            <el-button-group>
                                <el-button>{{ role.name }}</el-button>
                                <el-button type="danger" :icon="Delete" v-if="props.type == 'edit'" @click="() => {
                                    confirm('提示', '确定删除吗', () => {
                                        removeRole(role.id)
                                    })
                                }" />
                            </el-button-group>
                        </el-col>
                    </el-row>

                    <el-card style="display: flex;justify-content: center;margin-top: 1rem;"
                        v-if="props.type == 'edit'">
                        <el-button type="primary" plain @click="dialogAddRole.open = true" size="large">选择机构</el-button>
                    </el-card>
                    <el-row :gutter="20">
                        <el-col :span="8" v-for="role in roles">
                            <el-button-group>
                                <el-button>{{ role.name }}</el-button>
                                <el-button type="danger" :icon="Delete" v-if="props.type == 'edit'" @click="() => {
                                    confirm('提示', '确定删除吗', () => {
                                        removeRole(role.id)
                                    })
                                }" />
                            </el-button-group>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
        </el-row>
    </div>
    <el-dialog v-model="dialogAddRole.open" title="关联角色" width="400" center>
        <el-select v-model="dialogAddRole.roleId" placeholder="" size="large" style="width: 100%;" clearable>
            <template #prefix>选择角色</template>
            <el-option v-for="item in selectorRoles" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>
        <div style="display: flex;justify-content: center;margin-top: 1rem;" v-if="props.type == 'edit'">
            <el-button type="primary" plain @click="addRole" size="large">关联</el-button>
        </div>
    </el-dialog>
</template>

<script setup lang='ts'>
import { alert, http, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue'
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

const dialogAddRole = ref({
    open: false,
    roleId: ''
})

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/user/userInfo',
        method: 'POST',
        params: {
            userId: props.id
        },
        success(result) {
            info.value = result.data
            queryRoles()
            selectorRole()
            loading.value = false
        }
    })
}

const queryRoles = () => {
    http.result({
        url: '/user/roles',
        method: 'POST',
        params: {
            userId: props.id
        },
        success(result) {
            roles.value = result.data
        }
    })
}

const removeRole = (roleId: any) => {
    http.result({
        url: '/user/deleteRole',
        method: 'POST',
        params: {
            userId: props.id,
            roleId: roleId
        },
        success(result) {
            if (result.code == 200) {
                alert('删除成功', 'success')
            }
            queryInfo()
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

const addRole = () => {
    http.result({
        url: '/user/addRole',
        method: 'POST',
        params: {
            userId: props.id,
            roleId: dialogAddRole.value.roleId
        },
        success(result) {
            if (result.code == 200) {
                alert('关联成功', 'success');
                dialogAddRole.value.roleId = ''
                dialogAddRole.value.open = false
                queryInfo()
            }
        }
    })
}


onMounted(() => {
    if (props.id == '') return;
    queryInfo()
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>