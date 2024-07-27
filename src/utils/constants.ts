/**
 * 系统配置
 */
export const SYSTEM = {
    // 系统名称
    NAME: "Joker-Box",
    // 鉴权token存储名称
    TOKEN: "token",
    TOKEN_HEADER: "Authorization",
    TOKEN_TYPE: "Bearer",
    SERVERS:{
        AUTH: "/auth-server",
        FILE: "/file-server",
        FIELVIEWSERVER: "/kkfileview/onlinePreview",
    },
    LOGIN_PAGE: "/web/login",
    USER_INFO: "USERINFO"
}

/**
 * 请求配置
 */
export const HTTP = {
    // 请求base路径
    BASEURL: ""
}

export default { SYSTEM, HTTP }