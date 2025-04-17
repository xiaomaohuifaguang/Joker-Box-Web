import { ref } from 'vue';
import axios from 'axios';
import { CONSTANTS, getToken } from '..';

export function useFileFetch() {
    const fileUrl = ref<string>('');

    // 请求文件
    const fetchFile = async (src: string) => {
        try {
            const response = await axios.get(src, {
                headers: {
                    'Authorization': `${CONSTANTS.SYSTEM.TOKEN_TYPE} ${getToken()}`, // 自定义 header，如认证token
                },
                responseType: 'blob',
            });

            // 获取 blob 数据并创建 URL
            const blob = response.data;
            const url = URL.createObjectURL(blob);
            fileUrl.value = url;
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    };

    return { fileUrl, fetchFile };
}
