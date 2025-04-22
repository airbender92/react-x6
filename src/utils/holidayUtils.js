const moment = require('moment');

// 定义节日信息
const HOLIDAYS = [
    // 新年
    {
        name: '新年',
        getDate: (year) => moment(`${year}-01-01`),
        type: '国际通用'
    },
    // 情人节
    {
        name: '情人节',
        getDate: (year) => moment(`${year}-02-14`),
        type: '国际通用'
    },
    // 愚人节
    {
        name: '愚人节',
        getDate: (year) => moment(`${year}-04-01`),
        type: '国际通用'
    },
    // 母亲节（美国：5月的第二个星期日）
    {
        name: '母亲节',
        getDate: (year) => {
            const mayFirst = moment(`${year}-05-01`);
            const firstSunday = mayFirst.day(7);
            return firstSunday.clone().add(1, 'week');
        },
        type: '国际通用'
    },
    // 父亲节（美国：6月的第三个星期日）
    {
        name: '父亲节',
        getDate: (year) => {
            const juneFirst = moment(`${year}-06-01`);
            const firstSunday = juneFirst.day(7);
            return firstSunday.clone().add(2, 'week');
        },
        type: '国际通用'
    },
    // 万圣节
    {
        name: '万圣节',
        getDate: (year) => moment(`${year}-10-31`),
        type: '国际通用'
    },
    // 感恩节（美国：11月的第四个星期四）
    {
        name: '感恩节',
        getDate: (year) => {
            const novemberFirst = moment(`${year}-11-01`);
            const firstThursday = novemberFirst.day(4);
            return firstThursday.clone().add(3, 'week');
        },
        type: '国际通用'
    },
    // 圣诞节
    {
        name: '圣诞节',
        getDate: (year) => moment(`${year}-12-25`),
        type: '国际通用'
    },
    // 复活节（春分月圆后的第一个星期日）
    {
        name: '复活节',
        getDate: (year) => {
            const a = year % 19;
            const b = Math.floor(year / 100);
            const c = year % 100;
            const d = Math.floor(b / 4);
            const e = b % 4;
            const f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3);
            const h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4);
            const k = c % 4;
            const l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31);
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return moment(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
        },
        type: '国际通用'
    }
];

// 获取指定日期范围内的节日
export function getHolidayInRange(start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    const startYear = startDate.year();
    const endYear = endDate.year();
    const holidaysInRange = [];

    for (let year = startYear; year <= endYear; year++) {
        HOLIDAYS.forEach((holiday) => {
            const holidayDate = holiday.getDate(year);
            if (holidayDate.isBetween(startDate, endDate, 'day', '[]')) {
                holidaysInRange.push({
                    name: holiday.name,
                    date: holidayDate.format('YYYY-MM-DD'),
                    type: holiday.type
                });
            }
        });
    }

    return holidaysInRange;
}

// 示例使用
// 假设 value 是一个 moment 对象
const value = moment('2024-01-01');
const holidays = getHolidayInRange(value.format('YYYY-MM-DD'), value.format('YYYY-MM-DD'));
console.log(holidays);
    