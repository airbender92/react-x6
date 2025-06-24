import { message, notification } from "antd";
import moment from "moment";
import _ from 'lodash'
import qs from 'qs';
import authUtil from '@/utils/authUtil';
import storageUtil from '@/utils/storageUtil'

import {
    REFERER_URL,
    TOKEN_SESSION,
    NEW_TOKEN_SESSION
} from '@/common/constant'

export function errorHandler (error) {
    if(error && error.response) {
        const {status, statusText} = error?.response || {};
        notification.error({
            message: `${status}--${statusText}`
        })
    }else if(error.request) {
        notification.error({message: 'Request Error'})

    } else {
        notification.error({message: error.message})
    }
    const {data, status, statusText} =error.response;
    return {data, status, statusText}
}

export function jumpRequestMiddleware(config) {
    const {data, header} = config;
    const reqHead = {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    };
    const token = authUtil.getToken();
    const newToken = authUtil.getNewToken();
    const reqData = {
        REQ_HEAD: {
            TRAN_PROCESS: '',
            TRAN_ID: '',
            [TOKEN_SESSION]: token,
            [NEW_TOKEN_SESSION]: newToken
        },
        REQ_BODY: {
            ...data,
        }
    }
    let params;
    if(data instanceof FormData) {
        params =data;
    } else {
        params = qs.stringify({ REQ_MESSAGE: JSON.stringify(reqData)})
    }
    return {
        ...config,
        headers: reqHead,
        data: params
    }
}

/**
 * 获取token失效后重定向
 */
export const expireTokenRedirectPath = (isDev) => {
    let path = `${window.origin}/#/user/login`;
    const url = storageUtil.getLocalItem(REFERER_URL);
    const uopsHomePath = JSON.parse(url)?.uopsHomePath;
    if(!isDev && uopsHomePath) {
        path = uopsHomePath;
    }
    return path;
}

const debounceMsg = _.debounce(
    (code, msg) => {
        message.error(`${code}--${msg}`)
    },
    1000,
    {leading: true, trailing: false}
)

export function jumpResponseMiddleware(response) {
    const {data, status, statusText} = response
    const { RSP_HEAD, RSP_BODY} = data;
    const {TRAN_SUCCESS, ERROR_CODE, ERROR_MESSAGE} = RSP_HEAD || {}
    if(TRAN_SUCCESS === '1') {
        return {
            data: RSP_BODY,
            status,
            statusText
        }
    } 
    if(ERROR_CODE === '401'){
        debounceMsg(ERROR_CODE, ERROR_MESSAGE)
        const path = expireTokenRedirectPath(__DEV__)
        window.location.href=path;
    } else {
        message.error(`${ERROR_CODE}--${ERROR_MESSAGE}`)
    }
    return {data: RSP_BODY, ERROR_CODE, ERROR_MESSAGE}
}