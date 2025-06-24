import axios from 'axios';
import {message, notification} from 'antd'
import _ from 'lodash'
import qs from 'qs'
import moment from 'moment'
import {
    BACKUP_TOKEN_SESSION,
    NEW_BACKUP_TOKEN_SESSION,
    TOKEN_SESSION,
    NEW_TOKEN_SESSION
} from '@/common/constant'
import storageUtil from '@/utils/storageUtil'
import {fileTypeMap} from '@/utils/fileUtil'

import {
errorHandler,
jumpRequestMiddleware,
jumpResponseMiddleware,
validateStatus,
expireTokenRedirectPath,
} from './utils'

const initOptions = {
    headers: {
        Accpet: "application/json;charset=utf-8",
        "Accept-Language": "zh-CN,zh",
        "Content-Type": "application/json;charset=utf-8"
    },
    params: {
        timeout: 60000,
        responseData: 'json',
        maxContentLength: 2000,
    }
};
const baseURL = "/"
const instance = axios.create({
    timeout: 3000,
    baseURL,
    headers: {
        ...initOptions.headers,
    },
    ...initOptions.params,
});

export function jumpRequest(url, options={}, dealErr=false) {
    const jumpInstance = axios.create({
        timeout: 3000,
        responseType: options?.responseType,
        baseURL,
        headers: {
            ...initOptions.headers,
        },
        ...initOptions.params,
        validateStatus: (status) => validateStatus(status)
    });

    jumpInstance.interceptors.request.use(
        config => jumpRequestMiddleware(config),
        error => errorHandler(error),
    );
    if(!options?.responseType || options?.responseType !== 'blob') {
        jumpInstance.interceptors.response.use(
            (response) => jumpResponseMiddleware(response),
            error => errorHandler(error)
        )
    }
    if(typeof url !== 'string') {
        throw new Error('Url must be a string')
    }

    return new Promise((resolve, reject) => {
        const param = options.data;
        jumpInstance({
            url,
            method: (options.method || 'get').toLowerCase(),
            data: param,
        })
        .then(response => {
            const {data, status, statusText, request} = response;
            if(status === 200 || statusText === 'OK') {
                if(request?.responseType === 'blob') {
                    resolve({data, response})
                } else {
                    const {code, msg} = data;
                    if(code && code !== '200') {
                        message.error(msg);
                    }
                    resolve(data);
                }
            } else if(dealErr) {
                reject(response)
            }
        }).catch(error => console.error(error))
    })
}

// 通过文件流下载文件
export async function downloadFile(
    {path, method="GET", params, options, fileName='file', extension='xlsx'},
    callback
) {
    if(!path) return;
    const hide = message.loading('请求中...')
    const requestBody = _.toUpper(method) === 'GET' ? {params} : {data: params};
    jumpRequest(path, {
        method,
        responseType: 'blob',
        ...requestBody,
        ...(options || {})
    }).then(({data: res, response}) => {
        callback?.();
        hide();

        if(res?.type === 'application/json') {
            message.error('导出失败')
            return;
        }
        let resFileName = '';
        try{
            const onFileName = response.headers["content-disposition"]
            const parts = onFileName.split('filename=');
            resFileName = decodeURI(parts[1])
        }catch(error) {
            resFileName = fileName + moment().format("YYYY-MM-DD HH:mm:ss") + '.' + extension
        }

        const blob = new Blob([res], {
            type: `${fileTypeMap[extension]};charset=UTF-8`,
        });
        const objectURL = URL.createObjectURL(blob);
        const btn = document.createElement('a');
        const body = document.querySelector('body');
        if(body) {
            body.appendChild(btn);
        }
        btn.download = `${resFileName}`
        btn.href=objectURL;
        btn.click();
        if(body) {
            body.removeChild(btn)
        }
    })
}