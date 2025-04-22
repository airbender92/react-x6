import moment from 'moment';
import {
    lunarYearDays,
    yearLeapDays,
    yearLeapMonth,
    monthDays,
    NUMBER_MONTH,
    getDateCN
    
} from './lunarDateUtils'


// 定义中国传统节日信息（农历节日需转换为公历日期）
const TRADITIONAL_HOLIDAYS = [
    {
        name: '春节',
        lunar: { month: 1, day: 1 }, // 农历正月初一
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 1, 1)
    },
    {
        name: '元宵节',
        lunar: { month: 1, day: 15 }, // 正月十五
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 1, 15)
    },
    {
        name: '端午节',
        lunar: { month: 5, day: 5 }, // 五月初五
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 5, 5)
    },
    {
        name: '七夕节',
        lunar: { month: 7, day: 7 }, // 七月初七
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 7, 7)
    },
    {
        name: '中元节',
        lunar: { month: 7, day: 15 }, // 七月十五
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 7, 15)
    },
    {
        name: '中秋节',
        lunar: { month: 8, day: 15 }, // 八月十五
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 8, 15)
    },
    {
        name: '重阳节',
        lunar: { month: 9, day: 9 }, // 九月初九
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 9, 9)
    },
    {
        name: '腊八节',
        lunar: { month: 12, day: 8 }, // 腊月初八
        type: '中国传统',
        getDate: (year) => convertLunarToSolar(year, 12, 8)
    },
    {
        name: '除夕',
        lunar: { month: 12, day: 'last' }, // 腊月最后一天
        type: '中国传统',
        getDate: (year) => {
            const lastDay = getLunarMonthDays(year, 12); // 获取腊月天数
            return convertLunarToSolar(year, 12, lastDay);
        }
    }
];

// 辅助函数：农历转公历（基于之前的农历计算逻辑）
function convertLunarToSolar(solarYear, lunarMonth, lunarDay) {
    let targetDate = null;
    let currentYear = 1900;
    
    // 找到目标农历年的起始公历日期
    while (currentYear <= solarYear) {
        const baseDate = moment(new Date(1900, 0, 31));
        let offset = 0;
        
        // 计算到目标年前一年的总天数
        for (let y = 1900; y < currentYear; y++) {
            offset += lunarYearDays(y);
        }
        
        let lunarMonthCount = 0;
        let currentLunarMonth = 0;
        let currentLunarDay = 0;
        let leapMonth = yearLeapMonth(currentYear);
        
        // 遍历农历月份寻找目标日期
        for (let j = 1; j < 13; j++) {
            const days = (j === leapMonth + 1 && lunarMonthCount === leapMonth) 
                ? yearLeapDays(currentYear) 
                : monthDays(currentYear, j);
            
            if (lunarMonthCount === lunarMonth - 1) {
                currentLunarDay = lunarDay;
                break;
            }
            
            if (j === leapMonth + 1 && lunarMonthCount === leapMonth - 1) {
                lunarMonthCount++; // 处理闰月
            }
            
            if (lunarMonthCount < 12) {
                lunarMonthCount++;
            }
            offset += days;
        }
        
        if (currentYear === solarYear) {
            targetDate = baseDate.clone().add(offset, 'days');
            break;
        }
        currentYear++;
    }
    
    return moment(targetDate);
}

// 辅助函数：获取农历月份天数
function getLunarMonthDays(year, month) {
    const leap = yearLeapMonth(year);
    return month === leap ? yearLeapDays(year) : monthDays(year, month);
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