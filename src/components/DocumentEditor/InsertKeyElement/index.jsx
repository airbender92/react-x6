import React, { useState, useEffect } from 'react';
import { Table, Radio } from 'antd';
import RadioTable from '../radioTable/RadioTable';

// 定义公共数据
const commonDatas = [
  { keyElementName: '演练名称', id: '1', disabled: false },
  { keyElementName: '年度计划', id: '2', disabled: false },
  { keyElementName: '演练预案', id: '3', disabled: false },
  { keyElementName: '场景', id: '4', disabled: false },
  { keyElementName: '演练开始时间', id: '5', disabled: false },
  { keyElementName: '演练结束时间', id: '6', disabled: false },
  { keyElementName: '预计演练耗时', id: '7', disabled: false },
  { keyElementName: '演练形式', id: '8', disabled: false },
  { keyElementName: '参与部门', id: '9', disabled: false },
  { keyElementName: '参演人员', id: '10', disabled: false },
  { keyElementName: '评估人员', id: '11', disabled: false },
  { keyElementName: '演练地点', id: '12', disabled: false },
  { keyElementName: '演练概述', id: '14', disabled: false },
  { keyElementName: '演练范围', id: '15', disabled: false },
  { keyElementName: '对生产系统的影响及保障措施', id: '16', disabled: false },
  { keyElementName: '应急处理措施', id: '17', disabled: false },
  { keyElementName: '需支持和配合事项', id: '18', disabled: false }
];

// 定义不同类型的数据
const datas = {
  drillPlan: commonDatas,
  drillAssess: [
    { keyElementName: '演练评估表', id: '1', disabled: false },
    { keyElementName: '演练过程建议', id: '2', disabled: false }
  ],
  drillReport: [
    ...commonDatas,
    { keyElementName: '对灾备系统的影响及保障措施', id: '19', disabled: false },
    { keyElementName: '实际切换开始时间', id: '20', disabled: false },
    { keyElementName: '实际切换完成时间', id: '21', disabled: false },
    { keyElementName: '切换总耗时', id: '22', disabled: false },
    { keyElementName: '自动化恢复时间', id: '23', disabled: false },
    { keyElementName: '签到表', id: '24', disabled: false },
    { keyElementName: '应用系统切换情况汇总表', id: '25', disabled: false },
    { keyElementName: '切换过程汇总', id: '26', disabled: false },
    { keyElementName: '异常信息汇总', id: '27', disabled: false },
    { keyElementName: '演练评估表', id: '28', disabled: false },
    { keyElementName: '演练过程建议', id: '29', disabled: false }
  ],
  emergencyReport: [
    { keyElementName: '时间上报信息', id: '1', disabled: false },
    { keyElementName: '应急响应信息', id: '2', disabled: false },
    { keyElementName: '应急处置信息', id: '3', disabled: false }
  ]
};

const InsertKeyElement = ({ resource }) => {
  // 定义表格数据状态
  const [tableData, setTableData] = useState([]);
  // 定义选中的单选框值状态
  const [radioValue, setRadioValue] = useState('');

  // 监听 resource 变化，更新表格数据
  useEffect(() => {
    if (resource) {
      switch (resource) {
        case '1':
          setTableData(datas.drillPlan);
          break;
        case '2':
          setTableData(datas.drillAssess);
          break;
        case '3':
          setTableData(datas.drillReport);
          break;
        case '4':
          setTableData(datas.emergencyReport);
          break;
        default:
          break;
      }
    }
  }, [resource]);

  // 处理单选框选中变化
  const handleRadioChange = (e) => {
    const newValue = e.target.value;
    setRadioValue(newValue);
    // 模拟 $emit 事件
    console.log('translateRadio event emitted with value:', newValue);
  };

  const tableColumns = [
    {
      title: '要素名称',
      dataIndex: 'keyElementName',
      key: 'keyElementName'
    }
  ];

  return (
    <div id="insertKeyElement" className="hatech-bcms">
      <RadioTable
        radioTable={this}
        table={{
          data: tableData,
          columns: tableColumns,
          onRadioChange: handleRadioChange,
          radioValue: radioValue
        }}
      />
    </div>
  );
};

export default InsertKeyElement;
