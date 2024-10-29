<template>
    <div style="height: 100vh;" class="div-child-x-center div-child-y-center">
        <el-card style="width: 35%;">
            <template #header>
                <div class="div-child-x-center">
                    <span>Joker Box</span>
                </div>
            </template>
            <el-form :model="ruleForm" :rules="rules" ref="ruleFormRef" status-icon label-position="right"
                label-width="auto">
                <el-form-item label='用户名' prop="username">
                    <el-input v-model="ruleForm.username" size="large" placeholder="用户名" autocomplete="new-password" />
                </el-form-item>
                <el-form-item label='昵称' prop="nickname">
                    <el-input v-model="ruleForm.nickname" size="large" placeholder="昵称" autocomplete="new-password" />
                </el-form-item>
                <el-form-item label='密码' prop="password">
                    <el-input v-model="ruleForm.password" type="password" size="large" placeholder="密码"
                        autocomplete="new-password" />
                </el-form-item>
                <el-form-item label='再次确认' prop="passwordAgain">
                    <el-input v-model="ruleForm.passwordAgain" type="password" size="large" placeholder="密码"
                        autocomplete="new-password" />
                </el-form-item>
                <el-form-item label='邮箱' prop="mail">
                    <el-input v-model="ruleForm.mail" size="large" type="email" placeholder="邮箱"
                        autocomplete="new-password" />
                </el-form-item>
                <el-form-item label='验证码' prop="code">
                    <el-input v-model="ruleForm.code" size="large" placeholder="验证码" autocomplete="new-password">
                        <template #append>
                            <el-button @click="snedCode">{{ sendButtinText }}</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- <el-form-item label='邀请码' prop="inviteCode">
                    <el-input v-model="ruleForm.inviteCode" size="large" placeholder="邀请码"
                        autocomplete="new-password" />
                </el-form-item>
                <el-form-item label='性别' prop="sex">
                    <el-select v-model="ruleForm.sex" value-key="" placeholder="选择性别" clearable filterable>
                        <el-option key="未知" value="未知" label="未知"></el-option>
                        <el-option key="男" value="男" label="男"></el-option>
                        <el-option key="女" value="女" label="女"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label='手机号' prop="phone">
                    <el-input v-model="ruleForm.phone" size="large" placeholder="手机号" autocomplete="new-password" />
                </el-form-item> -->
            </el-form>
            <template #footer>
                <div class="div-child-x-center">
                    <el-button type="primary" size="large" @click="register(ruleFormRef)" plain
                        style="width: 60%;">注册</el-button>
                </div>
                <!-- <a href="/login" style="margin-top: 1rem;">已有账号</a> -->
            </template>
        </el-card>

    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, userInfo, alert } from '@/utils';
import { onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const path = ref('/')

interface RuleForm {
    "username": String,
    "password": String,
    "passwordAgain": String,
    "nickname": String,
    "mail": String,
    "code": String,
    "inviteCode": String,
    "sex": String,
    "phone": Number
}

const ruleForm = reactive<RuleForm>({
    "username": "",
    "password": "",
    "passwordAgain": "",
    "nickname": "用户9527",
    "mail": "",
    "code": "",
    "inviteCode": "",
    "sex": "未知",
    "phone": 0
})

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请设置密码'))
    } else {
        if (ruleForm.password !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('password')
        }
        callback()
    }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== ruleForm.password) {
        callback(new Error("两次密码不一致"))
    } else {
        callback()
    }
}

const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    username: [
        { required: true, message: '请填写用户名', trigger: 'change' },
        { min: 4, max: 18, message: '长度大于4小于15', trigger: 'change' },
    ],
    nickname: [
        { required: true, message: '请填写昵称', trigger: 'change' },
    ],
    password: [{ required: true, message: '密码不能为空', trigger: 'change' }, { validator: validatePass, trigger: 'blur' }],
    passwordAgain: [{ required: true, message: '密码不能为空', trigger: 'change' }, { validator: validatePass2, trigger: 'blur' }],
    mail: [{ required: true, message: '请填写邮箱地址', trigger: 'change' },],
    code: [{ required: true, message: '邮箱验证码', trigger: 'change' },],
})



const loginInfo = ref({
    username: '',
    password: ''
})

const sendButtinText = ref('发送')

onMounted(() => {
    path.value = route.query.redirect != undefined ? route.query.redirect.toString() : path.value
})

const snedCode = () => {
    if (ruleForm.mail === '') {
        alert('请填写邮箱', 'warning')
        return;
    }
    sendButtinText.value = '60'
    http.result({
        url: "/auth/mailCode",
        method: 'POST',
        params: {
            mail: ruleForm.mail
        },
        success(result) {
            if (result.code == 200) {
                alert('发送成功', 'success')
            }
        }
    })
    let sendConds = 60
    const timerId = setInterval(() => {
        sendConds--
        if (sendConds == 0) {
            sendButtinText.value = '发送'
            clearInterval(timerId)
        } else {
            sendButtinText.value = '' + sendConds
        }
    }, 1000);


}

const register = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            http.result({
                url: "/auth/register",
                method: 'POST',
                data: ruleForm,
                success(result) {
                    setToken(result.data)
                    login()
                },
                error(error) {
                    alert(error.msg, 'error')
                }
            })
        } else {
            alert('请按要求填写', 'warning')
        }
    })
}

const login = () => {
    http.result({
        url: "/auth/getToken",
        method: 'POST',
        data: loginInfo.value,
        success(result) {
            setToken(result.data)
            getUserInfo()
        },
        error(error) {
        }
    })
}

async function getUserInfo() {
    http.result({
        url: '/auth/userInfo',
        method: 'POST',
        success(result) {
            saveUserInfo(result.data)
            toPath(path.value)
        }
    })
}




</script>

<style>
.div-child-x-center {
    display: flex;
    justify-content: center;
}

.div-child-y-center {
    display: flex;
    align-items: center;
    /* 垂直居中 */
}

.el-input {
    /* height: 3rem; */
}
</style>