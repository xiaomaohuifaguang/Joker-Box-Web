<template>
    <div class="pt-5">
        <cat-card class="mb-1 w-full">
            <label className="input input-bordered flex items-center w-full gap-2 pr-0 cat-input">
                <input type="text" class="grow" placeholder="搜索" v-model="pageParam.search" @keyup.enter="queryPage" />
                <button class="btn btn-info" @click="queryPage">
                    <el-icon :size="20">
                        <Search />
                    </el-icon>搜索
                </button>
            </label>

            <div class="flex justify-items-start">
                <label className="form-control w-full max-w-xs mr-2">
                    <div className="label">
                        <span className="label-text">角色选择</span>
                    </div>
                    <cat-select v-model="pageParam.roleId" :options="roleOptions" @change="queryPage"></cat-select>
                </label>
                <label className="form-control w-full max-w-xs mr-2">
                    <div className="label">
                        <span className="label-text">服务名称</span>
                    </div>
                    <cat-select v-model="pageParam.server" :options="apiOptions" @change="apiServerChange"></cat-select>
                </label>
                <label className="form-control w-full max-w-xs mr-2">
                    <div className="label">
                        <span className="label-text">分组名称</span>
                    </div>
                    <cat-select v-model="pageParam.groupName" :options="apiGroupOptions" @change="queryPage"></cat-select>
                </label>
            </div>

            <div className="divider"></div>
        </cat-card>
        <cat-card>
            <cat-table :tableData="tableData"></cat-table>
        </cat-card>
        <cat-card>
            <cat-page :current="pageParam.current" :size="pageParam.size" :pages="pageParam.pages"
                @pageChange="pageChange">
            </cat-page>
        </cat-card>
        <cat-modal v-model="modalView.dialog" title="查看" @close="queryPage" large>

        </cat-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { alert, http } from '@/utils'
import { message } from '@/utils'
const roleOptions = ref([]);
const apiOptions = ref([]);
const apiGroupOptions = ref([]);
const modalView = ref({
    dialog: false,
    id: ""
})
const tableData = ref({
    headers: [
        {
            name: "path",
            key: "path"
        },
        {
            name: "服务",
            key: "server"
        },
        {
            name: "分组",
            key: "groupName"
        },
        {
            name: "名称",
            key: "name"
        },
        {
            name: "白名单",
            key: "whiteListStr"
        },
        {
            name: "注册时间",
            key: "createTime"
        }
    ],
    list: [],
    operationBar: [
        {
            name: "查看",
            method: (item: any) => {
                modalView.value.dialog = true
                modalView.value.id = item.id.toString()
            },
            type: "edit",
        }
    ]
})

const pageParam = ref({
    search: "",
    current: 1,
    size: 10,
    pages: 1,
    total: 1,
    roleId: '',
    server: '',
    groupName: ''
})

const pageChange = (index: number) => {
    pageParam.value.current = index
    queryPage()
}

const roleSelector = () => {
    http.result({
        server: 'AUTH',
        url: '/role/selector',
        method: 'POST',
        success: (result) => {
            roleOptions.value = result.data
        }
    })
}
const apiSelector = () => {
    http.result({
        server: 'AUTH',
        url: '/apiPath/selector',
        method: 'POST',
        success: (result) => {
            apiOptions.value = result.data
        }
    })
}
const apiGroupSelector = (server: string) => {
    http.result({
        server: 'AUTH',
        url: '/apiPath/selector',
        method: 'POST',
        params: {
            server: server
        },
        success: (result) => {
            apiGroupOptions.value = result.data
        }
    })
}

const apiServerChange = (newValue: string) => {
    apiGroupOptions.value = []
    pageParam.value.groupName = ''
    if(newValue != ''){
        apiGroupSelector(newValue);
    }
    
    queryPage()
}


const queryPage = () => {
    http.result({
        server: 'AUTH',
        url: '/apiPath/queryPage',
        method: 'POST',
        data: {
            search: pageParam.value.search,
            current: pageParam.value.current,
            size: pageParam.value.size,
            roleId: pageParam.value.roleId,
            server: pageParam.value.server,
            groupName: pageParam.value.groupName
        },
        success: (result) => {
            pageParam.value.current = result.data.current
            pageParam.value.size = result.data.size
            pageParam.value.pages = result.data.pages
            pageParam.value.total = result.data.total
            tableData.value.list = result.data.records
        }
    })
}


onMounted(() => {
    roleSelector();
    apiSelector();
    queryPage();
})

</script>
<style lang="scss" scoped>
.cat-input {
    outline: none;
    border: 2px solid oklch(var(--in));
    /* 边框颜色 */
    border-radius: 0.375rem;
    /* 圆角 */
    /* 内边距 */
    /* 字体粗细 */
    transition: all 0.3s ease;
    /* 过渡效果 */
    appearance: none;
    /* 隐藏默认箭头 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23000'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.707a1 1 0 011.414 0L10 11.414l3.293-3.707a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1.5em 1.5em;
}

.cat-input:focus {
    outline: none;
    /* 移除焦点样式 */
    border-color: oklch(var(--in));
    /* 焦点时边框颜色 */
    box-shadow: 0 0 0 3px oklch(var(--in));
    /* 焦点时阴影 */
}
</style>