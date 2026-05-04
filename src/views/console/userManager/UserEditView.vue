<template>
  <div class="user-edit-page">
    <div v-loading="loading" element-loading-text="加载中...">
      <el-row :gutter="24">
        <!-- 用户基本信息 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <div class="info-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon>
                  <UserFilled />
                </el-icon>
              </div>
              <span class="header-title">基本信息</span>
            </div>
            <div class="card-body">
              <el-form label-position="top" class="info-form">
                <el-form-item label="用户ID">
                  <el-input v-model="info.idStr" disabled :prefix-icon="Key" />
                </el-form-item>
                <el-form-item label="用户名">
                  <el-input v-model="info.username" disabled :prefix-icon="User" />
                </el-form-item>
                <el-form-item label="用户昵称">
                  <el-input v-model="info.nickname" disabled :prefix-icon="Star" />
                </el-form-item>
                <el-form-item label="创建时间">
                  <el-input v-model="info.createTime" disabled :prefix-icon="Clock" />
                </el-form-item>
                <el-form-item label="更新时间">
                  <el-input v-model="info.updateTime" disabled :prefix-icon="Timer" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-input v-model="info.userExtend.sex" disabled
                    :prefix-icon="info.userExtend.sex === '男' ? Male : (info.userExtend.sex === '女' ? Female : User)" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="info.userExtend.mail" disabled :prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="info.userExtend.phone" disabled :prefix-icon="Phone" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>

        <!-- 角色和机构信息 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="16">
          <!-- 角色信息 -->
          <div class="role-card">
            <div class="card-header">
              <div class="header-icon role">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <span class="header-title">角色信息</span>
              <el-button v-if="props.type === 'edit'" type="primary" size="small" @click="dialogAddRole.open = true">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>添加角色</span>
              </el-button>
            </div>
            <div class="card-body">
              <div v-if="roles.length === 0" class="empty-state">
                <el-icon>
                  <User />
                </el-icon>
                <span>暂无角色</span>
              </div>
              <div v-else class="tag-list">
                <el-tag v-for="role in roles" :key="role.id" :closable="props.type === 'edit'"
                  :disable-transitions="false" @close="confirmRemoveRole(role.id)" size="large" class="role-tag">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>{{ role.name }}</span>
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 机构信息 -->
          <div class="org-card">
            <div class="card-header">
              <div class="header-icon org">
                <el-icon>
                  <OfficeBuilding />
                </el-icon>
              </div>
              <span class="header-title">机构信息</span>
              <el-button v-if="props.type === 'edit'" type="primary" size="small" @click="dialogAddOrg.open = true">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>选择机构</span>
              </el-button>
            </div>
            <div class="card-body">
              <div v-if="orgs.length === 0" class="empty-state">
                <el-icon>
                  <OfficeBuilding />
                </el-icon>
                <span>暂无机构</span>
              </div>
              <div v-else class="tag-list">
                <el-tag v-for="org in orgs" :key="org.id" :closable="props.type === 'edit'" :disable-transitions="false"
                  @close="confirmRemoveOrg(org.id)" size="large" class="org-tag">
                  <el-icon>
                    <OfficeBuilding />
                  </el-icon>
                  <span>{{ org.name }}</span>
                </el-tag>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 添加角色对话框 -->
    <el-dialog v-model="dialogAddRole.open" title="关联角色" width="500px" center destroy-on-close
      @closed="dialogAddRole.roleId = ''" class="add-dialog">
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
      @closed="dialogAddOrg.orgId = ''" class="add-dialog">
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
import {
  Plus,
  UserFilled,
  User,
  Star,
  Male,
  Female,
  Clock,
  Timer,
  Message,
  Phone,
  Key,
  OfficeBuilding
} from '@element-plus/icons-vue'
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

const roles = ref<any[]>([])
const selectorRoles = ref<any[]>([])
const orgs = ref<any[]>([])
const orgTree = ref<any[]>([])

const dialogAddRole = ref({
  open: false,
  roleId: ''
})

const dialogAddOrg = ref({
  open: false,
  orgId: ''
})

const queryInfo = async () => {
  if (!props.id) return;

  loading.value = true
  try {
    info.value = await http.post('/user/userInfo', undefined, { params: { userId: props.id } })
    queryRoles()
    selectorRole()
    queryOrgs()
    queryOrgTree()
  } finally {
    loading.value = false
  }
}

const queryRoles = async () => {
  roles.value = await http.post('/user/roles', undefined, { params: { userId: props.id } })
}

const queryOrgs = async () => {
  orgs.value = await http.post('/user/orgs', undefined, { params: { userId: props.id } })
}

const selectorRole = async () => {
  selectorRoles.value = await http.post('/role/selector')
}

const queryOrgTree = async () => {
  const result = await http.post('/org/getOrgTree')
  orgTree.value = [result]
}

const confirmRemoveRole = (roleId: string) => {
  confirm('提示', '确定删除该角色吗？', async () => await removeRole(roleId))
}

const removeRole = async (roleId: string) => {
  await http.post('/user/deleteRole', undefined, { params: { userId: props.id, roleId } })
  alert('删除成功', 'success')
  queryInfo()
}

const confirmRemoveOrg = (orgId: string) => {
  confirm('提示', '确定删除该机构吗？', async () => await removeOrg(orgId))
}

const removeOrg = async (orgId: string) => {
  await http.post('/user/deleteOrg', undefined, { params: { userId: props.id, orgId } })
  alert('删除成功', 'success')
  queryInfo()
}

const addRole = async () => {
  if (!dialogAddRole.value.roleId) {
    alert('请选择角色', 'warning')
    return
  }

  await http.post('/user/addRole', undefined, { params: { userId: props.id, roleId: dialogAddRole.value.roleId } })
  alert('关联成功', 'success')
  dialogAddRole.value.open = false
  queryInfo()
}

const addOrg = async () => {
  if (!dialogAddOrg.value.orgId) {
    alert('请选择机构', 'warning')
    return
  }

  await http.post('/user/addOrg', undefined, { params: { userId: props.id, orgId: dialogAddOrg.value.orgId } })
  alert('关联成功', 'success')
  dialogAddOrg.value.open = false
  queryInfo()
}

onMounted(() => {
  queryInfo()
})
</script>

<style scoped lang="scss">
.user-edit-page {
  padding: 24px;

  .info-card,
  .role-card,
  .org-card {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 24px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-light);

      .header-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 20px;
          color: white;
        }

        &:not(.role):not(.org) {
          background: var(--brand-gradient);
        }

        &.role {
          background: var(--data-grad-4);
        }

        &.org {
          background: var(--data-grad-3);
        }
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
      }

      .el-button {
        border-radius: 8px;
      }
    }

    .card-body {
      .info-form {
        :deep(.el-form-item__label) {
          font-weight: 500;
          color: var(--text-regular);
          padding-bottom: 8px;
        }

        :deep(.el-input__wrapper) {
          border-radius: 10px;
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        color: var(--text-secondary);
        gap: 12px;

        .el-icon {
          font-size: 48px;
          opacity: 0.4;
        }

        span {
          font-size: 14px;
        }
      }

      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .el-tag {
          padding: 0 16px;
          height: 36px;
          line-height: 36px;
          font-size: 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            font-size: 14px;
          }

          &.role-tag {
            background: var(--success-bg);
            border-color: var(--success);
            color: var(--success);
          }

          &.org-tag {
            background: var(--bg-overlay);
            border-color: var(--brand-primary-light);
            color: var(--brand-primary);
          }
        }
      }
    }
  }
}

.add-dialog {
  :deep(.el-dialog__header) {
    background: var(--brand-gradient);
    margin: 0;
    padding: 20px 24px;

    .el-dialog__title {
      color: white;
      font-weight: 600;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid var(--border-light);
  }
}

@media (max-width: 768px) {
  .user-edit-page {
    padding: 16px;

    .info-card,
    .role-card,
    .org-card {
      padding: 16px;
    }
  }
}
</style>
