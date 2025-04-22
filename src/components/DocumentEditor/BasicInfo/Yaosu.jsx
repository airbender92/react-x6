import React from 'react';

// 定义常量数据
const commonDatas = [
  { 'keyElementName': '演练名称', id: '1' },
  { 'keyElementName': '年度计划', id: '2' },
  { 'keyElementName': '演练预案', id: '3' },
  { 'keyElementName': '场景', id: '4' },
  { 'keyElementName': '演练开始时间', id: '5' },
  { 'keyElementName': '演练结束时间', id: '6' },
  { 'keyElementName': '预计演练耗时', id: '7' },
  { 'keyElementName': '演练形式', id: '8' },
  { 'keyElementName': '参与部门', id: '9' },
  { 'keyElementName': '参演人员', id: '10' },
  { 'keyElementName': '评估人员', id: '11' },
  { 'keyElementName': '演练地点', id: '12' },
  { 'keyElementName': '演练概述', id: '14' },
  { 'keyElementName': '演练范围', id: '15' },
  { 'keyElementName': '对生产系统的影响及保障措施', id: '16' },
  { 'keyElementName': '应急处理措施', id: '17' },
  { 'keyElementName': '需支持和配合事项', id: '18' }
];

const drillAssess = [
  { 'keyElementName': '演练评估表', id: '1' },
  { 'keyElementName': '演练过程建议', id: '2' }
];

const drillReport = [
  ...commonDatas,
  { 'keyElementName': '对灾备系统的影响及保障措施', id: '19' },
  { 'keyElementName': '实际切换开始时间', id: '20' },
  { 'keyElementName': '实际切换完成时间', id: '21' },
  { 'keyElementName': '切换总耗时', id: '22' },
  { 'keyElementName': '自动化恢复时间', id: '23' },
  { 'keyElementName': '签到表', id: '24' },
  { 'keyElementName': '应用系统切换情况汇总表', id: '25' },
  { 'keyElementName': '切换过程汇总', id: '26' },
  { 'keyElementName': '异常信息汇总', id: '27' },
  { 'keyElementName': '演练评估表', id: '28' },
  { 'keyElementName': '演练过程建议', id: '29' }
];

const Yaosu = ({ keyElementData, basicData }) => {
  // 计算数据数组
  let dataArr = [];
  if (basicData && basicData.resourceTypeEnum === 3) {
    dataArr = drillAssess;
  }
  if (basicData && basicData.resourceTypeEnum === 4) {
    dataArr = drillReport;
  }

  // 生成 HTML 字符串
  const keyEleStr = dataArr.map(v => {
    const eleKey = `@@专用：${v.keyElementName}@@`;
    const val = keyElementData[eleKey] || '';
    return `<p>${eleKey}</p>${val}<br/>`;
  }).join('');

  // 根据 keyElementData 的长度决定是否显示
  const isVisible = Object.keys(keyElementData).length > 0;

  return (
    isVisible && (
      <div className="yaosu" dangerouslySetInnerHTML={{ __html: keyEleStr }} />
    )
  );
};

export default Yaosu;
