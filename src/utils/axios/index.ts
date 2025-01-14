// http.ts
import axios from 'axios';
import type { RequestOption } from './entity';
import CONSTANTS from '@/utils/constants'
import { logout, alert, toPath } from '@/utils';
import { ElMessage } from 'element-plus'


class Http {
  public instance;

  constructor() {
    this.instance = axios.create({ baseURL: CONSTANTS.HTTP.BASEURL });

    // 添加请求拦截器
    this.instance.interceptors.request.use(
      config => {
        // 在发送请求之前做些什么
        let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
        if (token && token != null) config.headers.setAuthorization(CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + token)

        return config;
      },
      error => {
        // 对请求错误做些什么
        return Promise.reject(error);
      }
    );

    // 添加响应拦截器
    this.instance.interceptors.response.use(
      response => {
        // 对响应数据做点什么
        return response;
      },
      error => {
        // 对响应错误做点什么
        if (error.response.status != 401) {
          ElMessage({
            message: error.response.data.msg == undefined ? '后台服务器噶啦' : error.response.data.msg,
            type: 'warning',
          })
          if (error.response.data.msg == undefined) {
            logout()
          }
        }
        if (error.response.status == 401) {
          logout()
          toPath('/')
          // window.location.href = CONSTANTS.SYSTEM.LOGIN_PAGE
        }
        return Promise.reject(error);
      }
    );
  }


  result(options: RequestOption): Promise<any> {

    return this.instance({
      url: options.url,
      method: options.method,
      data: options.data,
      params: options.params,
      headers: options.headers,
      timeout: 10 * 60 * 1000,
      onUploadProgress: (progressEvent: any) => {
        // 计算上传进度的百分比
        // const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        // console.log(`上传进度：${percent}%`);
        if (options.onUploadProgress !== undefined) {
          options.onUploadProgress(progressEvent)
        }

      }
    }).then(function (response) {
      if (options.success) {
        if (response.data.code == 200) {
          options.success(response.data);
        }
      }
      if (options.error) {
        if (response.data.code != 200) {
          options.error(response.data);
        }
      } else {
        if (response.data.code != 200) {
          alert(response.data.msg, "error")
        }
      }
    }).catch(function (error) {

    });
  }

  // 可以添加更多快捷方法，如 get, post, put, delete 等
  // get(url: string, params?: any, headers?: any): Promise<any> {
  //   return this.request({
  //     url,
  //     method: 'GET',
  //     params,
  //     headers,
  //   });
  // }

  // 其他快捷方法以此类推...
}

export default new Http();