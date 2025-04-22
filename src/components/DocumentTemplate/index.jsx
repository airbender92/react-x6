import React, { useState, useEffect } from 'react';
import { message, Modal, Icon } from 'antd';
import BaseOrg from '../documentEdit/org/org';
import { useStore } from '@hatech/core';

const Avatar = ({ onChange }) => {
    // 定义状态
    const [localValue, setLocalValue] = useState([]);
    const [addWriterDialogVisible, setAddWriterDialogVisible] = useState(false);
    const [userParams, setUserParams] = useState([]);

    const store = useStore();

    // 模拟 mounted 生命周期，默认显示当前用户
    useEffect(() => {
        setLocalValue([{
            userId: store.state.micro.user.id,
            userName: store.state.micro.user.name
        }]);
        onChange(localValue);
    }, [onChange, store.state.micro.user]);

    // 添加编写人，打开对话框
    const addWriters = () => {
        setAddWriterDialogVisible(true);
    };

    // 删除编写人
    const deleteUser = (index) => {
        const newLocalValue = [...localValue];
        newLocalValue.splice(index, 1);
        setLocalValue(newLocalValue);
        onChange(newLocalValue);
    };

    // 取消新增编写人
    const onModalCancel = () => {
        setAddWriterDialogVisible(false);
        onChange(localValue);
    };

    // 新增编写人保存
    const groupAddUserSure = () => {
        const selectedRows = document.querySelector('base-org').getSelectedRows();
        setUserParams(selectedRows);

        const alreadyHas = selectedRows.filter((item) =>
            localValue.some((e) => e.userId === item.id)
        );
        if (alreadyHas.length > 0) {
            message.error(`操作失败，${alreadyHas[0].name}已存在`);
            return;
        }

        const newLocalValue = [
            ...localValue,
            ...selectedRows.map((v) => ({
                userId: v.id,
                userName: v.name
            }))
        ];
        setLocalValue(newLocalValue);
        onChange(newLocalValue);
        setAddWriterDialogVisible(false);
    };

    const addWriterDialogConfig = {
        width: '50%',
        title: '新增编写人',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        destroyOnClose: true,
        footer: [
            <button key="cancel" onClick={onModalCancel}>取消</button>,
            <button key="save" type="primary" onClick={groupAddUserSure}>保存</button>
        ]
    };

    return (
        <div className="writers" id="writersInfo">
            {localValue.map((item, index) => (
                <div key={index} className="theWriter">
                    <span className="deleteWriter" onClick={() => deleteUser(index)}>
                        <Icon type="close" />
                    </span>
                    <span className="writer-icon">
                        <div className="ha-icon-user"></div>
                    </span>
                    <span className="writer-name" title={item.userName}>
                        {item.userName}
                    </span>
                </div>
            ))}
            <div className="theWriter plusWriter" onClick={addWriters}>
                <span className="writer-icon">
                    <div className="ha-icon-add"></div>
                </span>
            </div>
            <Modal
                {...addWriterDialogConfig}
                visible={addWriterDialogVisible}
                onCancel={onModalCancel}
            >
                <BaseOrg />
            </Modal>
        </div>
    );
};

export default Avatar;
