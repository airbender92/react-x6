import React, { useState, createRef, useEffect } from 'react';
import { Table, InputNumber, Button, Space } from 'antd';
import 'antd/dist/antd.css';
import EditorCell from './EditorCell'; // 假设编辑器组件已适配Ant Design

const TableSelection = ({ onCreateTable }) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(3);

  return (
    <div className="mb-4">
      <Space>
        <span>行数:</span>
        <InputNumber
          value={rows}
          onChange={setRows}
          min={1}
          style={{ width: 80 }}
        />
        <span>列数:</span>
        <InputNumber
          value={cols}
          onChange={setCols}
          min={1}
          style={{ width: 80 }}
        />
        <Button
          type="primary"
          onClick={() => onCreateTable(rows, cols)}
        >
          创建表格
        </Button>
      </Space>
    </div>
  );
};

const ParentComponent = () => {
  const [mode, setMode] = useState('edit');
  const [tableData, setTableData] = useState([]);
  const [colWidths, setColWidths] = useState([]);
  const customTableRef = createRef();
  const MIN_WIDTH = 80; // 最小宽度（像素）
  const MIN_HEIGHT = 30; // 最小高度（像素）

  const onCreateTable = (rows, cols) => {
    // 初始化列宽（平均分配）
    const initialWidths = Array(cols).fill(100 / cols); // 百分比基准
    setColWidths(initialWidths);

    // 初始化数据（保留历史数据）
    const initialData = Array.from({ length: rows }, (_, i) => 
      Array.from({ length: cols }, (_, j) => 
        tableData[i]?.[j] || { html: '', text: '' }
      )
    );
    setTableData(initialData);
  };

  // 使用Ant Design Table渲染表格
  const renderTable = () => {
    if (!tableData.length) return null;

    const columns = tableData[0].map((_, colIndex) => ({
      title: '', // 隐藏表头
      dataIndex: `col${colIndex}`,
      key: `col${colIndex}`,
      width: `${colWidths[colIndex] || (100 / tableData[0].length)}%`,
      render: (content, record, rowIndex) => (
        <EditorCell
          mode={mode}
          content={content}
          onContentChange={(newContent) => {
            setTableData(prev => {
              const updated = [...prev];
              updated[rowIndex] = [...updated[rowIndex]];
              updated[rowIndex][colIndex] = newContent;
              return updated;
            });
          }}
        />
      ),
      // 移除排序和筛选功能
      sorter: false,
      filterDropdown: false,
      customRender: ({ children }) => children,
    }));

    return (
      <Table
        dataSource={tableData.map((row, index) => ({ key: index, ...row }))}
        columns={columns}
        pagination={false}
        bordered
        style={{ width: '100%', borderCollapse: 'collapse' }}
        components={{
          // 隐藏表头
          header: {
            cell: () => null,
          },
        }}
        // 行高自适应
        onRow={(record, rowIndex) => ({
          style: { minHeight: MIN_HEIGHT },
          className: 'custom-row',
        })}
      />
    );
  };

  return (
    <div>
      <TableSelection onCreateTable={onCreateTable} />
      <div ref={customTableRef} className="ant-table-container">
        {renderTable()}
      </div>
    </div>
  );
};

export default ParentComponent;