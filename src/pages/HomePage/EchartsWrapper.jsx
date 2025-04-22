import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';

const EChartsWrapper = ({ option, style, onChartReady }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && onChartReady) {
      const chartInstance = chartRef.current.getEchartsInstance();
      onChartReady(chartInstance);
    }
  }, [onChartReady]);

  return (
    <div style={{ height: '100%', ...style }}>
      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge={true}
        lazyUpdate={true}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default EChartsWrapper;