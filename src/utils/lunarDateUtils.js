import dayjs from 'dayjs';

// 定义所需的常量
const CHINESE_NUMBER = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const NUMBER_MONTH = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
const NUMBER_1 = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const NUMBER_2 = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIACS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, //1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, //1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, //1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, //1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, //1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, //1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, //1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, //1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, //1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, //1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
  0x0d520 //2100
];

// 依赖的辅助函数
const lunarYearDays = (y) => {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[y - 1900] & i) !== 0 ? 1 : 0;
  }
  return sum + yearLeapDays(y);
};

const yearLeapMonth = (y) => LUNAR_INFO[y - 1900] & 0xf;

const yearLeapDays = (y) => yearLeapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) !== 0 ? 30 : 29) : 0;

const cyclicalm = (num) => NUMBER_1[num % 10] + NUMBER_2[num % 12];

const monthDays = (y, m) => (LUNAR_INFO[y - 1900] & (0x10000 >> m)) === 0 ? 29 : 30;

const getYearZodiac = (y) => ZODIACS[(y - 4) % 12];

const getDateCN = (day) => {
  const prefixes = ["初", "十", "廿", "三十"];

  if (day === 10) return "初十";
  if (day === 20) return "二十";
  if (day === 30) return "三十";

  const tensPlace = Math.floor(day / 10);
  const unitsPlace = day % 10;

  return prefixes[tensPlace] + (unitsPlace ? CHINESE_NUMBER[unitsPlace] : "");
};

// getLunarDate 函数
const getLunarDate = (date) => {
  const lunarDate = new Array(7).fill(0);
  let temp = 0;
  let leap = 0;

  const baseDate = dayjs(new Date(1900, 0, 31));
  const objDate = dayjs(date);
  let offset = objDate.diff(baseDate, "day");

  lunarDate[5] = offset + 40; // 日柱，从1900-01-31开始的天数计算
  lunarDate[4] = 14;          // 月柱，从1900-01-31开始的月数计算

  let i = 1900;
  for (; i < 2100 && offset > 0; i++) {
    temp = lunarYearDays(i);
    offset -= temp;
    lunarDate[4] += 12; // 每经过一年增加12个月柱
  }

  if (offset < 0) {
    offset += temp;
    i--;
    lunarDate[4] -= 12;
  }

  lunarDate[0] = i; // 农历年份
  lunarDate[3] = i - 1864; // 年柱，甲子从1864年开始
  leap = yearLeapMonth(i); // 闰哪个月
  lunarDate[6] = 0; // 闰月标记，初始为0

  for (let j = 1; j < 13 && offset >= 0; j++) {
    if (leap > 0 && j === (leap + 1) && lunarDate[6] === 0) {
      --j;
      lunarDate[6] = 1;
      temp = yearLeapDays(i);
    } else {
      temp = monthDays(i, j);
    }

    if (lunarDate[6] === 1 && j === (leap + 1)) {
      lunarDate[6] = 0;
    }

    offset -= temp;
    if (lunarDate[6] === 0) {
      lunarDate[4]++;
    }

    lunarDate[1] = j; // 农历月份
  }

  if (offset === 0 && leap > 0 && lunarDate[6] === 1) {
    lunarDate[6] = 0;
  } else if (offset < 0) {
    offset += temp;
    lunarDate[1]--;
    lunarDate[4]--;
  }

  lunarDate[2] = offset + 1; // 农历日期

  return {
    date: objDate.format('YYYY-MM-DD'), // 公历日期
    lunarYear: lunarDate[0], // 农历年份
    lunarMon: lunarDate[1] + 1, // 农历月份
    lunarDay: lunarDate[2], // 农历日期
    isLeap: Boolean(lunarDate[6]), // 是否闰月
    zodiac: getYearZodiac(lunarDate[0]), // 生肖
    yearCyl: cyclicalm(lunarDate[3]), // 年柱
    monCyl: cyclicalm(lunarDate[4]), // 月柱
    dayCyl: cyclicalm(lunarDate[5]), // 日柱
    lunarYearCN: `${lunarDate[0].toString().split('').map(i => CHINESE_NUMBER[Number(i)]).join('')}`, // 农历年份中文表示
    lunarMonCN: `${NUMBER_MONTH[lunarDate[1]]}月`, // 农历月份中文表示
    lunarDayCN: getDateCN(lunarDate[2]) // 农历日期中文表示
  };
};

export { getLunarDate };