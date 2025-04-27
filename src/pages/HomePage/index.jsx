import React from 'react';
import { Layout, Row, Col } from 'antd';
import { Calendar, Badge, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import EChartsWrapper from './EchartsWrapper';
import './index.css';
import { getLunarDate } from '@/utils/lunarDateUtils.js';
import { getSolarTermsInRange } from '@/utils/solarTermsUtils.js';
import { getHolidayInRange } from '@/utils/holidayUtils.js';
import {getTraditionalHolidaysInRange} from '@/utils/traditionalUtils';




// 设置 moment 为中文环境
moment.locale('zh-cn');

const { Content } = Layout;

// 模拟演练数据
const DrillData = {
  20250423: ['对抗演练', '对抗演练2', '对抗演练', '对抗演练xxx', '对抗演练', '对抗演练ddd'],
  20250424: ['演练日'],
  // 其他日期数据...
};

const HomePage = () => {
  const dateCellRender = (value) => {

    const lunarDate = getLunarDate(value.format('YYYY-MM-DD'));
    const solarTerms = getSolarTermsInRange(value.format('YYYY-MM-DD'), value.format('YYYY-MM-DD'));
    const holidayTerms = getHolidayInRange(value.format('YYYY-MM-DD'), value.format('YYYY-MM-DD'));
    const traditionalTerms = getTraditionalHolidaysInRange(value.format('YYYY-MM-DD'), value.format('YYYY-MM-DD'));
    const solarTerm = solarTerms.length > 0 ? solarTerms[0].name : null;
    const traditionalTerm = traditionalTerms.length > 0 ? traditionalTerms[0].name : null;
    const holidayTerm = holidayTerms.length > 0 ? holidayTerms[0].name : null;
    const drillEvents = DrillData[value.format('YYYYMMDD')] || [];

    let lunarInfo = null;
    if (lunarDate) {
      if (lunarDate.lunarDay === 1) {
        // 初一仅展示月份
        lunarInfo = lunarDate.lunarMonCN;
      } else {
        // 非初一展示日期
        lunarInfo = lunarDate.lunarDayCN;
      }
    }


    // 若有节气，优先展示国际节日- 传统节日 - 节气，否则展示农历
    const dateInfo = holidayTerm || traditionalTerm || solarTerm || lunarInfo;

    const events = [
      ...drillEvents,
    ].map((event) => ({
      type: 'default',
      content: event
    }));

    return (
      <>
      <ul className="events">
        {events.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
      <div className="lunar-date-info">{dateInfo}</div>
      </>
    );
  };

  // 定义图表配置
  const taskChartOption = {
    title: { text: '演练任务统计' },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: ['已完成', '进行中', '未开始']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [12, 8, 5],
      type: 'bar'
    }]
  };

  const planChartOption = {
    title: { text: '演练方案统计' },
    tooltip: {},
    series: [{
      type: 'pie',
      data: [
        { value: 10, name: '网络安全' },
        { value: 15, name: '应急响应' },
        { value: 8, name: '红蓝对抗' }
      ]
    }]
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        <Content>
          <Row style={{ height: '50%' }}>
            <Col span={16} style={{ height: '100%' }}>
            <Calendar dateCellRender={dateCellRender} /> 
            </Col>
            <Col span={8} style={{ padding: 16 }}>
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <h4>我的待办</h4>
                {/* 待办列表渲染 */}
              </div>
            </Col>
          </Row>
          <Row style={{ height: '50%' }}>
            <Col span={12} style={{ height: '100%' }}>
              <EChartsWrapper 
                option={taskChartOption}
                style={{ height: '100%' }}
                loading={false}
                theme="light"
              />
            </Col>
            <Col span={12} style={{ height: '100%' }}>
              <EChartsWrapper 
                option={planChartOption}
                style={{ height: '100%' }}
                loading={false}
                theme="light"
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;