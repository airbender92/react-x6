class CookieUtil {
  // 设置Cookie（支持自定义过期时间、路径、域名等）
  setCookie(name, value, days = 1, path = '/', domain = '', secure = false) {
    const exp = new Date();
    exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
    const encodedValue = encodeURIComponent(value);
    let cookie = `${name}=${encodedValue}; expires=${exp.toUTCString()}; path=${path}`;
    if (domain) cookie += `; domain=${domain}`;
    if (secure) cookie += `; secure`;
    document.cookie = cookie;
  }

  // 获取Cookie
  getCookie(name) {
    const encodedName = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(encodedName) === 0) {
        return decodeURIComponent(cookie.substring(encodedName.length));
      }
    }
    return '';
  }

  // 删除Cookie
  deleteCookie(name, path = '/', domain = '') {
    this.setCookie(name, '', -1, path, domain);
  }
}

export default new CookieUtil();