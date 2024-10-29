<template>
    <el-card body-style="text-align: center;">
        <template #header>
            修改密码
        </template>
        <el-row>
            <el-col :span="8">
                <el-form label-position="left" label-width="auto" ref="ruleFormRef" :model="passwordInfo">
                    <el-form-item label="原密码" prop="oldPassword" :rules="[
                        { required: true, message: '请输入原密码', trigger: ['blur'] },
                        { min: 8, max: 16, message: '长度8-16位', trigger: 'blur' }
                    ]">
                        <el-input v-model="passwordInfo.oldPassword" autocomplete="off" type="password" />
                    </el-form-item>
                    <el-form-item label=" 新密码" prop="newPassword" :rules="[
                        { required: true, message: '请输入新密码', trigger: ['blur'] },
                        { min: 8, max: 16, message: '长度8-16位', trigger: 'blur' }
                    ]">
                        <el-input v-model="passwordInfo.newPassword" autocomplete="off" type="password" />
                    </el-form-item>
                    <el-form-item label="再次确认" prop="newPasswordAgain" :rules="[
                        { required: true, message: '请再次确认密码', trigger: ['blur'] },
                        { min: 8, max: 16, message: '长度8-16位', trigger: 'blur' }
                    ]">
                        <el-input v-model="passwordInfo.newPasswordAgain" autocomplete="off" type="password" />
                    </el-form-item>
                </el-form>
                <el-button type="primary" plain @click="submitForm(ruleFormRef)">确认修改</el-button>
            </el-col>
        </el-row>
    </el-card>
</template>

<script setup lang='ts'>
import { alert, confirm, http, toPath } from '@/utils';
import { FormInstance } from 'element-plus';
import { trigger } from 'video.js/dist/types/utils/events';
import { ref } from 'vue';

const ruleFormRef = ref<FormInstance>()

const passwordInfo = ref({
    oldPassword: '',
    newPassword: '',
    newPasswordAgain: ''
})

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if (valid) {
            http.result({
                url: '/auth/changePassword',
                method: 'POST',
                params: {
                    oldPassword: passwordInfo.value.oldPassword,
                    newPassword: passwordInfo.value.newPassword
                },
                success(result) {
                    if (result.code == '200') {
                        confirm("", "密码修改成功", () => {
                            toPath('/')
                        }, () => {
                            toPath('/')
                        })
                    }
                }
            })

        } else {
            alert('请正确填写信息', 'error');
        }
    })
}

</script>

<style></style>