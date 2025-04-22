const moment = require('moment');

// 定义所有节气的键
const SOLAR_TERMS_C_NUMS = {
    the_beginning_of_spring: [4.6295, 3.87],
    rain_water: [19.4599, 18.73],
    the_waking_of_insects: [6.3926, 5.63],
    the_spring_equinox: [21.4155, 20.646],
    pure_brightness: [5.59, 4.81],
    grain_rain: [20.888, 20.1],
    the_beginning_of_summer: [6.318, 5.52],
    lesser_fullness_of_grain: [21.86, 21.04],
    grain_in_beard: [6.5, 5.678],
    the_summer_solstice: [22.2, 21.37],
    lesser_heat: [7.928, 7.108],
    greater_heat: [23.65, 22.83],
    the_beginning_of_autumn: [28.35, 7.5],
    the_end_of_heat: [23.95, 23.13],
    white_dew: [8.44, 7.646],
    the_autumn_equinox: [23.822, 23.042],
    code_dew: [9.098, 8.318],
    frost_descent: [24.218, 23.438],
    the_beginning_of_winter: [8.218, 7.438],
    lesser_snow: [23.08, 22.36],
    greater_snow: [7.9, 7.18],
    the_winter_solstice: [22.6, 21.94],
    lesser_cold: [6.11, 5.4055],
    greater_cold: [20.84, 20.12],
};

// 月份和节气对应关系
const SOLAR_TERMS_MONTH = {
    1: ["lesser_cold", "greater_cold"],
    2: ["the_beginning_of_spring", "rain_water"],
    3: ["the_waking_of_insects", "the_spring_equinox"],
    4: ["pure_brightness", "grain_rain"],
    5: ["the_beginning_of_summer", "lesser_fullness_of_grain"],
    6: ["grain_in_beard", "the_summer_solstice"],
    7: ["lesser_heat", "greater_heat"],
    8: ["the_beginning_of_autumn", "the_end_of_heat"],
    9: ["white_dew", "the_autumn_equinox"],
    10: ["code_dew", "frost_descent"],
    11: ["the_beginning_of_winter", "lesser_snow"],
    12: ["greater_snow", "the_winter_solstice"],
};

// 节气日期修正值
const SOLAR_TERMS_DELTA = {
    "2026_rain_water": -1,
    "2084_the_spring_equinox": 1,
    "1911_the_beginning_of_summer": 1,
    "2008_lesser_fullness_of_grain": 1,
    "1902_grain_in_beard": 1,
    "1928_the_summer_solstice": 1,
    "1925_lesser_heat": 1,
    "2016_lesser_heat": 1,
    "1922_greater_heat": 1,
    "2002_the_beginning_of_autumn": 1,
    "1927_white_dew": 1,
    "1942_the_autumn_equinox": 1,
    "2089_frost_descent": 1,
    "2089_the_beginning_of_winter": 1,
    "1978_lesser_snow": 1,
    "1954_greater_snow": 1,
    "1918_the_winter_solstice": -1,
    "2021_the_winter_solstice": -1,
    "1982_lesser_cold": 1,
    "2019_lesser_cold": -1,
    "2000_greater_cold": 1,
    "2082_greater_cold": 1,
};

// 节气名称
const SOLAR_TERMS = {
    lesser_cold: "小寒",
    greater_cold: "大寒",
    the_beginning_of_spring: "立春",
    rain_water: "雨水",
    the_waking_of_insects: "惊蛰",
    the_spring_equinox: "春分",
    pure_brightness: "清明",
    grain_rain: "谷雨",
    the_beginning_of_summer: "立夏",
    lesser_fullness_of_grain: "小满",
    grain_in_beard: "芒种",
    the_summer_solstice: "夏至",
    lesser_heat: "小暑",
    greater_heat: "大暑",
    the_beginning_of_autumn: "立秋",
    the_end_of_heat: "处暑",
    white_dew: "白露",
    the_autumn_equinox: "秋分",
    code_dew: "寒露",
    frost_descent: "霜降",
    the_beginning_of_winter: "立冬",
    lesser_snow: "小雪",
    greater_snow: "大雪",
    the_winter_solstice: "冬至",
};

// 包装日期到一天的开始
export function wrapDate(date) {
    return moment(date).startOf("day");
}

// 获取节气日期
export function getSolarTermDate(year, month, term) {
    const century = year >= 2000 ? 21 : 20;
    const Y = year % 100;
    const D = 0.2422;
    const C = SOLAR_TERMS_C_NUMS[term][century === 21 ? 1 : 0];
    let L = Math.floor(Y / 4);

    if (["lesser_cold", "greater_cold", "the_beginning_of_spring", "rain_water"].includes(term)) {
        L = Math.floor((Y - 1) / 4);
    }

    let day = Math.floor(Y * D + C) - L;
    const delta = SOLAR_TERMS_DELTA[`${year}_${term}`];
    if (delta) {
        day += delta;
    }

    return moment(`${year}-${month}-${day}`).format('YYYY-MM-DD');
}

// 获取范围日期内的节气
export function getSolarTermsInRange(start, end) {
    // 从开始日减一个月 - 结束日下一个月 计算所有节气
    let current = wrapDate(start).subtract(1, 'month');
    const endDate = wrapDate(end || start).add(1, 'month');
    const allTerms = [];
    while (current.isBefore(endDate) || current.isSame(endDate)) {
        const year = current.year();
        const month = current.month() + 1;
        SOLAR_TERMS_MONTH[month].forEach((term) => {
            const solarTermDate = moment(getSolarTermDate(year, month, term));
            allTerms.push({ term, date: solarTermDate });
        });
        if (current.month() === 11) {
            current = current.add(1, 'year').startOf('year');
        } else {
            current = current.add(1, 'month').startOf('month');
        }
    }

    // 计算中间的所有日期
    const deltaDays = [];
    allTerms.forEach((term, index) => {
        for (let date = term.date; allTerms[index + 1] && date.isBefore(allTerms[index + 1].date); date = date.add(1, 'day')) {
            deltaDays.push({ day: date, term: term.term, name: SOLAR_TERMS[term.term], index: date.diff(term.date, 'day') + 1 });
        }
    });

    if (!end) end = start;
    return deltaDays.filter(trem => trem.day.isBetween(start, end, 'day')).map(trem => ({
        date: trem.day.format('YYYY-MM-DD'),
        term: trem.term,
        name: trem.name,
        index: trem.index
    }));
}

// 示例使用
const startDate = '2024-01-01';
const endDate = '2024-02-29';
const solarTerms = getSolarTermsInRange(startDate, endDate);
console.log(solarTerms);