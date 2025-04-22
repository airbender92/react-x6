import React, { useState, useEffect } from 'react';
import { Table, Checkbox } from 'antd';
import useOrganizeYj from './hook/useOrganizeYj';
import useSetDuty from './hook/useSetDuty';
import useUserOrganize from './hook/useUserOrganize';

const Org = () => {
    // 使用自定义 Hook 获取状态和方法
    const { setDutyRef, setDuty, onFormEvent, showDialog } = useSetDuty();
    const { userOrganizeCurd, userOrganizeEvents, userOrganizeCurdRef, addUserDialog } = useUserOrganize();
    const {
        organizeYjRef,
        organizeYjCurd,
        organizeYjEvents,
        orgRef,
        uploadDialog,
        setFun
    } = useOrganizeYj();

    // 初始化 setFun 回调
    useEffect(() => {
        setFun((params) => {
            showDialog(params.data);
        });
    }, [setFun, showDialog]);

    // 管理选中行状态
    const [selectRows, setSelectRows] = useState([]);

    // 处理行选择变化
    const selectChange = (selectedRowKeys, selectedRows) => {
        setSelectRows(selectedRows);
    };

    // 配置表格列
    const columns = userOrganizeCurd.value.table.config.columns.map((col) => {
        if (col.type === 'selection') {
            return {
                ...col,
                render: (_, record) => (
                    <Checkbox
                        onChange={() => {
                            const newSelectedRows = selectRows.includes(record)
                               ? selectRows.filter((row) => row !== record)
                                : [...selectRows, record];
                            setSelectRows(newSelectedRows);
                        }}
                    />
                ),
            };
        }
        return col;
    });

    return (
        <div className="h100_per">
            <Table
                ref={userOrganizeCurdRef}
                columns={columns}
                dataSource={userOrganizeCurd.value.table.data}
                pagination={userOrganizeCurd.value.pagination}
                onRow={(record) => ({
                    onClick: () => {
                        if (userOrganizeEvents.onRowClick) {
                            userOrganizeEvents.onRowClick(record);
                        }
                    },
                })}
                rowSelection={{
                    selectedRowKeys: selectRows.map((row) => row.id),
                    onChange: selectChange,
                }}
            />
        </div>
    );
};

export default Org;
