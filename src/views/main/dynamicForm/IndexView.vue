<template>
    <el-row>
        <el-col :span="18" :offset="3">
            <FormMaker v-model="formData" v-bind:form-fields="info.formFields" type="edit" ref="formMakerRef" />
        </el-col>
        <el-col>
            <div style="text-align: center;">
                <el-button type="primary" @click="submit">提交</el-button>
            </div>
        </el-col>
    </el-row>
</template>

<script setup lang='ts'>
import { http, toPath } from '@/utils'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FormMaker from '@/components/dynamicForm/FormMaker.vue'


const route = useRoute()

const info = ref({
    id: -1,
    name: '',
    description: '',
    version: '',
    status: '',
    deleted: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    formFields: []
})
const formData = ref({})

const queryFields = () => {
    http.result({
        url: '/dynamicForm/info',
        method: 'POST',
        data: {
            id: route.params.id,
            version: route.params.version
        },
        success(result) {
            info.value = result.data
            if (!info.value.formFields || info.value.formFields.length == 0) {
                toPath('/404')
            }
        }
    })
}
const formMakerRef = ref(null)
const submit = async () => {
    const verifyFlag = await formMakerRef.value.verify();
    if (!verifyFlag) {
        return
    }

    const fieldListIn = Object.entries(formData.value).map(([formFieldId, val]) => ({
        formFieldId,
        val
    }));

    http.result({
        url: "/dynamicForm/submit",
        method: "POST",
        data: {
            formId: info.value.id,
            version: route.params.version,
            formInstanceId: null,
            data: formData.value
        },
        success(result) {
            if (result.code == 200) {
            }
        }
    })




}

onMounted(() => {
    queryFields()
})

</script>

<style scope></style>