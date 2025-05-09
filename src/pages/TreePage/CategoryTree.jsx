import React, { useState } from 'react';
import { Tree, Modal, Form, Input, Select, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import './index.less'

const { TreeNode } = Tree;
const { Option } = Select;

const categoryTypes = ['场景类', '组织架构类', '通用类'];

const CategoryTree = ({ onSelectNode, onTreeDataChange }) => { // 新增 onTreeDataChange 回调

    // 新增：编辑/删除状态
    const [isEditing, setIsEditing] = useState(false);    // 是否处于编辑状态
    const [editingNode, setEditingNode] = useState(null); // 当前编辑的节点

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [treeData, setTreeData] = useState([
        {
            title: '初始分类',
            key: '1',
            level: 1,
            parent: null,
            type: '通用类',
            children: []
        }
    ]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentNode, setCurrentNode] = useState(null);
    const [newIsTopLevel, setNewIsTopLevel] = useState(true);
    const [expandedKeys, setExpandedKeys] = useState([]);

     // 新增：切换收缩状态
     const handleToggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

        // 修改 setTreeData 逻辑，触发回调同步数据
        const updateTreeData = (newData) => {
            setTreeData(newData);
            onTreeDataChange?.(newData); // 触发回调传递最新数据
        };

    const addCategory = (node = null) => {
        setNewIsTopLevel(node === null);
        setCurrentNode(node);
        form.resetFields();
        setVisible(true);
    };

    // 新增：处理编辑操作
    const handleEdit = (node) => {
        setIsEditing(true);          // 标记为编辑状态
        setCurrentNode(node);        // 复用 currentNode 保存目标节点
        setEditingNode(node);        // 保存当前编辑的节点
        form.setFieldsValue({        // 表单预填充当前节点数据
            type: node.type,
            name: node.title
        });
        setVisible(true);            // 显示模态框
    };

    // 修改 handleOk：区分新增/编辑逻辑
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const newKey = Date.now().toString();
            const newLevel = currentNode ? currentNode.level + 1 : 1;
            const newParent = currentNode ? currentNode.key : null;
    
            if (isEditing) {
                // 编辑逻辑：更新目标节点
                const updatedTreeData = updateNode(treeData, editingNode.key, {
                    ...editingNode,
                    title: values.name,
                    type: values.type
                });
                updateTreeData(updatedTreeData);
            } else {
                // 新增逻辑（原有代码）
                const newCategory = {
                    title: values.name,
                    key: newKey,
                    level: newLevel,
                    parent: newParent,
                    type: values.type,
                    children: []
                };
    
                if (newIsTopLevel) {
                    updateTreeData([...treeData, newCategory]); // 使用封装的 updateTreeData
                } else {
                    const newTreeData = treeData.map(item => {
                        if (item.key === currentNode.key) {
                            return {
                                ...item,
                                children: [...item.children, newCategory]
                            };
                        }
                        return item;
                    });
                    updateTreeData(newTreeData); // 使用封装的 updateTreeData
                    // 展开父节点
                    if (!expandedKeys.includes(currentNode.key)) {
                        setExpandedKeys([...expandedKeys, currentNode.key]);
                    }
                }
                setVisible(false);
            }
            setVisible(false);
            setIsEditing(false);      // 重置编辑状态
        } catch (errorInfo) {
            console.log('Validate Failed:', errorInfo);
        }
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const onTreeSelect = (selectedKeys) => {
        const selectedNode = findNodeByKey(treeData, selectedKeys[0]);
        if (selectedNode && onSelectNode) {
            onSelectNode(selectedNode);
        }
    };

    const findNodeByKey = (data, key) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === key) {
                return data[i];
            }
            if (data[i].children) {
                const found = findNodeByKey(data[i].children, key);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    const renderTreeNodes = (data) => {
        return data.map(item => (
            <TreeNode
                title={
                    // 包裹节点内容为 div 以便精确控制鼠标事件范围
                    <div className="tree-node-container">
                        <span className="node-title">{item.title}</span>
                        {/* 使用 CSS 类控制显示，替代内联样式 */}
                        <span className="node-actions node-actions-hidden">
                            <Space>
                                <Button type="link" icon={<PlusOutlined />} onClick={() => addCategory(item)} />
                                <Button type="link" icon={<EditOutlined />} />
                                <Button type="link" icon={<DeleteOutlined />} />
                            </Space>
                        </span>
                    </div>
                }
                key={item.key}
            >
                {renderTreeNodes(item.children)}
            </TreeNode>
        ));
    };

    return (
        <div style={{
            width: isCollapsed ? '80px' : '30%', // 收缩时80px，默认30%
            borderRight: '1px solid #ccc', 
            padding: '16px',
            transition: 'width 0.3s ease' // 新增过渡动画
         }}>
               {/* 新增：收缩切换按钮 */}
               <Button 
                type="text"
                icon={isCollapsed ? <RightOutlined /> : <LeftOutlined />} // 需要导入 LeftOutlined/RightOutlined
                onClick={handleToggleCollapse}
                style={{ marginBottom: '10px' }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => addCategory()}>
                新增一级分类
            </Button>
            <Tree
                onSelect={onTreeSelect}
                expandedKeys={expandedKeys}
                // 使用更精确的事件目标定位（直接操作节点容器）
                onMouseEnter={(e) => {
                    const container = e.event.target.closest('.tree-node-container');
                    if (container) {
                        const actions = container.querySelector('.node-actions');
                        actions?.classList.remove('node-actions-hidden');
                    }
                }}
                onMouseLeave={(e) => {
                    const container = e.event.target.closest('.tree-node-container');
                    if (container) {
                        const actions = container.querySelector('.node-actions');
                        // 延迟隐藏避免鼠标移动到按钮时闪烁
                        setTimeout(() => {
                            if (!container.contains(e.relatedTarget)) {
                                actions?.classList.add('node-actions-hidden');
                            }
                        }, 100);
                    }
                }}
            >
                {renderTreeNodes(treeData)}
            </Tree>
            <Modal
                title={newIsTopLevel ? '新增一级分类' : '新增子分类'}
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="category-form"
                    layout="vertical"
                >
                    <Form.Item
                        name="type"
                        label="分类类型"
                        rules={[{ required: true, message: '请选择分类类型' }]}
                    >
                        <Select placeholder="请选择分类类型">
                            {categoryTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="分类名称"
                        rules={[{ required: true, message: '请输入分类名称' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryTree;


// 新增：递归更新节点（用于编辑）
const updateNode = (nodes, targetKey, updatedNode) => {
    return nodes.map(node => {
        if (node.key === targetKey) {
            return updatedNode;   // 替换为更新后的节点
        }
        if (node.children) {
            return {
                ...node,
                children: updateNode(node.children, targetKey, updatedNode)
            };
        }
        return node;
    });