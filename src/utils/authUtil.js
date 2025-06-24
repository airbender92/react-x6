import {
    USER_INFO_SESSION,
    TOKEN_SESSION,
    NEW_TOKEN_SESSION,
    BACKUP_TOKEN_SESSION,
    NEW_BACKUP_TOKEN_SESSION
} from '@/common/constant'

import arrayUtil from './arrayUtil'
import storageUtil from './storageUtil'
import cookieUtil from './cookieUtil'

class AuthUtil {
    getUserInfo = () => {
        const str = storageUtil.getSessionItem(USER_INFO_SESSION);
        if(str) {
            return JSON.parse(str)
        }
        return null;
    }

    setUserInfo(userInfo){
        storageUtil.setSessionItem(USER_INFO_SESSION, JSON.stringify(userInfo))
    }

    clearUserData(){
        storageUtil.setSessionItem(USER_INFO_SESSION, '')
    }

    checkUserLogin(){
        const userInfo = this.getUserInfo();
        return userInfo !== null;
    }

    checkUserPermission(checkRoles){
        if(arrayUtil.isEmptyArray(checkRoles)) {
            return true;
        }
        const userInfo = this.getUserInfo();
        if(!userInfo) return false;
        const {roles} = userInfo;
        if(arrayUtil.isEmptyArray(roles)) {
            return false;
        }
        for(const checkRole of checkRoles) {
            for(const role of roles) {
                if(checkRole === role) {
                    return true;
                }
            }
        }
        return false;
    }

    clearToken = () => {
        cookieUtil.setCookie(TOKEN_SESSION, '')
    }

    setToken(value){
        cookieUtil.setCookie(TOKEN_SESSION, value)
        this.syncToken();
    }

    setNewToken(value){
        cookieUtil.setCookie(NEW_TOKEN_SESSION, value)
        this.syncNewToken();
    }

    getToken(){
        cookieUtil.getCookie(TOKEN_SESSION)
    }

    getNewToken(){
        cookieUtil.getCookie(NEW_TOKEN_SESSION)
    }

    syncToken(){
        const token = this.getToken();
        storageUtil.setSessionItem(BACKUP_TOKEN_SESSION, token)
    }
    syncNewToken(){
        const token = this.getNewToken();
        storageUtil.setSessionItem(NEW_BACKUP_TOKEN_SESSION, token)
    }
}

export default new AuthUtil();