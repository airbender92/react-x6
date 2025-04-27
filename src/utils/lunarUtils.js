// lunarUtils.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        var o = factory();
        for (var i in o) {
            root[i] = o[i];
        }
    }
})(this, function () {
    var SolarUtil = {
        isLeapYear: function (year) {
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        },
        getDaysOfMonth: function (year, month) {
            var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (month === 2 && this.isLeapYear(year)) {
                days[1] = 29;
            }
            return days[month - 1];
        },
        getDaysBetween: function (startYear, startMonth, startDay, endYear, endMonth, endDay) {
            var startJulianDay = this._getJulianDay(startYear, startMonth, startDay);
            var endJulianDay = this._getJulianDay(endYear, endMonth, endDay);
            return endJulianDay - startJulianDay;
        },
        _getJulianDay: function (year, month, day) {
            if (month <= 2) {
                month += 12;
                year--;
            }
            var a = Math.floor(year / 100);
            var b = 2 - a + Math.floor(a / 4);
            return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
        }
    };

    var LunarUtil = {
        JIE_QI_IN_USE: [
            '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
            '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
            '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
            '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
        ],
        GAN: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
        ZHI: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
        getJiaZiIndex: function (jiaZi) {
            var gan = jiaZi.substring(0, 1);
            var zhi = jiaZi.substring(1);
            var ganIndex = this.GAN.indexOf(gan);
            var zhiIndex = this.ZHI.indexOf(zhi);
            return (ganIndex - zhiIndex + 12) % 10 + zhiIndex * 10;
        },
        index: function (value, array, defaultValue) {
            var index = array.indexOf(value);
            return index === -1 ? defaultValue : index;
        }
    };

    var I18n = {
        getMessage: function (key) {
            return key;
        }
    };

    var Solar = (function () {
        var _fromYmdHms = function (y, m, d, hour, minute, second) {
            y *= 1;
            m *= 1;
            d *= 1;
            hour *= 1;
            minute *= 1;
            second *= 1;

            if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
                throw new Error('Invalid date or time');
            }

            if (1582 === y && 10 === m) {
                if (d > 4 && d < 15) {
                    throw new Error('Invalid date in October 1582');
                }
            }

            if (m < 1 || m > 12 || d < 1 || d > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
                throw new Error('Invalid date or time');
            }

            return {
                _p: {
                    year: y,
                    month: m,
                    day: d,
                    hour: hour,
                    minute: minute,
                    second: second
                },
                getYear: function () {
                    return this._p.year;
                },
                getMonth: function () {
                    return this._p.month;
                },
                getDay: function () {
                    return this._p.day;
                },
                getHour: function () {
                    return this._p.hour;
                },
                getMinute: function () {
                    return this._p.minute;
                },
                getSecond: function () {
                    return this._p.second;
                },
                getWeek: function () {
                    return (Math.floor(this.getJulianDay() + 0.5) + 7000001) % 7;
                },
                getJulianDay: function () {
                    var y = this._p.year;
                    var m = this._p.month;
                    var d = this._p.day + ((this._p.second / 60 + this._p.minute) / 60 + this._p.hour) / 24;
                    var n = 0;
                    var g = false;
                    if (y * 372 + m * 31 + Math.floor(d) >= 588829) {
                        g = true;
                    }
                    if (m <= 2) {
                        m += 12;
                        y--;
                    }
                    if (g) {
                        n = Math.floor(y / 100);
                        n = 2 - n + Math.floor(n / 4);
                    }
                    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + n - 1524.5;
                },
                toYmd: function () {
                    var m = this._p.month;
                    var d = this._p.day;
                    var y = this._p.year + '';
                    while (y.length < 4) {
                        y = '0' + y;
                    }
                    return [y, (m < 10 ? '0' : '') + m, (d < 10 ? '0' : '') + d].join('-');
                },
                toYmdHms: function () {
                    return this.toYmd() + ' ' + [(this._p.hour < 10 ? '0' : '') + this._p.hour, (this._p.minute < 10 ? '0' : '') + this._p.minute, (this._p.second < 10 ? '0' : '') + this._p.second].join(':');
                },
                toString: function () {
                    return this.toYmd();
                },
                nextDay: function (days) {
                    var y = this._p.year;
                    var m = this._p.month;
                    var d = this._p.day;
                    if (1582 === y && 10 === m) {
                        if (d > 4) {
                            d -= 10;
                        }
                    }
                    if (days > 0) {
                        d += days;
                        var daysInMonth = SolarUtil.getDaysOfMonth(y, m);
                        while (d > daysInMonth) {
                            d -= daysInMonth;
                            m++;
                            if (m > 12) {
                                m = 1;
                                y++;
                            }
                            daysInMonth = SolarUtil.getDaysOfMonth(y, m);
                        }
                    } else if (days < 0) {
                        while (d + days <= 0) {
                            m--;
                            if (m < 1) {
                                m = 12;
                                y--;
                            }
                            d += SolarUtil.getDaysOfMonth(y, m);
                        }
                        d += days;
                    }
                    if (1582 === y && 10 === m) {
                        if (d > 4) {
                            d += 10;
                        }
                    }
                    return _fromYmdHms(y, m, d, this._p.hour, this._p.minute, this._p.second);
                },
                getLunar: function () {
                    return Lunar.fromSolar(this);
                }
            };
        };

        return {
            fromYmd: function (y, m, d) {
                return _fromYmdHms(y, m, d, 0, 0, 0);
            },
            fromYmdHms: function (y, m, d, hour, minute, second) {
                return _fromYmdHms(y, m, d, hour, minute, second);
            }
        };
    })();

    var Lunar = (function () {
        var _computeJieQi = function (o, ly) {
            o['jieQiList'] = [];
            o['jieQi'] = {};
            var julianDays = ly.getJieQiJulianDays();
            for (var i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i++) {
                var key = LunarUtil.JIE_QI_IN_USE[i];
                o['jieQiList'].push(key);
                o['jieQi'][key] = Solar.fromJulianDay(julianDays[i]);
            }
        };

        var _computeYear = function (o, solar, year) {
            var offset = year - 4;
            var yearGanIndex = offset % 10;
            var yearZhiIndex = offset % 12;

            if (yearGanIndex < 0) {
                yearGanIndex += 10;
            }

            if (yearZhiIndex < 0) {
                yearZhiIndex += 12;
            }

            var g = yearGanIndex;
            var z = yearZhiIndex;
            var gExact = yearGanIndex;
            var zExact = yearZhiIndex;

            var solarYear = solar.getYear();
            var solarYmd = solar.toYmd();
            var solarYmdHms = solar.toYmdHms();

            var liChun = o['jieQi'][I18n.getMessage('jq.liChun')];
            if (liChun.getYear() !== solarYear) {
                liChun = o['jieQi']['LI_CHUN'];
            }
            var liChunYmd = liChun.toYmd();
            var liChunYmdHms = liChun.toYmdHms();

            if (year === solarYear) {
                if (solarYmd < liChunYmd) {
                    g--;
                    z--;
                }
                if (solarYmdHms < liChunYmdHms) {
                    gExact--;
                    zExact--;
                }
            } else if (year < solarYear) {
                if (solarYmd >= liChunYmd) {
                    g++;
                    z++;
                }
                if (solarYmdHms >= liChunYmdHms) {
                    gExact++;
                    zExact++;
                }
            }

            o['yearGanIndex'] = yearGanIndex;
            o['yearZhiIndex'] = yearZhiIndex;
            o['yearGanIndexByLiChun'] = (g < 0 ? g + 10 : g) % 10;
            o['yearZhiIndexByLiChun'] = (z < 0 ? z + 12 : z) % 12;
            o['yearGanIndexExact'] = (gExact < 0 ? gExact + 10 : gExact) % 10;
            o['yearZhiIndexExact'] = (zExact < 0 ? zExact + 12 : zExact) % 12;
        };

        var _fromSolar = function (solar) {
            var o = {};
            var year = solar.getYear();
            var ly = {
                getJieQiJulianDays: function () {
                    // 这里需要根据实际的节气计算逻辑实现，示例中简单返回空数组
                    return [];
                }
            };
            _computeJieQi(o, ly);
            _computeYear(o, solar, year);

            return {
                getYearInGanZhi: function () {
                    return LunarUtil.GAN[o['yearGanIndex']] + LunarUtil.ZHI[o['yearZhiIndex']];
                },
                getYearInGanZhiByLiChun: function () {
                    return LunarUtil.GAN[o['yearGanIndexByLiChun']] + LunarUtil.ZHI[o['yearZhiIndexByLiChun']];
                },
                getYearInGanZhiExact: function () {
                    return LunarUtil.GAN[o['yearGanIndexExact']] + LunarUtil.ZHI[o['yearZhiIndexExact']];
                },
                getJieQiList: function () {
                    return o['jieQiList'];
                },
                getJieQiTable: function () {
                    return o['jieQi'];
                },
                getJieQi: function () {
                    var solarYmd = solar.toYmd();
                    for (var i = 0, j = o['jieQiList'].length; i < j; i++) {
                        var key = o['jieQiList'][i];
                        var jieQiYmd = o['jieQi'][key].toYmd();
                        if (jieQiYmd === solarYmd) {
                            return key;
                        }
                    }
                    return null;
                }
            };
        };

        return {
            fromSolar: function (solar) {
                return _fromSolar(solar);
            }
        };
    })();

    return {
        Solar: Solar,
        Lunar: Lunar,
        SolarUtil: SolarUtil,
        LunarUtil: LunarUtil,
        I18n: I18n
    };
});