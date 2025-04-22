import React, { useState, useEffect, useRef } from 'react';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElCascader, ElLink, ElDialog } from 'element-react';
import 'element-theme-default';
import utils from '@/utils/utils';
import { useRouter } from '@hatech/core';
import BaseOrg from '../org/org';
import DrillProgramForm from '@/modules/drillProgram/components/index';
import KeyElement from './Yaosu';
import PrePlanManageService from '../../../prePlanManage/service/prePlanManage';

const service = new PrePlanManageService();
const transfer = utils.transfer;

const BasicInfo = ({ drawerShow, basicData, keyElementData, formDataInfo }) => {
    const [form, setForm] = useState({
        name: 'basicInfo',
        rules: {
            name: [
                { required: true, message: `${basicData?.formLable?.name}不能为空`, trigger: 'change' }
            ],
            version: [
                { required: true, message: '版本号不能为空', trigger: 'change' },
                { validator: utils.string.validateVersionStr, trigger: 'change' }
            ],
            templateType: [
                { required: true, message: `${basicData?.formLable?.templateType}不能为空`, trigger: 'change' }
            ],
            description: {
                required: false,
                trigger: 'change',
                validator: utils.string.validateContent
            },
            classificationId: [
                {
                    required: true,
                    trigger: 'change',
                    validator: (rule, value, callback) => {
                        if (!value) { callback(new Error(`${basicData?.formLable?.classificationId}不能为空`)); }
                        if (['0', '1', '-1'].includes(value)) {
                            callback(new Error('根节点无法新增'));
                        }
                        callback();
                    }
                }
            ]
        },
        planOptions: [],
        data: basicData?.formData || {}
    });
    const [approveProcessOption, setApproveProcessOption] = useState([]);
    const [addWriterDialog, setAddWriterDialog] = useState({
        dialog: {
            width: '50%',
            title: '新增编写人',
            'close-on-click-modal': false,
            'close-on-press-escape': false,
            'destroy-on-close': true
        },
        footer: {
            row: {
                type: 'flex',
                gutter: 20,
                justify: 'end'
            },
            options: [
                {
                    show: true,
                    name: '取消',
                    event: 'onModalCancel',
                },
                {
                    show: true,
                    name: '保存',
                    event: 'groupAddUserSure',
                    button: { type: 'primary' }
                }
            ]
        }
    });
    const [userParams, setUserParams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvalName, setApprovalName] = useState('');
    const planProps = {
        multiple: false,
        emitPath: false,
        checkStrictly: true,
        label: 'classificationName',
        children: 'children',
        value: 'id'
    };
    const templateTypeOption = [
        { value: 0, name: '预案模板' },
        { value: 1, name: '演练方案模板' },
        { value: 2, name: '演练评估模板' },
        { value: 3, name: '演练报告模板' },
        { value: 4, name: '应急报告模板' },
        { value: 6, name: '攻防演练报告模板' }
    ];
    const formRef = useRef(null);
    const addWriterDialogRef = useRef(null);
    const orgRef = useRef(null);

    const init = () => {
        if (basicData?.resourceTypeEnum === 2) {
            // this.fetchDrillBasicInfo()
        } else if (basicData && [3, 4].includes(basicData.resourceTypeEnum)) {
            // this.getKeyElement()
            setLoading(false);
        } else {
            getAllDrillProcess();
            getRoleList();
        }
    };

    const gotoDetail = (data) => {
        const approveMsg = {
            processInstanceId: formDataInfo?.workflowInstanceId,
            id: formDataInfo?.workflowModelId
        };
        localStorage.setItem('approveProgressMsg', JSON.stringify(approveMsg));
        const routeData = useRouter().resolve({
            name: 'ProcessFormPage',
            query: approveMsg
        });
        window.open(routeData.href, '_blank');
    };

    const onEvent = (avgs) => {
        const { params, event } = avgs;
        if (typeof this[event] === 'function') {
            this[event](params);
        }
    };

    const filterInput = (data) => {
        return data.replace(/\s+/g, '');
    };

    const getBasicInfo = (id) => {
        const userinfo = { id: 'user-id' }; // 假设从 store 中获取
        service.getPrePlanById({ id }).then((response) => {
            if (response.status === 200) {
                const { data } = response.data;
                data[basicData?.formProps?.writers].map((v) => {
                    v.currUser = v.userId === userinfo.id;
                });
                setForm((prevForm) => ({
                    ...prevForm,
                    data: {
                        id: data.id,
                        [basicData?.formProps?.status]: data[basicData?.formProps?.status],
                        [basicData?.formProps?.name]: data[basicData?.formProps?.name],
                        [basicData?.formProps?.type]: data[basicData?.formProps?.type],
                        [basicData?.formProps?.templateType]: data[basicData?.formProps?.templateType],
                        [basicData?.formProps?.description]: data[basicData?.formProps?.description],
                        [basicData?.formProps?.classificationId]: data[basicData?.formProps?.classificationId],
                        [basicData?.formProps?.classificationName]: data[basicData?.formProps?.classificationName],
                        [basicData?.formProps?.approvalId]: data[basicData?.formProps?.approvalId],
                        [basicData?.formProps?.writers]: data[basicData?.formProps?.writers],
                        [basicData?.formProps?.version]: data[basicData?.formProps?.version],
                        [basicData?.formProps?.opinion]: data[basicData?.formProps?.opinion],
                        [basicData?.formProps?.rejectTime]: data[basicData?.formProps?.rejectTime],
                        [basicData?.formProps?.rejectUserName]: data[basicData?.formProps?.rejectUserName],
                        [basicData?.formProps?.templateId]: data[basicData?.formProps?.templateId],
                        classificationId: data.classificationId ? data.classificationId : null
                    }
                }));
                approvalFilter(data[basicData?.formProps?.approvalId]);
                // 模拟 emit 事件
                console.log('translateBaseInfo event emitted', form.data);
            }
        });
    };

    const getAllDrillProcess = async () => {
        setApproveProcessOption([]);
        const res = await service.getApprovalList({ approvalType: '1', status: '1' });
        setLoading(false);
        setApproveProcessOption([{ modelId: '', name: '无需审批' }, ...res.data]);
        if (basicData?.id) {
            getBasicInfo(basicData.id);
        }
    };

    const addWriters = () => {
        if (addWriterDialogRef.current) {
            addWriterDialogRef.current.show();
        }
    };

    const deleteUser = (index) => {
        setForm((prevForm) => {
            const newWriters = [...prevForm.data[basicData?.formProps?.writers]];
            newWriters.splice(index, 1);
            return {
                ...prevForm,
                data: {
                    ...prevForm.data,
                    [basicData?.formProps?.writers]: newWriters
                }
            };
        });
    };

    const onModalCancel = () => {
        if (addWriterDialogRef.current) {
            addWriterDialogRef.current.close();
        }
    };

    const groupAddUserSure = () => {
        const selectedRows = orgRef.current?.$refs.orgRef?.eventList.getSelectedRows();
        if (selectedRows) {
            setUserParams(selectedRows);
            const alreadyHas = selectedRows.filter((item) => form.data[basicData?.formProps?.writers].some((e) => e.userId === item.id));
            if (alreadyHas.length > 0) {
                console.error(`操作失败，${alreadyHas[0].name}已存在`);
                return;
            }
            setForm((prevForm) => {
                const newWriters = [...prevForm.data[basicData?.formProps?.writers]];
                selectedRows.forEach((v) => {
                    newWriters.push({
                        userId: v.id,
                        userName: v.name
                    });
                });
                return {
                    ...prevForm,
                    data: {
                        ...prevForm.data,
                        [basicData?.formProps?.writers]: newWriters
                    }
                };
            });
            if (addWriterDialogRef.current) {
                addWriterDialogRef.current.close();
            }
        }
    };

    const approvalFilter = (id) => {
        for (const v of approveProcessOption) {
            if (v.modelId === id) {
                setApprovalName(v.name);
                break;
            }
        }
    };

    const basicInfoCancel = () => {
        // 模拟 emit 事件
        console.log('handleCloseBasicInfo event emitted');
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.resetFields();
                formRef.current.clearValidate();
            }
        }, 200);
    };

    const basicInfoSave = transfer.throttle(() => {
        if (formRef.current) {
            formRef.current.validate((valid) => {
                if (!valid) return false;
                let newParam = {};
                if (basicData?.resourceType === 1) {
                    newParam = {
                        approvalId: form.data.approvalId,
                        classificationId: form.data.classificationId,
                        id: form.data.id,
                        description: form.data.description,
                        name: form.data.name,
                        version: form.data.version,
                        writers: form.data.writers,
                        editSave: '1'
                    };
                }
                if (basicData?.resourceType === 0) {
                    newParam = {
                        id: form.data.id,
                        name: form.data.name,
                        type: form.data.type,
                        templateType: form.data.templateType,
                        templateId: form.data.templateId,
                        description: form.data.description,
                        writers: form.data.writers,
                        editSave: '1'
                    };
                }
                service.savePrePlan(basicData?.saveUrl, newParam).then((response) => {
                    const { data, msg, code } = response.data;
                    if (code === 200) {
                        console.log('保存成功', msg);
                        getBasicInfo(basicData.id);
                        // 模拟 emit 事件
                        console.log('updateDocumentName event emitted');
                    } else {
                        console.error('保存失败', msg);
                    }
                });
            });
        }
    }, 3000);

    const getRoleList = async () => {
        const res = await service.getTreeData({ status: '' });
        if (res.success) {
            setForm((prevForm) => ({
                ...prevForm,
                planOptions: res.data
            }));
            addIsShow(res.data);
        }
    };

    const addIsShow = (arr) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i].is_show = false;
            if (arr[i].children && arr[i].children.length > 0) {
                addIsShow(arr[i].children);
            } else {
                arr[i].children = '';
            }
        }
    };

    const fetchDrillBasicInfo = async () => {
        const res = await service.getPrePlanById({ id: basicData?.id });
        if (res && res.success) {
            const { data } = res;
            setForm((prevForm) => ({
                ...prevForm,
                data: {
                    id: data.id,
                    [basicData?.formProps?.name]: data[basicData?.formProps?.name],
                    [basicData?.formProps?.drillPlanId]: data[basicData?.formProps?.drillPlanId]
                }
            }));
            // 模拟 emit 事件
            console.log('translateBaseInfo event emitted', form.data);
        }
    };

    const emitEvent = (params) => {
        setLoading(false);
        // 模拟 emit 事件
        console.log(params.eventName, params.params);
    };

    useEffect(() => {
        init();
    }, [drawerShow]);

    return (
        <div id="basicInfo" style={{ display: loading ? 'none' : 'block' }}>
            {basicData?.resourceTypeEnum === 2 && (
                <DrillProgramForm basicData={basicData} onEmitEvent={emitEvent} />
            )}
            {basicData && [3, 4].includes(basicData.resourceTypeEnum) && (
                <KeyElement basicData={basicData} keyElementData={keyElementData} />
            )}
            {!(basicData?.resourceTypeEnum === 2 || [3, 4].includes(basicData?.resourceTypeEnum)) && (
                <ElForm
                    ref={formRef}
                    model={form.data}
                    rules={form.rules}
                    label-width="auto"
                    label-suffix="："
                    onSubmit={(e) => e.preventDefault()}
                >
                    {basicData?.resourceType !== 0 && form.data[basicData?.formProps?.opinion] && form.data[basicData?.formProps?.opinion] !== '' && (
                        <>
                            <ElFormItem label="驳回意见">
                                <div className="info-text danger opinion">{form.data[basicData?.formProps?.opinion]}</div>
                            </ElFormItem>
                            <ElFormItem label="驳回人">
                                <div className="info-text danger">{form.data[basicData?.formProps?.rejectUserName]}</div>
                            </ElFormItem>
                            <ElFormItem label="驳回时间">
                                <div className="info-text danger">{form.data[basicData?.formProps?.rejectTime]}</div>
                            </ElFormItem>
                        </>
                    )}
                    <ElFormItem
                        label={`${basicData?.formLable?.name}`}
                        prop={basicData?.type != 'detail' ? basicData?.formProps?.name : ''}
                    >
                        {basicData?.type != 'detail' ? (
                            <ElInput
                                v-model={form.data[basicData?.formProps?.name]}
                                onInput={(e) => {
                                    setForm((prevForm) => ({
                                        ...prevForm,
                                        data: {
                                            ...prevForm.data,
                                            [basicData?.formProps?.name]: filterInput(e.target.value)
                                        }
                                    }));
                                }}
                                autocomplete="off"
                                maxlength="100"
                                minlength="0"
                                show-word-limit
                                placeholder={`请输入${basicData?.formLable?.name}，最长100个字`}
                            />
                        ) : (
                            <div className="info-text">{form.data[basicData?.formProps?.name]}</div>
                        )}
                    </ElFormItem>
                    {basicData?.resourceType === 0 && (
                        <ElFormItem
                            label={`${basicData?.formLable?.templateType}`}
                            prop={basicData?.type != 'detail' ? basicData?.formProps?.templateType : ''}
                        >
                            {basicData?.type != 'detail' ? (
                                <ElSelect
                                    filterable
                                    popperAppendToBody={false}
                                    disabled
                                    v-model={form.data[basicData?.formProps?.templateType]}
                                    placeholder={`请选择${basicData?.formLable?.templateType}`}
                                >
                                    {templateTypeOption.map((item, index) => (
                                        <ElOption key={index} label={item.name} value={item.value} />
                                    ))}
                                </ElSelect>
                            ) : (
                                <div className="info-text opinion">
                                    {templateTypeOption.find(v => v.value === form.data[basicData?.formProps?.templateType])?.name || ''}
                                </div>
                            )}
                        </ElFormItem>
                    )}
                    {[0, 1].includes(basicData?.resourceType) && (
                        <ElFormItem
                            label={`${basicData?.formLable?.description}`}
                            prop={basicData?.type != 'detail' ? basicData?.formProps?.description : ''}
                        >
                            {basicData?.type != 'detail' ? (
                                <ElInput
                                    type="textarea"
                                    rows="5"
                                    v-model={form.data[basicData?.formProps?.description]}
                                    autocomplete="off"
                                    maxlength="500"
                                    minlength="0"
                                    show-word-limit
                                    placeholder={`请输入${basicData?.formLable?.description}，最长500个字`}
                                />
                            ) : (
                                <div className="info-text opinion">{form.data[basicData?.formProps?.description]}</div>
                            )}
                        </ElFormItem>
                    )}
                    {basicData?.resourceType === 1 && (
                        <ElFormItem
                            label={`${basicData?.formLable?.classificationId}`}
                            prop={basicData?.type != 'detail' ? basicData?.formProps?.classificationId : ''}
                        >
                            {basicData?.type != 'detail' ? (
                                <ElCascader
                                    filterable
                                    clearable
                                    v-model={form.data[basicData?.formProps?.classificationId]}
                                    options={form.planOptions}
                                    placeholder={`请输入${basicData?.formLable?.classificationId}`}
                                    props={planProps}
                                    show-all-levels
                                >
                                    {({ node, data }) => (
                                        <div className="cascader-node" title={data.classificationName}>{data.classificationName}</div>
                                    )}
                                </ElCascader>
                            ) : (
                                <div className="info-text">{form.data[basicData?.formProps?.classificationName]}</div>
                            )}
                        </ElFormItem>
                    )}
                    {[0, 1].includes(basicData?.resourceType) && (
                        <ElFormItem label="编写人" prop="" className="has-no-margin-bottom">
                            <div className="writers">
                                {form.data[basicData?.formProps?.writers]?.map((item, index) => (
                                    <div key={index} className="theWriter">
                                        {basicData?.type !== 'detail' && !item.currUser && (
                                            <span className="deleteWriter" onClick={() => deleteUser(index)}>
                                                <i className="el-icon-remove"></i>
                                            </span>
                                        )}
                                        <span className="writer-icon">
                                            <div className="ha-icon-user"></div>
                                        </span>
                                        <span className="writer-name" title={item.userName}>{item.userName}</span>
                                    </div>
                                ))}
                                {basicData?.type !== 'detail' && (
                                    <div className="theWriter plusWriter" onClick={addWriters}>
                                        <span className="writer-icon">
                                            <div className="ha-icon-add"></div>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </ElFormItem>
                    )}
                    {basicData?.resourceType === 1 && (
                        <ElFormItem
                            label="版本号"
                            prop={basicData?.type !== 'detail' ? basicData?.formProps?.version : ''}
                        >
                            {basicData?.type !== 'detail' ? (
                                <ElInput
                                    v-model={form.data[basicData?.formProps?.version]}
                                    onInput={(e) => {
                                        setForm((prevForm) => ({
                                            ...prevForm,
                                            data: {
                                                ...prevForm.data,
                                                [basicData?.formProps?.version]: filterInput(e.target.value)
                                            }
                                        }));
                                    }}
                                    placeholder="请输入版本号（如 1.0）"
                                    maxlength="5"
                                    show-word-limit
                                >
                                    <template slot="prepend">V</template>
                                </ElInput>
                            ) : (
                                <div className="info-text">{form.data[basicData?.formProps?.version]}</div>
                            )}
                        </ElFormItem>
                    )}
                    {[1, 2].includes(basicData?.resourceType) && (
                        <ElFormItem
                            label="审批流程"
                            prop={basicData?.type !== 'detail' ? basicData?.formProps?.approvalId : ''}
                        >
                            {basicData?.type !== 'detail' ? (
                                <ElSelect
                                    filterable
                                    popperAppendToBody={false}
                                    v-model={form.data[basicData?.formProps?.approvalId]}
                                    placeholder="请选择审批流程"
                                >
                                    {approveProcessOption.map((item, index) => (
                                        <ElOption key={index} label={item.name} value={item.modelId} />
                                    ))}
                                </ElSelect>
                            ) : (
                                <>
                                    {[1].includes(form.data.status) ? (
                                        <ElLink className="link-style" type="primary" onClick={() => gotoDetail(form.data)}>
                                            {approvalName || '无'}
                                        </ElLink>
                                    ) : (
                                        <div className="info-text">{approvalName || '无'}</div>
                                    )}
                                </>
                            )}
                        </ElFormItem>
                    )}
                    {basicData?.type !== 'detail' && (
                        <ElFormItem className="footer-btngroup">
                            <ElButton onClick={basicInfoCancel}>取消</ElButton>
                            <ElButton type="primary" onClick={basicInfoSave}>保存</ElButton>
                        </ElFormItem>
                    )}
                </ElForm>
            )}
            <ElDialog
                ref={addWriterDialogRef}
                title={addWriterDialog.dialog.title}
                width={addWriterDialog.dialog.width}
                closeOnClickModal={addWriterDialog.dialog['close-on-click-modal']}
                closeOnPressEscape={addWriterDialog.dialog['close-on-press-escape']}
                destroyOnClose={addWriterDialog.dialog['destroy-on-close']}
            >
                <BaseOrg ref={orgRef} />
                <div slot="footer" className="dialog-footer">
                    {addWriterDialog.footer.options.map((option, index) => (
                        <ElButton
                            key={index}
                            type={option.button?.type}
                            onClick={() => {
                                if (option.event === 'onModalCancel') {
                                    onModalCancel();
                                } else if (option.event === 'groupAddUserSure') {
                                    groupAddUserSure();
                                }
                            }}
                        >
                            {option.name}
                        </ElButton>
                    ))}
                </div>
            </ElDialog>
        </div>
    );
};

export default BasicInfo;