<template>
    <div style="">
        <div class="flex flex-row pr-5">
            <div class="basis-4/12">

                <div class="form-control mb-2">
                    <label className="input input-bordered flex items-center gap-2">
                        ID
                        <input type="text" className="grow" placeholder="" v-model="info.idStr" disabled style="cursor: pointer;"/>
                    </label>
                </div>
                <div class="form-control mb-2">

                    <label className="input input-bordered flex items-center gap-2">
                        用户名
                        <input type="text" className="grow" placeholder="" v-model="info.username" disabled style="cursor: pointer;"/>
                    </label>
                </div>
                <div class="form-control mb-2">
                    <label className="input input-bordered flex items-center gap-2">
                        性别
                        <input type="text" className="grow" placeholder="" :value="info['userExtend']['sex']"
                            disabled style="cursor: pointer;"/>
                    </label>
                </div>

                <div class="form-control mb-2">

                    <label className="input input-bordered flex items-center gap-2">
                        邮箱
                        <input type="text" className="grow" placeholder="" v-model="info.userExtend.mail" disabled style="cursor: pointer;"/>
                    </label>
                </div>
                <div class="form-control mb-2">

                    <label className="input input-bordered flex items-center gap-2">
                        手机
                        <input type="text" className="grow" placeholder="" v-model="info.userExtend.phone" disabled style="cursor: pointer;"/>
                    </label>
                </div>
                <div class="form-control mb-2"><label className="input input-bordered flex items-center gap-2">
                        注册时间
                        <input type="text" className="grow" placeholder="" v-model="info.createTime" disabled style="cursor: pointer;"/>
                    </label>
                </div>
                <!-- <div class="form-control mb-2"><label className="input input-bordered flex items-center gap-2">
                        更新时间
                        <input type="text" className="grow" placeholder="" v-model="info.updateTime" disabled style="cursor: pointer;"/>
                    </label>
                </div> -->

            </div>

            <div class="divider divider-horizontal"></div>
            <div class="basis-8/12">
                <div class="overflow-x-hidden" style="max-height: 40vh;" role="tabpanel">
                    <cat-row>
                        <cat-col class="flex justify-end">
                            <button class="btn btn-outline btn-info mr-2"
                                @click="resetPassword">重置密码</button>
                            <button class="btn btn-outline btn-info"
                                @click="modalAdd.dialog = !modalAdd.dialog">添加绑定角色</button>
                        </cat-col>
                    </cat-row>
                    <div class="divider"></div>
                    <div>
                        当前绑定角色
                    </div>
                    <cat-row>
                        <cat-col :span="4" v-for="item in roles" class="mb-2">
                            <div class="flex justify-center">
                                <div class="mr-1">{{ item['name'] }}</div>
                                <button class="btn btn-error btn-outline btn-sm" @click="deleteRole(item.id)">x</button>
                            </div>
                        </cat-col>
                    </cat-row>
                </div>

            </div>
        </div>
        <cat-modal v-model="modalAdd.dialog" title="添加">
            <div class="flex justify-center w-full">
                <label className="form-control mr-2 max-w-xs w-9/12">
                    <div className="label">
                        <span className="label-text">角色选择</span>
                    </div>
                    <cat-select v-model="modalAdd.roleId" :options="roleOptions" class="w-full"></cat-select>
                </label>
            </div>
            <div class="flex justify-center mt-3">
                <button class="btn btn-primary btn-sm" @click="addRole">
                    添加
                </button>
            </div>
        </cat-modal>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { message, alert, http } from '@/utils'


const props = defineProps<{
    modelValue: string
}>();
const emit = defineEmits(['update:modelValue']);

const info = ref({
    userExtend: {

    }
} as any)
const roles = ref([] as any)

const roleOptions = ref([]);

const modalAdd = ref({
    dialog: false,
    roleId: ''
})


onMounted(() => {
    getInfo();
    roleSelector();
})

const getInfo = () => {
    http.result({
        server: "AUTH",
        url: "/user/userInfo",
        method: "POST",
        params: {
            userId: props.modelValue
        },
        success(result) {
            if (result.data != null) {
                info.value = result.data
                getRoles();
            } else {
                alert("用户不存在", "error")
            }
        }
    })
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

const getRoles = () => {
    http.result({
        server: "AUTH",
        url: "/user/roles",
        method: "POST",
        params: {
            userId: props.modelValue
        },
        success(result) {
            roles.value = result.data
        }
    })
}

const addRole = () => {
    http.result({
        server: "AUTH",
        url: "/user/addRole",
        method: "POST",
        params: {
            userId: props.modelValue,
            roleId: modalAdd.value.roleId
        },
        success(result) {
            getInfo()
            modalAdd.value.dialog = false
        }
    })
}

const deleteRole = (roleId: any) => {
    message({
        title: "提示",
        content: "确认删除",
        actions: [
            {
                name: "确认",
                method: () => {
                    http.result({
                        server: "AUTH",
                        url: "/user/deleteRole",
                        method: "POST",
                        params: {
                            userId: props.modelValue,
                            roleId: roleId
                        },
                        success(result) {
                            getInfo()
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

const resetPassword = () => {
    message({
        title: "提示",
        content: "确认重置密码吗",
        actions: [
            {
                name: "确认",
                method: () => {
                    http.result({
                        server: "AUTH",
                        url: "/user/resetPassword",
                        method: "POST",
                        params: {
                            userId: props.modelValue,
                        },
                        success(result) {
                            alert(result.msg,'success')
                            getInfo()
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

</script>

<style lang="scss" scoped>

</style>