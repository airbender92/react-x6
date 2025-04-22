import React, { useState, useEffect, useRef } from 'react';
import { Tree, Progress, Input, Dialog, Button, Row, Col } from 'antd';
import domtoimage from 'dom-to-image';
import { VoBasic } from 'vue-orgchart';
import EmergencyOrg from './emergencyOrg/emergencyOrg';
import HatechBox from './hatechBox/hatechBox';
import 'vue-orgchart/dist/style.min.css';
import PrePlanManageService from '../../prePlanManage/service/prePlanManage';

const service = new PrePlanManageService();

const RadioDocument = ({ documentObject }) => {
    // 定义状态
    const [showCheckbox, setShowCheckbox] = useState(documentObject.showCheckbox);
    const [treeData, setTreeData] = useState([]);
    const [defaultProps] = useState({
        children: 'children',
        label: 'outlineName'
    });
    const [baseData, setBaseData] = useState({
        isBaseShow: !documentObject.id,
        isTreeShow: !!documentObject.id
    });
    const [editors, setEditors] = useState({
        display: 'block',
        data: []
    });
    const [emergencyOrgData, setEmergencyOrgData] = useState({
        dialogFormVisible: false,
        formWidth: '85%',
        title: '插入组织',
        outlineId: ''
    });
    const [orgTree, setOrgTree] = useState('');
    const [progress, setProgress] = useState(0);
    const planTreeRef = useRef(null);

    // 初始化计划树
    const initPlanTree = async () => {
        const res = await service.getPlanCatalog({
            resourceId: documentObject.id,
            resourceType: documentObject.resourceType
        });
        if (res && res.success) {
            setTreeData(res.data);
            if (planTreeRef.current) {
                planTreeRef.current.setCurrentKey(null);
            }
            if (res.data.length > 0) {
                setTimeout(() => {
                    if (planTreeRef.current) {
                        planTreeRef.current.setCurrentKey(null);
                    }
                }, 0);
            }
        }
    };

    // 获取所有内容
    const getAllContent = async (type = 'preplan') => {
        const interval = setInterval(() => {
            if (progress >= 80) {
                clearInterval(interval);
                return;
            }
            setProgress(prev => prev + 10);
        }, 200);

        let res;
        if (type === 'preplan') {
            res = await service.getPlanAllContent({
                resourceId: documentObject.id,
                resourceType: documentObject.resourceType
            });
        } else if (type === 'program') {
            res = await service.previewPlanContent({
                resourceId: documentObject.id,
                resourceType: documentObject.resourceType
            });
        }

        if (res && res.success) {
            setProgress(100);
            setEditors(prev => ({
                ...prev,
                data: res.data.map(item => ({
                    ...item,
                    titleShow: true,
                    contentShow: false
                }))
            }));

            for (const v of res.data) {
                if (v.outlineType === 1) {
                    setEmergencyOrgData(prev => ({
                        ...prev,
                        outlineId: v.id
                    }));
                    getOrgData(v);
                } else if (v.outlineType === 2) {
                    setEmergencyOrgData(prev => ({
                        ...prev,
                        outlineId: v.id
                    }));
                    const response = await service.getPlanSceneData({ id: v.id });
                    if (response && response.success) {
                        setEditors(prev => ({
                            ...prev,
                            data: prev.data.map(item =>
                                item.id === v.id ? { ...item, sceneInfo: response.data } : item
                            )
                        }));
                        setTimeout(() => {
                            if (response.data) insertImgToscene(response.data, v.contentId);
                        }, 0);
                    }
                }
            }
        }
    };

    // 插入图片到场景
    const insertImgToscene = (data, contentId) => {
        setTimeout(() => {
            const img = new Image();
            img.src = data.picture;
            img.id = 'imgscene';
            const sceneImg = document.getElementsByClassName(`scene-radio-img${contentId}`)[0];
            if (sceneImg) {
                sceneImg.innerHTML = '';
                sceneImg.appendChild(img);
            }
        }, 500);
    };

    // 获取组织数据
    const getOrgData = async (value) => {
        const res = await service.getPlanOrgData({ outlineId: value.id, sort: 'asc' });
        if (res && res.success) {
            setEditors(prev => ({
                ...prev,
                data: prev.data.map(item =>
                    item.id === value.id ? { ...item, ds: res.data[0] } : item
                )
            }));
            setTimeout(() => {
                orgTOImage(value.id);
            }, 0);
        }
    };

    // 鼠标左键点击树节点
    const mouseLeft = (zobj, znode) => {
        const returnEle = document.getElementById(`content${zobj.id}`);
        if (returnEle) {
            returnEle.scrollIntoView(true);
        }
        if (znode) {
            if (znode.data.status) {
                znode.data.status = false;
                if (planTreeRef.current) {
                    planTreeRef.current.setCurrentKey(null);
                }
            } else {
                znode.data.status = true;
                setTimeout(() => {
                    if (znode.$el) {
                        znode.$el.classList.add('is-current');
                    }
                }, 0);
            }
        }
    };

    // 树节点选中事件
    const treeClick = (data, choose) => {
        const { checkedKeys, halfCheckedKeys } = choose;
        const allChecked = checkedKeys.concat(halfCheckedKeys);
        // 这里可添加 handleOutlineTreeData 等方法的实现
    };

    // 组织转换为图片
    const orgTOImage = (id) => {
        setTimeout(() => {
            const titles = document.querySelectorAll('#chart-container .title');
            titles.forEach(title => {
                const arr = title.innerText.split('');
                let text = '';
                arr.forEach(v => {
                    text += `<span class="node_text">${v}</span>`;
                });
                title.innerHTML = text;
            });

            const node = document.getElementsByClassName('organization-radio-image')[0];
            if (node) {
                domtoimage.toPng(node, { bgcolor: 'rgba(255,255,255,0)' }).then((dataUrl) => {
                    const img = new Image();
                    img.src = dataUrl;
                    img.id = 'imgorg';
                    const radioPicture = document.querySelector('.vo-basic');
                    if (radioPicture) {
                        radioPicture.innerHTML = '';
                        radioPicture.appendChild(img);
                        radioPicture.id = 'chart-container1';
                        getTableOrg(id);
                    }
                }).catch((error) => {
                    console.error('oops, something went wrong!', error);
                });
            }
        }, 800);
    };

    // 获取组织表格数据
    const getTableOrg = async (id) => {
        const response = await service.getPlanTableOrg({ outlineId: id });
        if (response && response.success) {
            let duty;
            const { data } = response.data;
            const table = document.createElement('table');
            table.id = 'org_table';
            table.style.cssText = 'border-collapse:collapse;border:1px solid #000';
            let str = '';
            str += '<tr>';
            str += '<th>姓名</th>';
            str += '<th>所属应急组</th>';
            str += '<th>所属组织</th>';
            str += '<th>手机号码</th>';
            str += '<th>角色</th>';
            str += '<th>职责</th>';
            str += '</tr>';
            data.forEach(v => {
                str += '<tr>';
                str += `<td>${v.userName}</td>`;
                str += `<td>${v.groupName}</td>`;
                str += `<td>${v.department}</td>`;
                str += `<td>${v.phone}</td>`;
                if (v.duty === 0) {
                    duty = '成员';
                } else if (v.duty === 1) {
                    duty = '组长';
                } else {
                    duty = '副组长';
                }
                str += `<td>${duty}</td>`;
                str += '</tr>';
            });
            table.innerHTML = str;
            const voBasic = document.querySelector('.vo-basic');
            if (voBasic) {
                voBasic.appendChild(table);
            }
        }
    };

    // 获取组织树数据
    const getOrgTree = (msg) => {
        setOrgTree(msg);
    };

    // 确定插入组织
    const insertOrgSure = () => {
        setEmergencyOrgData(prev => ({
            ...prev,
            dialogFormVisible: false
        }));
    };

    useEffect(() => {
        if (documentObject.id) {
            initPlanTree();
            getAllContent();
        }
    }, [documentObject.id]);

    return (
        <div id="dialogdocumentEdit" className="hatech-bcms">
            <div className="hatech-panel hatech-edit" style={{ height: '500px' }}>
                <Row>
                    <Col span={6}>
                        <div 
                            className={`hatech-panel-item hatech-cell-3 ${baseData.isBaseShow ? 'formBgc' : 'cataBgc'}`}>
                            <HatechBox title={false}>
                                <div className="hatech-header-left-slot">
                                    <span className="title-menu" title="目录大纲">目录大纲</span>
                                </div>
                                <div 
                                    className={`hatech-content ${baseData.isBaseShow ? 'formBgc' : 'cataBgc'}`}>
                                    <div className="hatech-panel-item-body">
                                        <Tree
                                            ref={planTreeRef}
                                            className="filter-tree"
                                            data={treeData}
                                            props={defaultProps}
                                            defaultExpandAll
                                            showCheckbox={showCheckbox}
                                            nodeKey="id"
                                            expandOnClickNode={false}
                                            highlightCurrent
                                            onNodeClick={mouseLeft}
                                            onCheck={treeClick}
                                        >
                                            {({ node }) => (
                                                <span className="span-ellipsis" title={node.label}>{node.label}</span>
                                            )}
                                        </Tree>
                                    </div>
                                </div>
                            </HatechBox>
                        </div>
                    </Col>
                    <Col span={18}>
                        <div className="hatech-panel-item hatech-cell-9">
                            <HatechBox title="文档内容">
                                <div className="hatech-content" id="hatech-content">
                                    {progress !== 100 && progress !== 0 && documentObject.id && (
                                        <div className="el-loading-mask">
                                            <div className="el-loading-spinner">
                                                <Progress
                                                    textInside
                                                    showInfo={false}
                                                    strokeWidth={10}
                                                    percent={progress}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="hatech-panel-item-body">
                                        <div className="hatech-edit-item">
                                            {editors.data.map((item, key) => (
                                                <div key={key} className="hatech-edit-content" id={`content${item.id}`}>
                                                    <div>
                                                        {item.titleShow && item.isShowOutline === 0 && (
                                                            <div className="content-title"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: `<h${item.outlineLevel + 1}>${item.outlineName}</h${item.outlineLevel + 1}>`
                                                                }}
                                                            />
                                                        )}
                                                        {!item.titleShow && (
                                                            <div className="content-title-input">
                                                                <Input
                                                                    id={`title${item.id}`}
                                                                    value={item.num}
                                                                    onChange={(e) => {
                                                                        setEditors(prev => ({
                                                                            ...prev,
                                                                            data: prev.data.map(i =>
                                                                                i.id === item.id ? { ...i, num: e.target.value } : i
                                                                            )
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        <ul className="content" dangerouslySetInnerHTML={{ __html: item.content }} />
                                                        <ul id={`editor${item.id}`} className="editContent" />
                                                    </div>
                                                    {item.outlineType === 2 && (
                                                        <div className="scene-image">
                                                            {item.sceneInfo ? (
                                                                <div className={`scene-radio-img${item.contentId}`} />
                                                            ) : (
                                                                <div className="el-tree__empty-block" style={{ border: '1px dashed #ccc' }}>
                                                                    <span className="el-tree__empty-text">暂无数据</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {item.outlineType === 1 && (
                                                        <div className="organization-radio-image">
                                                            {item.ds ? (
                                                                <VoBasic
                                                                    chartClass="thedialogOrgImg"
                                                                    data={item.ds}
                                                                    draggable
                                                                    direction="l2r"
                                                                />
                                                            ) : (
                                                                <div className="el-tree__empty-block" style={{ border: '1px dashed #ccc' }}>
                                                                    <span className="el-tree__empty-text">暂无数据</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </HatechBox>
                        </div>
                    </Col>
                </Row>
            </div>
            {/* 组织弹框 */}
            <Dialog
                closeOnClickModal={false}
                className="hatech-dialog-nodeInfo hatech-dialog-common org-dialog"
                title={emergencyOrgData.title}
                visible={emergencyOrgData.dialogFormVisible}
                width={emergencyOrgData.formWidth}
                onClose={insertOrgSure}
            >
                <EmergencyOrg outlineId={emergencyOrgData.outlineId} onRadioOrgTree={getOrgTree} />
                <div className="dialog-footer">
                    <Button type="primary" onClick={insertOrgSure}>确 定</Button>
                </div>
            </Dialog>
        </div>
    );
};

export default RadioDocument;
