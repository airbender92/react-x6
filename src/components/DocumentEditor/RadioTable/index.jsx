import React, { useState, useEffect } from 'react';
import { Table, Pagination, Popover, Checkbox, Radio as AntRadio, Spin } from 'antd';
import axios from 'axios';

const RadioTable = ({ radioTable, table }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [radioValue, setRadioValue] = useState('');

    // 初始化表格数据
    useEffect(() => {
        if (!table.handInit) {
            initTable();
        }
    }, []);

    const initTable = async (type) => {
        setIsLoading(true);
        const params = {
            page: table.page,
            limit: table.limit,
            sortName: table.sort.sortName,
            sortType: table.sort.sortType,
            ...table.search
        };

        for (const key in params) {
            if (typeof params[key] === 'object') {
                if (params[key] === null) {
                    params[key] = '';
                } else {
                    params[key] = `${params[key][0]},${params[key][1]}`;
                }
            }
        }

        try {
            const response = await axios.get(table.url, { params });
            table.count = response.data.count;
            table.data = response.data.data;
            if (table.chooseRadio && table.data.length > 0) {
                setRadioValue(table.data[0].resourceId || table.data[0].id || table.data[0].keyElementName);
            }
        } catch (error) {
            console.error('请求表格数据失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const controllOperationShow = (option, record) => {
        let flag = true;
        if (option.formatterKey) {
            option.formatterKey.forEach((v, i) => {
                if (typeof record[v] === 'boolean') {
                    flag = flag && record[v];
                } else {
                    option.value.forEach((a, b) => {
                        if (Array.isArray(a)) {
                            if (i === b) {
                                flag = flag && a.includes(record[v]);
                            }
                        } else {
                            flag = flag && (a === record[v]) && (i === b);
                        }
                    });
                }
            });
        }
        return flag;
    };

    const onTableFmtClick = (param) => {
        if (radioTable[param.event]) {
            return radioTable[param.event].call(null, param);
        }
        return '';
    };

    const radioTableOptionBtn = (param) => {
        if (param.row !== undefined) {
            param.select = [param.row];
        } else {
            param.select = table.select;
        }
        if (radioTable[param.type]) {
            return radioTable[param.type].call(null, param);
        }
        return '';
    };

    const sortChange = (column) => {
        if (column && table.sort.custom) {
            table.sort.sortName = column.field;
            table.sort.sortType = column.order === 'descend' ? 'DESC' : 'ASC';
            initTable(1);
        }
    };

    const rowClick = (record) => {
        if (!record || record.disabled) return;
        const id = record.id || record.resourceId || record.keyElementName;
        if (id === radioValue) {
            setRadioValue('');
        } else {
            setRadioValue(id);
        }
    };

    const onIsCellHide = (column) => {
        const newColumn = table.column.map((col) => {
            if (col.prop === column.prop) {
                return { ...col, isHide: !col.isHide };
            }
            return col;
        });
        table.column = newColumn;
    };

    const tableIndex = (index) => {
        return (table.page - 1) * table.limit + index + 1;
    };

    const tableSizeChange = (limit) => {
        table.limit = limit;
        initTable();
    };

    const tableCurrentChange = (page) => {
        table.page = page;
        initTable();
    };

    const getTemplateRow = (row) => {
        rowClick(row);
    };

    const columns = [];

    if (table.selectMore) {
        columns.push({
            title: '',
            key: 'radio',
            width: 51,
            align: 'center',
            render: (_, record) => {
                const id = record.resourceId || record.id || record.keyElementName;
                return (
                    <AntRadio
                        label={id}
                        value={id}
                        checked={radioValue === id}
                        onChange={() => getTemplateRow(record)}
                        disabled={record.disabled || false}
                    >
                        &nbsp;
                    </AntRadio>
                );
            }
        });
    }

    if (table.isIndexShow) {
        columns.push({
            title: '编号',
            key: 'index',
            width: 70,
            align: 'center',
            fixed: 'left',
            render: (_, __, index) => tableIndex(index)
        });
    }

    table.column.forEach((column) => {
        if (column.isHide) {
            columns.push({
                title: column.label,
                dataIndex: column.prop,
                key: column.prop,
                align: column.alignLeft ? 'left' : 'center',
                ellipsis: true,
                sorter: table.sort.custom,
                render: (text, record) => {
                    if (column.formatter && column.click) {
                        return (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTableFmtClick({ event: column.click, row: record });
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: column.formatter[text]
                                       ? column.formatter[text].replace('${value}', text)
                                        : text
                                }}
                            />
                        );
                    } else if (column.formatter) {
                        return (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: column.formatter[text]
                                       ? column.formatter[text].replace('${value}', text)
                                        : text
                                }}
                            />
                        );
                    }
                    return <div>{text}</div>;
                }
            });
        }
    });

    if (table.showTableOption) {
        columns.push({
            title: '操作',
            key: 'option',
            width: table.cellOptionWidth,
            align: table.column.some((col) => col.alignLeft) ? 'left' : 'center',
            fixed: 'right',
            render: (_, record, index) => (
                <>
                    {table.cellOption.map((option, key) => (
                        option.isShow && (!option.formatterKey || controllOperationShow(option, record)) && (
                            <div
                                key={key}
                                className={`ha-icon-${option.icon}`}
                                title={option.name}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    radioTableOptionBtn({
                                        key,
                                        type: option.type,
                                        index,
                                        row: record,
                                        option
                                    });
                                }}
                            />
                        )
                    ))}
                </>
            )
        });
    }

    return (
        <div className="hatech-plugin-table">
            {table.showHeaderOption && (
                <div className="hatech-table-header">
                    <div className="hatech-table-header-left">
                        <ul>
                            <li>{table.title}</li>
                        </ul>
                    </div>
                    <div className="hatech-table-header-right">
                        <ul>
                            {table.headerOption.map((option, key) => (
                                option.isShow && (
                                    <li
                                        key={key}
                                        title={option.name}
                                        onClick={() =>
                                            radioTableOptionBtn({ key, type: option.type, option })
                                        }
                                    >
                                        <div className={`ha-icon-${option.icon}`} />
                                    </li>
                                )
                            ))}
                            <li title="显隐列">
                                <Popover
                                    placement="bottom"
                                    content={
                                        table.column.map((column, key) => (
                                            <Checkbox
                                                key={key}
                                                checked={column.isHide}
                                                name={column.prop}
                                                onChange={() => onIsCellHide(column)}
                                            >
                                                {column.label}
                                            </Checkbox>
                                        ))
                                    }
                                    trigger="click"
                                >
                                    <i className="el-icon-menu" />
                                </Popover>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
            <Spin spinning={isLoading} tip="加载中，请稍后...">
                <Table
                    dataSource={table.data}
                    columns={columns}
                    bordered
                    resizable
                    size="small"
                    style={{ width: table.tableWidth }}
                    onRow={(record) => ({
                        onClick: () => rowClick(record)
                    })}
                    onSortChange={sortChange}
                    rowKey={(record) => record.id || record.resourceId || record.keyElementName}
                />
            </Spin>
            {table.showPagination !== false && (
                <div className="hatech-table-footer">
                    <Pagination
                        showQuickJumper
                        showSizeChanger
                        current={table.page}
                        pageSize={table.limit}
                        pageSizes={table.pageSize}
                        total={table.count}
                        onShowSizeChange={tableSizeChange}
                        onChange={tableCurrentChange}
                    />
                </div>
            )}
        </div>
    );
};

export default RadioTable;
