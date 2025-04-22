import React from 'react';
import { Form, Input, Select, Button, Row, Col, Space } from 'antd';

const { Option } = Select;

const TableSearch = ({ config, onSearch, onReset }) => {
    const [form] = Form.useForm();

    const handleSearch = () => {
        const values = form.getFieldsValue();
        onSearch(values);
    };

    const handleReset = () => {
        form.resetFields();
        onReset();
    };

    return (
        <Form form={form} layout="inline">
            <Row gutter={16}>
                {config.map((item, index) => {
                    if (item.render) {
                        return (
                            <Col key={index} span={item.span || 6}>
                                <Form.Item
                                    name={item.name}
                                    label={item.label}
                                >
                                    {item.render()}
                                </Form.Item>
                            </Col>
                        );
                    }
                    switch (item.type) {
                        case 'input':
                            return (
                                <Col key={index} span={item.span || 6}>
                                    <Form.Item
                                        name={item.name}
                                        label={item.label}
                                    >
                                        <Input placeholder={item.placeholder} />
                                    </Form.Item>
                                </Col>
                            );
                        case 'select':
                            const mappedOptions = item.options?.map((option) => ({
                                value: item.valueKey ? option[item.valueKey] : option.value,
                                label: item.labelKey ? option[item.labelKey] : option.label
                            }));
                            return (
                                <Col key={index} span={item.span || 6}>
                                    <Form.Item
                                        name={item.name}
                                        label={item.label}
                                    >
                                        <Select placeholder={item.placeholder}>
                                            {mappedOptions && mappedOptions.map((option) => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            );
                        default:
                            return null;
                    }
                })}
                <Col>
                    <Space>
                        <Button type="primary" onClick={handleSearch}>
                            搜索
                        </Button>
                        <Button onClick={handleReset}>
                            重置
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Form>
    );
};

export default TableSearch;
    