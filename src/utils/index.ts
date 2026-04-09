import CONSTANTS_ from './constants'
import http_ from './axios'
import regex from './regex'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import router from '@/router'

export const CONSTANTS = CONSTANTS_

export const http = http_

export const getToken = () => {
    return localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
}

export const setToken = (token: string) => {
    return localStorage.setItem(CONSTANTS.SYSTEM.TOKEN, token)
}

export const logout = () => {
    localStorage.removeItem(CONSTANTS.SYSTEM.TOKEN)
    localStorage.removeItem(CONSTANTS.SYSTEM.USER_INFO)
    // window.location.href = CONSTANTS.SYSTEM.LOGIN_PAGE
    // window.location.reload()
}

export const saveUserInfo = (data: any) => {
    localStorage.setItem(CONSTANTS.SYSTEM.USER_INFO, JSON.stringify(data))
}

export const userInfo = () => {
    const userInfoStr = localStorage.getItem(CONSTANTS.SYSTEM.USER_INFO);
    return userInfoStr ? JSON.parse(userInfoStr) : null
}

export const alert = (msg: string, type: 'info' | 'success' | 'warning' | 'error') => {
    // ElNotification({
    //     title: '提示',
    //     message: msg,
    //     type: type
    // })


    ElMessage({
        message: msg,
        type: type,
        // duration: 3000,
        // showClose: true,
        // offset: 80,
        center: false,
        customClass: 'custom-message',
        // grouping: true,
        appendTo: document.body
    })

}
export const confirm = (title: string, content: string, confirm?: () => void, cancel?: () => void) => {
    ElMessageBox.confirm(content, title, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        customClass: 'custom-message-box',
        closeOnClickModal: false,
        closeOnPressEscape: true,
        center: true,
    }).then(() => {
        if (confirm) {
            confirm()
        }
    }).catch(() => {
        if (cancel) {
            cancel()
        }
    })
}

export const regTest = regex.regTest;

export const toPath = (path: string) => {
    router.push({
        path: path
    })
}

export const randomId = (preStr: string) => {
    const hexDigits = '0123456789abcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += hexDigits[Math.floor(Math.random() * 16)];
    }
    return preStr + id;
}




export default { CONSTANTS, http, getToken, logout, saveUserInfo, userInfo, alert, confirm, regTest, toPath, randomId }