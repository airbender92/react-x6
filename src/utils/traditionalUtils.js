import moment from 'moment';
import {
    lunarYearDays,
    yearLeapDays,
    yearLeapMonth,
    monthDays,
    NUMBER_MONTH,
    getDateCN
} from './lunarDateUtils';

// 定义中国传统节日信息（农历节日需转换为公历日期）
const TRADITIONAL_HOLIDAYS = [
    {
        name: '春节',
        lunar: { month: 1, day: 1 }, // 农历正月初一
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 1, 1)
    },
    {
        name: '中秋节',
        lunar: { month: 8, day: 15 }, // 八月十五
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 8, 15)
    },
];

// 辅助函数：农历转公历（基于之前的农历计算逻辑），优化循环逻辑
function convertLunarToSolar(solarYear, lunarMonth, lunarDay) {
    const baseDate = moment(new Date(1900, 0, 31));
    let offset = 0;

    // 计算到目标年前一年的总天数
    for (let y = 1900; y < solarYear; y++) {
        offset += lunarYearDays(y);
    }

    const leapMonth = yearLeapMonth(solarYear);
    let currentLunarMonth = 0;

    for (let j = 1; j <= 12; j++) {
        let days;
        if (j === leapMonth + 1 && currentLunarMonth === leapMonth) {
            days = yearLeapDays(solarYear);
            currentLunarMonth++;
        } else {
            days = monthDays(solarYear, j);
            currentLunarMonth++;
        }

        if (currentLunarMonth < lunarMonth) {
            offset += days;
        } else {
            offset += lunarDay - 1;
            break;
        }
    }

    return baseDate.clone().add(offset, 'days');
}

// 获取指定日期范围内的传统节日
export function getTraditionalHolidaysInRange(start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    const startYear = startDate.year();
    const endYear = endDate.year();
    const holidays = [];

    for (let year = startYear; year <= endYear; year++) {
        TRADITIONAL_HOLIDAYS.forEach((holiday) => {
            const holidayDate = holiday.getDate(year);
            if (holidayDate.isBetween(startDate, endDate, 'day', '[]')) {
                holidays.push({
                    name: holiday.name,
                    solarDate: holidayDate.format('YYYY-MM-DD'),
                    lunar: `${NUMBER_MONTH[holiday.lunar.month - 1]}月${getDateCN(holiday.lunar.day)}`,
                    type: holiday.type
                });
            }
        });
    }

    return holidays;
}

// 示例使用
// const holidays = getTraditionalHolidaysInRange('2024-01-01', '2024-12-31');
// console.log(holidays);