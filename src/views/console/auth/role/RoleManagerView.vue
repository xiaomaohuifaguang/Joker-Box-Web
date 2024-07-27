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
            <div className="divider"></div>
            <div class="flex justify-end">
                <button class="btn btn-primary" @click="modalAdd.dialog = true">
                    <el-icon><Plus /></el-icon>添加角色
                </button>
            </div>
        </cat-card>
        <cat-card>
            <cat-table :tableData="tableData"></cat-table>
        </cat-card>
        <cat-card>
            <cat-page 
            :current="pageParam.current" 
            :size="pageParam.size" 
            :pages="pageParam.pages" 
            @pageChange="pageChange">
        </cat-page>
        </cat-card>
        <cat-modal v-model="modalView.dialog" title="编辑"  @close="queryPage" large>
            <RoleView v-model="modalView.id"></RoleView>
        </cat-modal>
        <cat-modal v-model="modalAdd.dialog" title="添加">
            <label className="input input-bordered flex items-center gap-2">
                <input type="text" className="grow" placeholder="角色名称" v-model="modalAdd.roleName" />
            </label>
            <div class="flex justify-center mt-3">
                <button class="btn btn-primary btn-sm" @click="add">
                    添加
                </button>
            </div>
        </cat-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { alert, http } from '@/utils'
import { message } from '@/utils'
import RoleView from '@/views/console/auth/role/RoleViewView.vue'

const modalView = ref({
    dialog: false,
    id: ""
})
const modalAdd = ref({
    dialog: false,
    roleName: ""
})
const tableData = ref({
    headers: [
        {
            name: "id",
            key: "id"
        },
        {
            name: "名称",
            key: "name"
        }
    ],
    list: [],
    operationBar: [
        {
            name: "编辑",
            method: (item: any) => {
                modalView.value.dialog = true
                modalView.value.id = item.id.toString()
            },
            type: "edit",
        },
        {
            name: "删除",
            method: (item: any) => {
                deleteOne(item.id.toString())
            },
            type: "delete",
        },
        // {
        //     name: "一键强制删除",
        //     method: (item: any) => {
        //         destroyOne(item.id.toString())
        //     },
        //     type: "delete",
        // }
    ]
})

const pageParam = ref({
    search: "",
    current: 1,
    size: 10,
    pages: 1,
    total: 1
})

const pageChange = (index: number) => {
    pageParam.value.current = index
    queryPage()
}


const queryPage = () => {
    http.result({
        server: 'AUTH',
        url: '/role/queryPage',
        method: 'POST',
        data: {
            search: pageParam.value.search,
            current: pageParam.value.current,
            size: pageParam.value.size,
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
const deleteOne = (roleId: string) => {
    message({
        title: "提示",
        content: "确认删除",
        actions: [
            {
                name: "确认",
                method: () => {
                    http.result({
                        server: 'AUTH',
                        url: '/role/delete',
                        method: 'POST',
                        params: {
                            roleId: roleId
                        },
                        success: (result) => {
                            alert(result.msg, "success");
                            queryPage();
                        }
                    })
                }
            },
            {
                name: "取消"
            }
        ]
    })
}
const destroyOne = (roleId: string) => {
    message({
        title: "提示",
        content: "确认强制删除，将删除其关联所有信息",
        actions: [
            {
                name: "确认",
                method: () => {
                    http.result({
                        server: 'AUTH',
                        url: '/role/destroy',
                        method: 'POST',
                        params: {
                            roleId: roleId
                        },
                        success: (result) => {
                            alert(result.msg, "success");
                            queryPage();
                        }
                    })
                }
            },
            {
                name: "取消"
            }
        ]
    })
}

const add = () => {
    modalAdd.value.dialog = false
    http.result({
        server:"AUTH",
        url:"/role/add",
        method:"POST",
        params:{
            roleName: modalAdd.value.roleName
        },
        success(result){
            alert(result.msg,'success')
            queryPage()
        }
    })
}

onMounted(() => {
    queryPage()
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