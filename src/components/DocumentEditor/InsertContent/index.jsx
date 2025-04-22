import React, { useState } from 'react';
import { Table, Input, Select, Button, Form, Row, Col } from 'antd';
import RadioTable from '../radioTable/RadioTable';
import RadioDocument from '../radioDocument';

const { Option } = Select;

const InsertContent = ({ treeChooseData }) => {
    // 定义状态
    const [table, setTable] = useState({
        title: '文档内容列表',
        id: 'draas-compilationInsertContent-table',
        url: '/plan/word/insertion/select',
        width: '',
        showCellUrl: '',
        dropCellUrl: '',
        page: 1,
        limit: 5,
        pageSize: [5, 10, 20, 50, 100],
        isIndexShow: false,
        chooseRadio: true,
        data: [],
        radio: '',
        count: 0,
        selectMore: true,
        sort: {},
        mySlot: true,
        search: {
            crtUser: '',
            wordName: '',
            resourceType: ''
        },
        column: [
            { label: '文档名称', prop: 'resourceName', width: 'auto', isHide: true },
            {
                label: '内容类型',
                prop: 'resourceType',
                width: 'auto',
                isHide: true,
                formatter: (value) => {
                    const formatters = {
                        0: <span className='hatech-fmt hatech-primary'>文档模板</span>,
                        1: <span className='hatech-fmt hatech-primary'>预案文档</span>,
                        2: <span className='hatech-fmt hatech-primary'>方案文档</span>
                    };
                    return formatters[value] || value;
                }
            },
            { label: '负责人', prop: 'crtUserName', width: 'auto', isHide: true },
            { label: '更新时间', prop: 'upTime', width: 'auto', isHide: true }
        ],
        showHeaderOption: false,
        showTableOption: false
    });

    const [allStatus] = useState([
        { value: 0, label: '文档模板' },
        { value: 1, label: '预案文档' },
        { value: 2, label: '方案文档' }
    ]);

    const [data] = useState({
        documentName: '请选择文档内容',
        treeChooseData,
        showCheckbox: true
    });

    const chooseId = { ...data, id: table.radio };

    // 处理表格查询
    const onTableSearch = () => {
        // 这里假设 RadioTable 组件有 _initTable 方法
        // 实际使用时需要确保组件有该方法
    };

    // 处理表格重置
    const onTableReset = () => {
        setTable(prev => ({
            ...prev,
            search: {
                crtUser: '',
                wordName: '',
                resourceType: ''
            }
        }));
    };

    // 获取文档数据
    const getDocumentData = () => {
        // 这里假设 RadioDocument 组件有 initPlanTree 和 getAllContent 方法
        // 实际使用时需要确保组件有这些方法
    };

    // 监听 table.radio 变化
    React.useEffect(() => {
        if (table.radio !== '') {
            if (chooseId.id) {
                getDocumentData();
            }
        }
    }, [table.radio, chooseId.id]);

    return (
        <div id="insertContent">
            <RadioTable radioTable={this} table={table}>
                <div className="hatech-search">
                    <Form onFinish={onTableSearch}>
                        <Row gutter={10}>
                            <Col span={6}>
                                <Form.Item name="wordName" initialValue={table.search.wordName}>
                                    <Input placeholder="文档名称" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="resourceType" initialValue={table.search.resourceType}>
                                    <Select placeholder="内容类型">
                                        {allStatus.map(item => (
                                            <Option key={item.value} value={item.value}>
                                                {item.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="crtUser" initialValue={table.search.crtUser}>
                                    <Input placeholder="负责人" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">查询</Button>
                                    <Button onClick={onTableReset}>清空</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </RadioTable>
            <RadioDocument documentObject={chooseId} />
        </div>
    );
};

export default InsertContent;
