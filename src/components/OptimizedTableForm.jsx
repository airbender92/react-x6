import { Table, Button, Form, Input, Popconfirm, Select, message } from 'antd';
import update from 'immutability-helper';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ProForm } from '@ant-design/pro-form';

const type = 'DraggableBodyRow';
const EditableContext = React.createContext(null);

// 合并后的EditableRow组件（包含拖拽逻辑）
const EditableRow = ({ index, moveRow, formRefs, className, style, ...props }) => {
  const [form] = Form.useForm();
  const ref = useRef(null);

  // 拖拽逻辑
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
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

  const [, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 表单引用管理
  useEffect(() => {
    formRefs.current[index] = form;
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
            cursor: 'move',
            ...style,
          }}
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
            onMouseDown={(e) => e.stopPropagation()}
          />
        </Form.Item>
      )
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ padding: '5px 12px' }}
        onClick={() => setEditing(true)}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const CustomTableForm = ({ mode = 'edit' }) => {
  const [dataSource, setDataSource] = useState([
    {
      key: '0',
      name: 'Edward King 0',
      age: '32',
      address: 'London, Park Lane no. 0',
      gender: 'Male',
    },
    {
      key: '1',
      name: 'Edward King 1',
      age: '32',
      address: 'London, Park Lane no. 1',
      gender: 'Female',
    },
  ]);
  const [count, setCount] = useState(2);
  const formRefs = useRef({});

  const handleDelete = (key) => {
    const newData = dataSource.filter(item => item.key !== key);
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
        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
          <a>Delete</a>
        </Popconfirm>
      ),
    },
  ];

  const handleAdd = () => {
    const newData = {
      key: count.toString(),
      name: `Edward King ${count}`,
      age: '32',
      address: `London, Park Lane no. ${count}`,
      gender: 'Male',
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = dataSource[dragIndex];
      setDataSource(
        update(dataSource, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
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
      console.log('Submitted data:', currentData);
    } catch (errorInfo) {
      message.error('Validation failed');
    }
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
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
      </div>
    </DndProvider>
  );
};

const formItemConfig = {
  title: '表格表单',
  key: 'formTable',
  dataIndex: 'formTable',
  initialValue: [],
  renderFormItem: () => <CustomTableForm />,
  width: 'md',
  colProps: {
    xs: 24,
    md: 12,
  },
};

export { formItemConfig };    