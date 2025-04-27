const moment = require('moment');

// 定义节日信息
const HOLIDAYS = [
    // 元旦
    {
        name: '元旦',
        getDate: (year) => moment(`${year}-01-01`),
        type: '国际通用'
    },
     // 妇女节（新增，3月8日）
     {
        name: '妇女节',
        getDate: (year) => moment(`${year}-03-08`), // 固定3月8日
        type: '国际通用'
    },
    // 劳动节（新增）
    {
        name: '劳动节',
        getDate: (year) => moment(`${year}-05-01`), // 固定5月1日
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
      // 国庆节
      {
        name: '国庆节',
        getDate: (year) => moment(`${year}-10-01`),
        type: '国际通用'
    },
    // 万圣节
    {
        name: '万圣节',
        getDate: (year) => moment(`${year}-10-31`),
        type: '国际通用'
    },
    // 圣诞节
    {
        name: '圣诞节',
        getDate: (year) => moment(`${year}-12-25`),
        type: '国际通用'
    },
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

// 示例验证劳动节（2024年5月1日）
const laborDay2024 = HOLIDAYS.find(h => h.name === '劳动节').getDate(2024);
console.log(laborDay2024.format('YYYY-MM-DD')); // 输出: 2024-05-01