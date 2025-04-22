import { Table, Button, Form, Input, Popconfirm, Select, message } from 'antd';
import update from 'immutability-helper';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid'

const type = 'DraggableBodyRow';
const EditableContext = React.createContext(null);

// 合并后的EditableRow组件（包含拖拽逻辑）
const EditableRow = ({ index, moveRow, formRefs, className, style, isDraggable, ...props }) => {
  const [form] = Form.useForm();
  const ref = useRef(null);

  // 拖拽逻辑
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    canDrop: () => isDraggable,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) return {};
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow(item.index, index);
    },
  });
  let canDrag = false;
  const [, drag] = useDrag({
    type,
    canDrag: () => {
        if(!canDrag) return false;
        if(!isDraggable) return false;
        return true;
    },
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
        canDrag = false;
    }
  });

  // 为了只通过拖拽手柄实现拖拽
  const handleDragStart = (e) => {
    if(e.target.closest('.evaluate-drag-handle')){
        canDrag = true;
        drag(ref.current);
    }
  }

  // 表单引用管理
  useEffect(() => {
    if(formRefs?.current) {
        formRefs.current[index] = form;
    }
  }, [index, formRefs, form]);

  drop(drag(ref));

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr
          ref={ref}
          {...props}
          className={`${className}${isOver ? dropClassName : ''}`}
          style={{
            ...style,
          }}
          onMouseDown={handleDragStart}
        />
      </EditableContext.Provider>
    </Form>
  );
};

// EditableCell组件保持不变
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  selectOptions,
  mode,
  ...restProps
}) => {
  const [editing, setEditing] = useState(() => mode === 'edit');
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (mode === 'edit') {
      setEditing(true);
    }
  }, [mode]);

  useEffect(() => {
    if (editing && form) {
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
      inputRef.current?.focus();
    }
  }, [editing, form, dataIndex, record]);

  let childNode = children;
  const cellValue = record?.[dataIndex];
  const getDisplayValue = () => {
    if (selectOptions) {
      const option = selectOptions.find(o => o.value === cellValue);
      return option?.label || cellValue;
    }
    return cellValue;
  };
  if (editable) {
    childNode = editing ? (
      selectOptions ? (
        <Form.Item
          name={dataIndex}
          rules={[{ required: true, message: `${title} is required.` }]}
          style={{ margin: 0 }}
        >
          <Select
            ref={inputRef}
            placeholder={`Please select ${title}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {selectOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item
          name={dataIndex}
          rules={[{ required: true, message: `${title} is required.` }]}
          style={{ margin: 0 }}
        >
          <Input
            ref={inputRef}
            placeholder={`Please enter ${title}`}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </Form.Item>
      )
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ padding: '5px 12px' }}
        title={getDisplayValue()}
        // 这里可以实现在只读模式下点击显示编辑框的功能，但是需要注意样式调整
        // onClick={() => setEditing(true)}
      >
        {getDisplayValue()}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const EditableDragableTable = React.forwardRef(({ mode = 'edit', value }, ref) => {
  const [dataSource, setDataSource] = useState(() => {
    return (value || []).map((item, index) => ({
     ...item,
     uuid: uuidv4(), // 为每个项目添加唯一的 UUID
    }))
  });
  const [count, setCount] = useState(() => (value || []).length);
  const [showTableTips, setShowTableTips] = useState(false);
  const formRefs = useRef({});

  const handleDelete = (uuid) => {
    const currentData = dataSource.map((row, index) => ({
        ...row,
        ...formRefs.current[index]?.getFieldsValue(),
    }))
    const newData = currentData.filter(item => item.uuid !== uuid);
    if(newData.length === 0) {
      setShowTableTips(true); 
    } else {
      setShowTableTips(false);
    }
    setDataSource(newData);
  };

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];

  const defaultColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      editable: true,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      editable: true,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      editable: true,
      selectOptions: genderOptions,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => (
        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.uuid)}>
          <a>Delete</a>
        </Popconfirm>
      ),
    },
  ];

  const handleAdd = () => {
    const newData = {
      uuid: uuidv4(), // 为新添加的项目添加唯一的 UUID
    };
    const currentData = dataSource.map((row, index) => ({
       ...row,
       ...formRefs.current[index]?.getFieldsValue(),
    }))
    setDataSource([...currentData, newData]);
    setCount(count + 1);
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
        const currentData = dataSource.map((row, index) => ({
            ...row,
            ...formRefs.current[index]?.getFieldsValue(),
        }));
      const dragRow = currentData[dragIndex];
      const newData = currentData.filter(item => item.uuid !== dragRow.uuid);
      newData.splice(hoverIndex, 0, dragRow);
      setDataSource(newData );
    },
    [dataSource]
  );

  const handleSubmit = async () => {
    try {
      await Promise.all(
        Object.values(formRefs.current).map(form => form.validateFields())
      );
      message.success('Validation success');
      const currentData = dataSource.map((row, index) => ({
        ...row,
        ...formRefs.current[index]?.getFieldsValue(),
      }));
      if(currentData.length === 0) {
        setShowTableTips(true); 
      } else {
        setShowTableTips(false);
      }
      console.log('Submitted data:', currentData);
      return currentData.map(data => {
        const { uuid, ...rest } = data; // 解构 uuid
        return rest; // 返回除 uuid 外的其他属性
      });
    } catch (errorInfo) {
      message.error('Validation failed');
      return null;
    }
  };

  const components = {
    body: {
      row: (props) => (
        <EditableRow {...props} isDraggable={mode !== 'view'} />
      ),
      cell: (props) => (<EditableCell {...props}  />),
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        selectOptions: col.selectOptions,
        mode,
      }),
    };
  });

  React.useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Button onClick={handleAdd} type="primary" style={{ marginRight: 16 }}>
            Add Row
          </Button>
          <Button onClick={handleSubmit} type="primary">
            Submit
          </Button>
        </div>
        
        <Table
          rowKey={'uuid'}
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          onRow={(record, index) => ({
            index,
            moveRow,
            formRefs,
            record,
          })}
          pagination={false}
        />
        {
            showTableTips && (
                <div style={{color: 'red', textAlign: 'center', marginTop: 16}}>
                    Please add a row first      . 
                </div>
            )
        }
      </div>
    </DndProvider>
  );
});

export default EditableDragableTable;