import CONSTANTS_ from './constants'
import http_ from './axios'
import regex from './regex'
import modal from './modal'
import { ElMessage, ElNotification  } from 'element-plus'

export const CONSTANTS = CONSTANTS_

export const http = http_

export const getToken = () => {
    return localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
}

export const setToken = (token: string) => {
    return localStorage.setItem(CONSTANTS.SYSTEM.TOKEN,token)
}

export const logout = () => {
    localStorage.removeItem(CONSTANTS.SYSTEM.TOKEN)
    localStorage.removeItem(CONSTANTS.SYSTEM.USER_INFO)
    window.location.href = CONSTANTS.SYSTEM.LOGIN_PAGE
}

export const saveUserInfo = (data: any) => {
    localStorage.setItem(CONSTANTS.SYSTEM.USER_INFO,JSON.stringify(data))
}

export const userInfo = () => {
    const userInfoStr = localStorage.getItem(CONSTANTS.SYSTEM.USER_INFO);
    return userInfoStr ? JSON.parse(userInfoStr) : null
}
export const alert = (msg:string,type: 'info'|'success'|'warning'|'error') => {
    // const msgDiv = document.getElementById('msg') as HTMLElement
    // ElMessage({
    //     message: msg,
    //     type: type,
    //     duration: 0,
    //     // appendTo: msgDiv
    // })
    ElNotification({
        title: '提示',
        message: msg,
        type: type
    })
}


export const regTest = regex.regTest;

export const message = modal.message



export default { CONSTANTS, http, getToken, logout, saveUserInfo, userInfo, alert, regTest, message}