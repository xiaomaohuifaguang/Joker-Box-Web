import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import CONSTANTS from '@/utils/constants'
import { logout, toPath } from '@/utils'
import { ApiError, type BizResp, type RequestOptions } from './entity'

const DEFAULT_TIMEOUT = 30 * 1000

const showError = (msg: string) => {
    ElMessage({
        message: msg,
        type: 'error',
        // customClass: 'custom-message'
    })
}

class Http {
    public instance: AxiosInstance

    constructor() {
        this.instance = axios.create({
            baseURL: CONSTANTS.HTTP.BASEURL,
            timeout: DEFAULT_TIMEOUT
        })

        this.instance.interceptors.request.use(
            config => {
                const token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
                if (token) {
                    config.headers.setAuthorization(`${CONSTANTS.SYSTEM.TOKEN_TYPE} ${token}`)
                }
                return config
            },
            error => Promise.reject(error)
        )

        this.instance.interceptors.response.use(
            response => response,
            error => Promise.reject(error)
        )
    }

    private async core<T>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        const silent = options?.silent ?? false
        const onError = options?.onError
        const raw = options?.raw ?? false

        try {
            const response = await this.instance.request({
                ...config,
                timeout: options?.timeout ?? config.timeout ?? DEFAULT_TIMEOUT,
                signal: options?.signal,
                onUploadProgress: options?.onUploadProgress,
                onDownloadProgress: options?.onDownloadProgress
            })

            const body = response.data as BizResp<T>

            if (body && typeof body === 'object' && 'code' in body && body.code !== 200) {
                const err = new ApiError(body.msg ?? '业务异常', body.code, response.status, body.data)
                if (!silent) showError(err.msg)
                onError?.(err)
                throw err
            }

            if (raw) return body as unknown as T
            return (body?.data ?? body) as T
        } catch (e: any) {
            if (e instanceof ApiError) throw e

            if (axios.isCancel?.(e) || e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') {
                const err = new ApiError('请求已取消', -1)
                onError?.(err)
                throw err
            }

            const status: number | undefined = e?.response?.status
            const respData: any = e?.response?.data

            if (status === 401) {
                logout()
                toPath('/')
                const err = new ApiError(respData?.msg ?? '登录已过期', respData?.code ?? 401, status, respData)
                onError?.(err)
                throw err
            }

            const isNetwork = !e?.response
            const msg = isNetwork
                ? '网络异常，请稍后重试'
                : (respData?.msg ?? `请求失败 (${status})`)
            const err = new ApiError(msg, respData?.code ?? status ?? -1, status, respData)
            if (!silent) showError(err.msg)
            onError?.(err)
            throw err
        }
    }

    get<T = any>(url: string, options?: RequestOptions): Promise<T> {
        return this.core<T>(
            { url, method: 'GET', params: options?.params, headers: options?.headers },
            options
        )
    }

    post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.core<T>(
            { url, method: 'POST', data, params: options?.params, headers: options?.headers },
            options
        )
    }

    put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.core<T>(
            { url, method: 'PUT', data, params: options?.params, headers: options?.headers },
            options
        )
    }

    del<T = any>(url: string, options?: RequestOptions & { data?: any }): Promise<T> {
        return this.core<T>(
            {
                url,
                method: 'DELETE',
                data: options?.data,
                params: options?.params,
                headers: options?.headers
            },
            options
        )
    }

    patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.core<T>(
            { url, method: 'PATCH', data, params: options?.params, headers: options?.headers },
            options
        )
    }

    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.core<T>(config, options)
    }
}

export default new Http()
export { ApiError } from './entity'
export type { RequestOptions, BizResp } from './entity'
