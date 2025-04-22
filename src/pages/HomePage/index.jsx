import React from 'react';
import { Layout, Row, Col } from 'antd';
import { Calendar, Badge, ConfigProvider } from 'antd';
import EChartsWrapper from './EchartsWrapper';
import './index.less';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { getLunarDate } from '@/utils/lunarDateUtils.js';
import { getSolarTermsInRange } from '@/utils/solarTermsUtils.js';

// 设置 moment 为中文环境
moment.locale('zh-cn');

const { Content } = Layout;

// 模拟演练数据
const DrillData = {
  20221008: ['对抗演练'],
  20221018: ['演练日'],
  // 其他日期数据...
};

const HomePage = () => {
  const dateCellRender = (value) => {
    const lunarDate = getLunarDate(value.format('YYYY-MM-DD'));
    const solarTerms = getSolarTermsInRange(value.format('YYYY-MM-DD'), value.format('YYYY-MM-DD'));
    const solarTerm = solarTerms.length > 0 ? solarTerms[0].name : null;
    const drillEvents = DrillData[value.format('YYYYMMDD')] || [];

    const events = [
      ...drillEvents,
      ...(lunarDate ? [lunarDate.lunarMonCN + lunarDate.lunarDayCN] : []),
      ...(solarTerm ? [solarTerm] : [])
    ].map((event) => ({
      type: 'default',
      content: event
    }));

    return (
      <ul className="events">
        {events.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const headerRender = ({ value }) => {
    const lunarDate = getLunarDate(value.format('YYYY-MM-DD'));
    const solarTerms = getSolarTermsInRange(value.format('YYYY-MM-DD'), value.format('YYYY-MM-DD'));
    const solarTerm = solarTerms.length > 0 ? solarTerms[0].name : null;

    const dateInfo = [
      value.format('YYYY年MM月DD日'),
      ...(lunarDate ? [lunarDate.lunarMonCN + lunarDate.lunarDayCN] : []),
      ...(solarTerm ? [solarTerm] : [])
    ];

    return (
      <div style={{ padding: 8 }}>
        {dateInfo.map((info, index) => (
          <span key={index} style={{ marginRight: index < dateInfo.length - 1 ? 8 : 0 }}>
            {info}
          </span>
        ))}
      </div>
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
              <Calendar 
                cellRender={dateCellRender}
                // headerRender={headerRender}
                fullscreen // 添加 fullscreen 属性
              />
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