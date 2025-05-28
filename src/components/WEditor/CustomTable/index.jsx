import React, {useState, Component } from 'react';
import { Table, InputNumber, Button, Space } from 'antd';
import 'antd/dist/antd.css';
import Resizable from 'react-resizable';
import 'react-resizable/css/styles.css';
import './index.less'; // 自定义样式

// 模拟 EditorCell 组件
const EditorCell = ({ mode, content, onContentChange }) => {
  return (
    <div className="editor-cell" style={{ padding: '8px' }}>
      {mode === 'edit' ? (
        <input
          type="text"
          value={content?.text || ''}
          onChange={(e) => onContentChange({ ...content, text: e.target.value })}
          style={{ width: '100%' }}
        />
      ) : (
        <div>{content?.text || ''}</div>
      )}
    </div>
  );
};

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

// 可调整宽度的表头单元格
const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={<div className="resize-handle" />}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

class ParentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'edit',
      tableData: [],
      columns: [],
      headerHeight: 24, // 表头初始高度（像素）
    };
    this.tableContainerRef = React.createRef();
    this.MIN_WIDTH = 80; // 最小列宽（像素）
    this.MIN_HEIGHT = 30; // 最小行高（像素）
  }

  onCreateTable = (rows, cols) => {
    // 初始化列
    const columns = Array.from({ length: cols }, (_, i) => ({
      title: `列 ${i + 1}`,
      dataIndex: `col${i}`,
      key: `col${i}`,
      width: 150, // 初始列宽
    }));

    // 初始化数据（保留历史数据）
    const initialData = Array.from({ length: rows }, (_, i) => 
      Array.from({ length: cols }, (_, j) => 
        this.state.tableData[i]?.[j] || { html: '', text: `单元格(${i+1},${j+1})` }
      )
    );

    this.setState({
      columns,
      tableData: initialData,
    });
  };

  handleColumnResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: Math.max(this.MIN_WIDTH, size.width), // 最小宽度限制
      };
      return { columns: nextColumns };
    });
  };

  handleHeaderResize = (e, { size }) => {
    this.setState({
      headerHeight: Math.max(16, size.height), // 最小高度限制
    });
  };

  render() {
    const { columns, tableData, headerHeight } = this.state;

    const renderTable = () => {
      if (!tableData.length) return null;

       // 关键修改：将二维数组转换为对象数组（匹配 dataIndex）
       const dataSource = tableData.map((row, rowIndex) => {
        const rowObj = {};
        row.forEach((cell, colIndex) => {
          rowObj[`col${colIndex}`] = cell; // 属性名与 columns.dataIndex 完全匹配（col0、col1...）
        });
        return { key: rowIndex, ...rowObj };
      });

      const resizableColumns = columns.map((col, index) => ({
        ...col,
        onHeaderCell: column => ({
          width: column.width,
          onResize: this.handleColumnResize(index),
        }),
        render: (content, record, rowIndex) => (
          <EditorCell
            mode={this.state.mode}
            content={content}
            onContentChange={(newContent) => {
              this.setState(prevState => {
                const updated = [...prevState.tableData];
                updated[rowIndex] = [...updated[rowIndex]];
                updated[rowIndex][col.dataIndex.replace('col', '')] = newContent;
                return { tableData: updated };
              });
            }}
          />
        ),
      }));

      return (
        <div ref={this.tableContainerRef} style={{ width: '100%', overflow: 'auto' }}>
          <Resizable
            width="100%"
            height={headerHeight}
            axis="y"
            handle={<div className="header-resize-handle" />}
            onResize={this.handleHeaderResize}
          >
            <div style={{ height: '100%', opacity: 0 }} />
          </Resizable>
          <Table
            dataSource={dataSource}
            columns={resizableColumns}
            pagination={false}
            bordered
            style={{ width: '100%', borderCollapse: 'collapse' }}
            components={{
              header: {
                cell: ResizeableTitle,
              },
            }}
            // 行高自适应
            onRow={(record, rowIndex) => ({
              style: { minHeight: this.MIN_HEIGHT },
              className: 'custom-row',
            })}
          />
        </div>
      );
    };

    return (
      <div>
        <TableSelection onCreateTable={this.onCreateTable} />
        {renderTable()}
      </div>
    );
  }
}

export default ParentComponent;  