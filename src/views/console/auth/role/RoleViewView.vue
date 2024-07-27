<template>
    <div style="">
        <div class="flex flex-row pr-5">
            <div class="basis-4/12">
                <div class="form-control mb-2">
                    <label className="input input-bordered flex items-center gap-2">
                        ID
                        <input type="text" className="grow" placeholder="" v-model="info.id" disabled />
                    </label>
                </div>
                <div class="form-control mb-2">

                    <label className="input input-bordered flex items-center gap-2">
                        角色名称
                        <input type="text" className="grow" placeholder="" v-model="info.name" />
                    </label>
                </div>
                <div class="form-control mb-2"><label className="input input-bordered flex items-center gap-2">
                        创建时间
                        <input type="text" className="grow" placeholder="" v-model="info.createTime" disabled />
                    </label>
                </div>
                <div class="form-control mb-2"><label className="input input-bordered flex items-center gap-2">
                        更新时间
                        <input type="text" className="grow" placeholder="" v-model="info.updateTime" disabled />
                    </label>
                </div>

            </div>

            <div class="divider divider-horizontal"></div>
            <div class="basis-8/12">
                <div role="tablist" className="tabs tabs-boxed">
                    <a role="tab" 
                        v-for="server in apiPathTree" 
                        :class="server['server'] == serverActive ? 'tab tab-active' : 'tab'" 
                        @click="serverActive = server['server']">
                        {{ server['server'] }}
                    </a>
                </div>
                <div class="overflow-x-hidden" style="max-height: 40vh;" role="tabpanel">
                    <div v-for="server in apiPathTree" v-show="server['server'] == serverActive">
                        <!-- 服务：{{ server['server'] }} -->
                        <div v-for="group in server['groups']">
                            <div className="divider"></div>
                            <div class="font-bold	">分组：{{ group['groupName'] }}</div>
                            <cat-row class="mt-1">
                                <cat-col v-for="apiPath in group['apiPaths']" :span="4" class="mb-1">
                                    <div class="flex justify-start">
                                        <div className="label-text mr-1">{{ apiPath['name'] }}</div>
                                        <input type="checkbox" defaultChecked className="checkbox checkbox-primary"
                                            disabled v-if="apiPath['whiteList'] == '1'" />
                                        <input type="checkbox" v-model="apiPath['roleBind']"
                                            className="checkbox checkbox-primary" v-if="apiPath['whiteList'] == '0'" />
                                    </div>
                                </cat-col>
                            </cat-row>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div className="divider"></div>
        <div class="flex justify-center">
            <button class="btn btn-primary" @click="save">
                保存
            </button>
        </div>
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

} as any)

const apiPathTree = ref([] as any)

const serverActive = ref('')

onMounted(() => {
    getInfo()
})

const getInfo = () => {
    http.result({
        server: "AUTH",
        url: "/role/info",
        method: "POST",
        params: {
            roleId: props.modelValue
        },
        success(result) {
            if (result.data != null) {
                info.value = result.data
                queryApiPathTree();
            } else {
                alert("角色不存在", "error")
            }
        }
    })
}

const queryApiPathTree = () => {
    http.result({
        server: "AUTH",
        url: "/role/apiPathTreeWithRole",
        method: "POST",
        params: {
            roleId: props.modelValue
        },
        success(result) {
            apiPathTree.value = result.data;
            serverActive.value = apiPathTree.value[0]['server'];
        }
    })
}
const save = () => {
    http.result({
        server: "AUTH",
        url: "/role/save",
        method: "POST",
        data: {
            role: info.value,
            apiPathTree: apiPathTree.value
        },
        success(result) {
            alert(result.msg, 'success')
            getInfo()
        }
    })
}

</script>

<style lang="scss" scoped></style>