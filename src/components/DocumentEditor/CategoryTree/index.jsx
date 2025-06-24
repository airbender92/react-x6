import React, { useState, useEffect} from 'react'
import {
    Tree,
    Modal,
    Form,
    Input,
    Select,
    Button,
    Space
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons'
import {findNodeByKey} from '@/components/DocumentEditor/utils'
import {AuthButton} from '@/components/AuthComponent'
import { documentAuthMap } from '../constants'
import styles from './index.less'

const { TreeNode} = Tree;

const CategoryTree = (props) => {
    const {
        dispatch,
        editorActions,
        activeTreeNode,
        editorState,
        treeData=[],
        onSelectNode,
    } = props;

    const [isCollapsed, setIsCollapsed] = useState(false);

    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentNode, setCurrentNode] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingNode, setEditingNode] = useState(null);
    const [newIsTopLevel, setNewIsTopLevel] = useState(true);
    const [expandedKeys, setExpandedKeys] = useState([]);

    const {
        planId, 
        isTemplate,
        mode,
    } = editorState;

    const auths = documentAuthMap[isTemplate ? 'template' : 'preplan'];

    const isReadOnly = !isTemplate || mode === 'view';

    useEffect(() => {
        if(!activeTreeNode && treeData.length) {
            dispatch(editorActions.setActiveTreeNode(treeData[0]));
        }
        handleExpandKeys(treeData);
    }, [JSON.stringify(treeData)]);

    const handleExpandKeys = (data) => {
        let parentKeys = [];
        function traverse(node) {
            if(node.children?.length > 0) {
                parentKeys.push(node.id);
                node.children.forEach(child => traverse(child))
            }
        }
        data.forEach(node => traverse(node));
        setExpandedKeys(parentKeys)
    };

    // 展开折叠
    const handleToggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    }

    const addCategory = (node=null) => {
        setNewIsTopLevel(node === null);
        setCurrentNode(node);
        form.resetFields();
        if(node) {
            form.setFieldValue("type", node.type);
        }
        setVisible(true);
    }

    const handleEdit = (node) => {
        setIsEditing(true);
        setCurrentNode(node);
        setEditingNode(node);
        form.setFieldsValue({
            type: node.type,
            name: node.title,
        });
        setVisible(true);
    }

    const handleOk = async() => {
        try{
            const values = await form.validateFields();
            values.type = 'common';
            const newLevel = currentNode ? currentNode.level + 1 : 1;
            const newParent = currentNode ? currentNode.id : null;
            if(isEditing) {
                values.type = editingNode.type || 'common';
                dispatch(
                    editorActions.updateTreeNode({
                        ...editingNode,
                        title: values.name,
                        type: values.type,
                        isTemplate,
                        treeType: 'prePlan'
                    })
                );
            } else {
                const newCategory = {
                    title: values.name,
                    level: newLevel,
                    parent: newParent,
                    type: values.type,
                    isTemplate,
                    relId: planId,
                    treeType: 'prePlan',
                    children: []
                };
                dispatch(editorActions.addTreeNodeAsync(newCategory));
            }
            setVisible(false);
            setIsEditing(false);
            setEditingNode(null);
        }catch(error) {
            console.log("validate failed", error);
        }
    };

    const handleDelete = (node) => {
        Modal.confirm({
            title: '确认删除',
            content: `确认删除目录【${node.title}】吗？`,
            okText: '删除',
            okType: 'danger',
            onOk: () => {
                new Promise(async(resolve, reject) => {
                    const result = await dispatch(editorActions.deleteTreeNode({
                        ...node,
                        isTemplate,
                        treeType: 'prePlan',
                    }));
                    if(result) {
                        resolve();
                    }
                    reject();
                })
            }
        })
    };

    const handleCancel = () => {
        setVisible(false);
        setIsEditing(false);
        setEditingNode(null);
    }

    const onTreeSelect = (selectedKeys, info) => {
        if(selectedKeys.length === 0 && info.selectedKeys?.length === 1) {
            return;
        }
        const selectedNode = findNodeByKey(treeData, selectedKeys[0]);
        dispatch(editorActions.setActiveTreeNode(selectedNode));
        if(selectedNode && onSelectNode) {
            onSelectNode(selectedNode)
        }
    }

    const renderTreeNodes = (data) => {
        return (data || []).map(item => (
            <TreeNode
                key={item.id}
                title={
                    <div className={styles.treeNodeContainer}>
                        <span className={styles.nodeTitle} title={item.title}>
                            {item.title}
                        </span>
                        {/* link 代表是场景要素生成的分类，只用于hash定位 */}
                        {(item.type !== 'link' && !isReadOnly) ? (
                            <span
                                className={`${styles.nodeActions} ${styles.nodeActionsHidden}`}
                            >
                                <Space>
                                    <AuthButton
                                        type="link"
                                        icon={<PlusOutlined />}
                                        permissions={auths.CatalogAdd}
                                        title="新增"
                                        onClick={() => addCategory(item)}
                                    />
                                 <AuthButton
                                        type="link"
                                        icon={<EditOutlined />}
                                        permissions={auths.CatalogEdit}
                                        title="编辑"
                                        onClick={() => handleEdit(item)}
                                    />
                                     <AuthButton
                                        type="link"
                                        icon={<DeleteOutlined />}
                                        permissions={auths.CatalogDelete}
                                        title="删除"
                                        onClick={() => handleDelete(item)}
                                    />
                                </Space>
                            </span>
                        ):("")}
                    </div>
                }
            >
                {renderTreeNodes(item.children)}
            </TreeNode>
        ))
    }

    return (
        <div
            className={`${styles.categoryTreeWrapper} ${isCollapsed ? styles.isCollapsed : ''}`}
        >
            <div className={styles.treeTop}>
                <div className={styles.left}>目录</div>
                <div className={styles.right}>
                    {
                        !isReadOnly ? (
                            <AuthButton
                                style={{cursor: 'pointer'}}
                                title="新增"
                                type="link"
                                permissions={auths.CatalogAdd}
                                onClick={() => addCategory()}
                            >
                                <PlusOutlined />
                            </AuthButton>
                        ) : ''
                    }
                </div>
            </div>
            <div className={styles.treeContent}>
                <Tree
                    defaultExpandAll
                    autoExpandParent
                    selectedKeys={[activeTreeNode?.id]}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                    onSelect={onTreeSelect}
                    onMouseEnter={(e)=>{
                        const container = e.event.target.closest(`.${styles.treeNodeContainer}`);
                        if(container) {
                            const actions = container.querySelector(`.${styles.nodeActions}`);
                            actions?.classList.remove(styles.nodeActionsHidden)
                        }
                    }}
                    onMouseLeave={(e) => {
                         const container = e.event.target.closest(`.${styles.treeNodeContainer}`);
                          if(container) {
                            const actions = container.querySelector(`.${styles.nodeActions}`);
                            // 延时隐藏，避免鼠标移动到按钮闪烁
                            setTimeout(() => {
                                actions?.classList.add(styles.nodeActionsHidden)
                            }, 100)
                        }
                    }}
                >
                    {renderTreeNodes(treeData)}
                </Tree>
            </div>
            <Button
                className={styles.collapseBtn}
                type='text'
                title={isCollapsed ? '展开' : '折叠'}
                onClick={handleToggleCollapse}
            >
                {isCollapsed ? <RightOutlined /> : <LeftOutlined />}
            </Button>
            <Modal
                title={
                    isEditing ? '编辑目录' : newIsTopLevel ? '新增目录' : '新增子目录'
                }
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="category-form"
                    layout="vertical"
                    autoComplete='off'
                >
                    <Form.Item
                        name="name"
                        label="目录名称"
                        rules={[
                            {required: true, message: '请输入目录名称'}
                        ]}
                    >
                        <Input placeholder='请输入' />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CategoryTree;