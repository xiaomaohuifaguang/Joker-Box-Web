import type { AxiosProgressEvent } from 'axios'

/** 后端统一响应结构 */
export interface BizResp<T = any> {
    code: number
    msg: string
    data: T
}

/** 请求级配置项 */
export interface RequestOptions {
    /** url 查询参数 */
    params?: Record<string, any>
    /** 请求头 */
    headers?: Record<string, string>
    /** 超时时间(ms)，默认 30000 */
    timeout?: number
    /** 取消信号 */
    signal?: AbortSignal
    /** 静默模式：不弹全局 toast，默认 false */
    silent?: boolean
    /** 上传进度回调 */
    onUploadProgress?: (e: AxiosProgressEvent) => void
    /** 下载进度回调 */
    onDownloadProgress?: (e: AxiosProgressEvent) => void
    /** 错误回调（不想 try/catch 时使用） */
    onError?: (err: ApiError) => void
    /** 返回完整 {code,msg,data}，默认 false（解包 data） */
    raw?: boolean
}

/** 业务/网络异常 */
export class ApiError extends Error {
    /** 业务码或 HTTP 状态码 */
    code: number
    /** 后端 msg */
    msg: string
    /** HTTP 状态码 */
    status?: number
    /** 后端原始 data */
    data?: any

    constructor(msg: string, code: number, status?: number, data?: any) {
        super(msg)
        this.name = 'ApiError'
        this.msg = msg
        this.code = code
        this.status = status
        this.data = data
    }
}
