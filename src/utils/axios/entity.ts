/**
 * 请求参数类
 */
export interface RequestOption {

    server: 'AUTH' | 'FILE';

    // 路径
    url: string;

    // 是否开启相对路径
    base?: boolean;

    // 请求方法
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    // 请求头
    headers?: {};

    // url参数
    params?: {};

    // body/formdata
    data?: {};

    // 成功回调
    success?: (success: any) => void;

    // 失败回调
    error?: (error: any) => void;

    onUploadProgress?: (progressEvent: any) => void;
}