import React, { useState, useEffect, useRef } from 'react';
import {
  Tree,
  Table,
  Dialog,
  Form,
  Input,
  Select,
  Button,
  Radio,
  message,
  Popconfirm
} from 'antd';
import utils from '@/utils/utils/index';
import { getMenuPaths, arrDeepSet } from '@/utils';
import HatechTable from '../hatechTable/hatechTable';
import hatechBox from '../hatechBox/hatechBox';
import HatechDialog from '../hatechDialog/hatechDialog';
import org from '../org/org';
import SceneManagement from '../../../sceneManagement/service/sceneManagement';
import PrePlanManageService from '../../../prePlanManage/service/prePlanManage';

const prePlanservice = new PrePlanManageService();
const sceneManagementService = new SceneManagement();
// 获取当前的租户id
const tenantId = JSON.parse(utils.storage.GetForSession('userinfo'))
  ? JSON.parse(utils.storage.GetForSession('userinfo')).tenantId
  : '';

const EmergencyOrg = ({ outlineId = '' }) => {
  const [table, setTable] = useState({
    title: '用户列表',
    id: 'emergencyOrg',
    url: 'getPlanGroupUser',
    showCellUrl: 'fetchTableColumns',
    dropCellUrl: 'updateTableColumns',
    page: 1,
    limit: 10,
    pageSize: [10, 20, 50, 100],
    isIndexShow: false,
    data: [],
    select: [],
    sort: {},
    selectMore: true,
    count: 0,
    mySlot: true,
    handInit: false,
    search: {
      userId: '',
      roleId: '',
      groupId: '',
      outlineId: ''
    },
    column: [
      { label: '姓名', prop: 'userName', width: 'auto', isHide: true, alignLeft: 'left' },
      { label: '用户账号', prop: 'userCode', width: 'auto', isHide: true, alignLeft: 'left' },
      { label: '手机号码', prop: 'phone', width: 'auto', isHide: true, alignLeft: 'left' },
      {
        label: '职责',
        prop: 'duty',
        width: 'auto',
        isHide: true,
        alignLeft: 'left',
        formatter: { 0: '<span>成员</span>', 2: '<span>副组长</span>', 1: '<span>组长</span>' }
      }
    ],
    showHeaderOption: true,
    headerOption: [
      { name: '新增', icon: 'add', type: 'add', isShow: true },
      { name: '新增职责', icon: 'zhize', type: 'setUpDuty', isShow: true },
      { name: '批量删除', icon: 'shanchu', type: 'delete', isShow: true }
    ],
    showTableOption: true,
    cellOptionWidth: 150,
    cellOption: [
      { name: '删除', icon: 'shanchu', type: 'delete', isShow: true }
    ]
  });
  const [form, setForm] = useState({
    name: 'userForm',
    title: '新增用户',
    top: '10vh',
    formWidth: '30%',
    submit: 'formSubmit',
    dialogFormVisible: false,
    disabled: false,
    isBtnShow: true,
    appendToBody: true,
    rules: {
      name: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('姓名不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ],
      username: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('用户账号不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ],
      groupId: [
        { required: true, message: '所属组织不能为空', trigger: 'change' }
      ],
      orderInfo: [
        { required: true, message: '成员编号不能为空', trigger: 'change' },
        { validator: (rule, value, callback) => {
          // 自定义验证逻辑
          callback();
        }, trigger: 'change' }
      ],
      mobilePhone: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('手机号码不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ],
      email: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('电子邮箱不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ],
      emergencyContact: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('紧急联系人不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ],
      emergencyMobile: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('紧急联系人电话不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ]
    },
    data: {
      name: '',
      username: '',
      mobilePhone: '',
      email: '',
      roleIds: [],
      emergencyContact: '',
      emergencyMobile: '',
      groupId: '',
      orderInfo: ''
    },
    formOption: [
      { name: '确定', fun: 'formSubmit', type: 'primary', isShow: true }
    ]
  });
  const [treeData, setTreeData] = useState([]);
  const [defaultProps] = useState({
    children: 'children',
    title: 'groupName'
  });
  const [editNode, setEditNode] = useState({
    title: '组织编辑',
    name: 'editNode',
    dialogType: false,
    level: 0,
    rules: {
      groupName: [
        { required: true, validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('组织名称不能为空'));
          } else {
            callback();
          }
        }, trigger: 'change' }
      ],
      parentId: [
        { required: true, message: '上级组织不能为空', trigger: 'change' }
      ]
    },
    top: '10vh',
    formWidth: '40%',
    dialogFormVisible: false,
    contdisabled: false,
    data: {
      groupName: '',
      outlineId: '',
      parentId: null
    }
  });
  const [classifyProps] = useState({
    multiple: false,
    emitPath: false,
    checkStrictly: true,
    label: 'name',
    children: 'children',
    value: 'id'
  });
  const [orgData, setOrgData] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '85%',
    title: '新增应急架构用户',
    groupId: '',
    outlineId: ''
  });
  const [dutyDialog, setDutyDialog] = useState({
    dialogFormVisible: false,
    title: '设置职责',
    top: '10vh',
    formWidth: '30%',
    data: {
      duty: '0',
      groupId: '',
      id: ''
    },
    dutyRadios: [
      { label: '0', name: '成员' },
      { label: '2', name: '副组长' },
      { label: '1', name: '组长' }
    ]
  });
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currLevel, setCurrLevel] = useState('');
  const [checkedTreeLevel, setCheckedTreeLevel] = useState('');
  const [roleList, setRoleList] = useState([]);
  const treeRef = useRef(null);
  const hatechTableRef = useRef(null);
  const editNodeFormRef = useRef(null);
  const parentIdRef = useRef(null);

  useEffect(() => {
    getResourceTree();
    getRoleList();
    getSearchConfig();
  }, []);

  useEffect(() => {
    if (!form.dialogFormVisible) {
      switchFormRulesType(true);
    }
  }, [form.dialogFormVisible]);

  const getSearchConfig = async () => {
    const response = await sceneManagementService.GetLeaderList();
    if (response && response.success) {
      setUserList(response.data);
    } else {
      setUserList([]);
    }
  };

  const getRoleList = () => {
    prePlanservice.getRoleList({ tenantId }).then((res) => {
      if (res.success) {
        setRoleList([...roleList, res.data]);
        addIsShow([res.data]);
      }
    });
  };

  const getResourceTree = (currentNode) => {
    prePlanservice.getPlanOrgData({ outlineId, sort: 'asc' }).then((res) => {
      if (res.success) {
        const newTreeData = res.data;
        addIsShow(newTreeData);
        setTreeData(newTreeData);
        if (treeRef.current) {
          treeRef.current.setSelectedKeys([]);
        }
        if (newTreeData.length > 0) {
          const defaultKey = currentNode ? currentNode.id : newTreeData[0].id;
          if (treeRef.current) {
            treeRef.current.setSelectedKeys([defaultKey]);
            const node = treeRef.current.getNode(defaultKey);
            if (node) {
              mouseLeft(node);
            }
          }
        }
      }
    }).catch(() => {});
  };

  const normalizer = (node) => {
    return {
      id: node.id,
      title: node.name,
      children: node.children
    };
  };

  const addIsShow = (arr, level = 1) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i].is_show = false;
      arr[i].level = level;
      if (arr[i].children && arr[i].children.length > 0) {
        addIsShow(arr[i].children, level + 1);
      } else {
        arr[i].children = undefined;
      }
    }
  };

  const nodeClick = (type) => {
    const data = treeRef.current?.getSelectedNodes()[0];
    if (!data) {
      message.warning('请先选择要操作的组织');
      return;
    }
    let currentNode;
    if (treeRef.current?.getSelectedKeys()[0]) {
      currentNode = treeRef.current.getNode(treeRef.current.getSelectedKeys()[0]);
    }
    switch (type) {
      case 1:
        if (data.level >= 8) {
          message.warning('大于8级无法新增');
          return;
        }
        setEditNode((prev) => ({
          ...prev,
          dialogType: false,
          data: { ...prev.data, groupName: '', parentId: currentNode?.data.id },
          dialogFormVisible: true,
          title: '新增应急组织'
        }));
        setCurrLevel('');
        break;
      case 2:
        setEditNode((prev) => ({
          ...prev,
          dialogType: true,
          dialogFormVisible: true,
          title: '编辑应急组织',
          data: {
            ...prev.data,
            groupName: data.groupName,
            parentId: currentNode?.parent?.data?.id || currentNode?.data.id,
            rootNode: currentNode?.data.parentId === '0'
          },
          level: currentNode?.level || 0
        }));
        setCurrLevel('');
        let id = currentNode?.data.id;
        getMenuPaths(id, treeData, 'id', (item) => {
          arrDeepSet(item, 'disabled', true);
        });
        break;
      case 3:
        if (currentNode?.level === 1) {
          message.warning('根组织不能删除');
          return;
        }
        deleteCategory(data);
        break;
      default:
    }
  };

  const deleteCategory = (data) => {
    const confirm = () => {
      prePlanservice.deletePlanGroup({ ids: data.id }).then((res) => {
        if (res.success) {
          message.success(res.msg);
          getResourceTree();
        }
      }).catch(() => {});
    };
    Popconfirm({
      title: '你要删除吗?',
      okText: '确定',
      cancelText: '取消',
      onConfirm: confirm
    });
  };

  const onCheckNameIsRepeat = (treeDate) => {
    return treeDate.reduce((iter, val) => {
      const { parentid, name } = val;
      const comArr = [...iter, { parentid, name }];
      return val.children ? [...comArr, ...onCheckNameIsRepeat(val.children)] : comArr;
    }, []);
  };

  const judgeIsRepeatName = () => {
    const IsHasRepeatName = [];
    onCheckNameIsRepeat(treeData).forEach((v) => {
      if (v.parentid === editNode.data.parentId && v.name === editNode.data.groupName.trim()) {
        IsHasRepeatName.push(v);
      }
    });
    if (IsHasRepeatName.length > 0) {
      message.warning('同级组织结构名称不能相同');
      return false;
    }
    return true;
  };

  const editNodeCancel = () => {
    setEditNode((prev) => ({ ...prev, dialogFormVisible: false }));
  };

  const editNodeSubmit = () => {
    editNodeFormRef.current.validate((valid) => {
      if (!valid) return;
      setLoading(true);
      let data;
      if (editNode.dialogType) {
        if (currLevel >= 8) {
          setLoading(false);
          message.warning('应急组织不能超过8级');
          return;
        }
        const sumLevel = currLevel + checkedTreeLevel;
        if (sumLevel > 8) {
          setLoading(false);
          message.warning('应急组织不能超过8级');
          return;
        }
        const currentNode = treeRef.current?.getSelectedNodes()[0];
        data = {
          id: currentNode.id,
          groupName: editNode.data.groupName,
          parentId: editNode.data.rootNode ? '0' : editNode.data.parentId,
          outlineId
        };
        updateCategory(data, currentNode);
      } else {
        if (currLevel >= 8) {
          setLoading(false);
          message.warning('应急组织不能超过8级');
          return;
        }
        data = {
          parentId: editNode.data.parentId,
          groupName: editNode.data.groupName,
          outlineId
        };
        updateCategory(data);
      }
    });
  };

  const groupAddUserCancel = () => {
    setOrgData((prev) => ({ ...prev, dialogFormVisible: false }));
  };

  const groupAddUserSure = () => {
    const arr = [];
    const userParams = orgRef.current?.selectRows.tableParams.selection;
    if (!userParams || userParams.length <= 0) {
      message.warning('请选择应急架构用户');
      return;
    }
    userParams.forEach((v) => {
      arr.push({
        groupId: orgData.groupId,
        outlineId: orgData.outlineId,
        userId: v.id
      });
    });
    prePlanservice.addPlanGroupUser(arr).then((response) => {
      if (response.success) {
        const currentNode = treeRef.current?.getSelectedNodes()[0];
        if (currentNode) {
          mouseLeft(currentNode);
        }
        setOrgData((prev) => ({ ...prev, dialogFormVisible: false }));
        message.success(response.msg);
      }
    });
  };

  const formConsoleNode = () => {
    if (editNode.dialogType) {
      const data = treeRef.current?.getSelectedNodes()[0];
      setEditNode((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          nodecode: data.code,
          nodename: data.name,
          parentId: data.parentid
        }
      }));
      editNodeFormRef.current.clearValidate();
    } else {
      setEditNode((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          nodecode: '',
          nodename: ''
        }
      }));
    }
  };

  const changeNode = (avgs) => {
    const checkedNodes = parentIdRef.current?.getCheckedNodes();
    if (!checkedNodes || checkedNodes.length <= 0) return;
    setCurrLevel(checkedNodes[0].level);
    if (checkedNodes[0].level >= 8) {
      message.warning('应急组织不能超过8级');
      return;
    }
    if (editNode.title === '编辑应急组织') {
      const sumLevel = currLevel + checkedTreeLevel;
      if (sumLevel > 8) {
        message.warning('应急组织不能超过8级');
        return;
      }
    }
  };

  const updateCategory = (data, currentNode) => {
    prePlanservice.editPlanGroup(data).then((res) => {
      if (res.success) {
        message.success(res.msg);
        getResourceTree(currentNode);
        setEditNode((prev) => ({ ...prev, dialogFormVisible: false }));
      } else {
        message.error(res.msg);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const mouseLeft = (zobj) => {
    setCheckedTreeLevel(zobj.level);
    onTableReset();
    setTable((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        outlineId,
        groupId: zobj?.id || ''
      }
    }));
    onTableSearch();
  };

  const filterNode = (value, node) => {
    if (!value) return true;
    return node.title.indexOf(value) !== -1;
  };

  const treeSelect = () => {
    editNodeFormRef.current.validateFields(['parentId']);
  };

  const cellBtnClick = (data) => {
    hatechTableRef.current.hatechTableOptionBtn(data);
  };

  const fmtNameClick = (param) => {
    alert(param.row.name);
  };

  const setIsEnable = (param) => {
    const senddata = {
      id: param.row.id,
      enable: param.row.isEnable === 'enable' ? 'disable' : 'enable'
    };
    // 假设这里有对应的请求方法
    // that.$http_t.post('/auth/user/setIsEnable', senddata).then((response) => {
    //   message.success(response.data.msg);
    //   hatechTableRef.current._initTable();
    // }).catch(() => {});
  };

  const onTableSearch = () => {
    hatechTableRef.current._initTable();
  };

  const onTableReset = () => {
    setTable((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        roleId: '',
        userId: ''
      }
    }));
  };

  const add = () => {
    const data = treeRef.current?.getSelectedNodes()[0];
    if (!data) {
      message.warning('请先选择要操作的组织');
      return;
    }
    setOrgData((prev) => ({
      ...prev,
      groupId: data.id,
      outlineId,
      dialogFormVisible: true
    }));
  };

  const setUpDuty = () => {
    const current = treeRef.current?.getSelectedNodes()[0];
    if (!current) {
      message.warning('请先选择要操作的组织');
      return;
    }
    if (table.select.length === 0) {
      message.warning('请选择要设置职责的人员');
      return;
    }
    if (table.select.length > 1) {
      message.warning('一次只能设置一个用户');
      return;
    }
    if (table.select.length === 1) {
      setDutyDialog((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          duty: table.select[0].duty.toString()
        },
        dialogFormVisible: true
      }));
    }
  };

  const setUpDutyCancel = () => {
    setDutyDialog((prev) => ({
      ...prev,
      dialogFormVisible: false
    }));
  };

  const setUpDutySure = () => {
    const ids = table.select.map((v) => v.id);
    const data = {
      id: ids.join(','),
      userId: ids.join(','),
      groupId: table.select[0].groupId,
      duty: dutyDialog.data.duty,
      outlineId
    };
    prePlanservice.updatePlanGroup(data).then((response) => {
      if (response.success) {
        message.success(response.msg);
        hatechTableRef.current._initTable();
        setDutyDialog((prev) => ({
          ...prev,
          dialogFormVisible: false
        }));
      }
    });
  };

  const dutyDialogClose = () => {
    setDutyDialog((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        duty: '0'
      },
      dialogFormVisible: false
    }));
  };

  const edit = (result) => {
    setForm((prev) => ({
      ...prev,
      title: '编辑用户',
      data: result.row,
      disabled: false,
      isBtnShow: true,
      dialogFormVisible: true
    }));
    switchFormRulesType(true);
  };

  const switchFormRulesType = (bool) => {
    const newRules = { ...form.rules };
    Object.values(newRules).forEach((v) => {
      v[0].required = bool;
    });
    setForm((prev) => ({ ...prev, rules: newRules }));
  };

  const detail = (result) => {
    setForm((prev) => ({
      ...prev,
      title: '查看用户信息',
      data: result.row,
      disabled: true,
      isBtnShow: false,
      dialogFormVisible: true
    }));
    switchFormRulesType(false);
  };

  const deleteItem = (result) => {
    const { select } = result;
    if (select.length === 0) {
      message.warning('请先选择要删除项');
      return;
    }
    const confirm = () => {
      const id = select.map((item) => item.id).join(',');
      prePlanservice.deletePlanGroupUser({ ids: id }).then((response) => {
        if (response.success) {
          message.success(response.msg);
          const newPage = Math.ceil((table.count - select.length) / table.limit);
          if (table.page > newPage) {
            setTable((prev) => ({ ...prev, page: newPage }));
          }
          hatechTableRef.current._initTable();
        }
      }).catch(() => {});
    };
    Popconfirm({
      title: '你要删除吗?',
      okText: '确定',
      cancelText: '取消',
      onConfirm: confirm
    });
  };

  const setAdmin = (result) => {
    let tipContent = '';
    if (result.row.admininfo === 0) {
      tipContent = `你要将${result.row.name}设为管理员吗?`;
    } else {
      tipContent = `你要取消${result.row.name}管理员身份吗?`;
    }
    const confirm = () => {
      const senddata = {
        userIds: result.row.id,
        enable: result.row.admininfo === 0 ? 1 : 0,
        groupId: result.row.groupId
      };
      // 假设这里有对应的请求方法
      // that.$http_t.post('/auth/user/usersetadmin', senddata).then((response) => {
      //   if (response.data.code === 200) {
      //     message.success(response.data.msg);
      //   } else {
      //     message.error(response.data.msg);
      //   }
      //   hatechTableRef.current._initTable();
      // }).catch(() => {});
    };
    Popconfirm({
      title: tipContent,
      okText: '确定',
      cancelText: '取消',
      onConfirm: confirm
    });
  };

  const handleDragEnd = (info) => {
    let updown;
    switch (info.dropPosition) {
      case -1:
        updown = '1';
        break;
      default:
        updown = '0';
    }
    const data = {
      frontId: updown === '0' ? '' : info.node.key,
      updown,
      id: info.dragNode.key,
      parentId: updown === '0' ? info.node.key : info.node.parent?.key
    };
    // 假设这里有对应的请求方法
    // this.$http_t.post('/auth/group/insert', data).then((res) => {
    //   if (res.data.code === 200) {
    //     getResourceTree();
    //   }
    // }).catch(() => {});
  };

  const allowDrop = (draggingNode, dropNode, type) => {
    if (dropNode.level === 1) {
      return type === 'inner';
    }
    return true;
  };

  const allowDrag = (draggingNode) => {
    return draggingNode.level > 1;
  };

  return (
    <div id="org" className="hatech-bcms">
      <div className="hatech-panel">
        <div className="hatech-panel-item hatech-cell-3">
          <hatechBox title="应急组织架构">
            <div className="hatech-header-slot">
              <ul>
                <li title="新增">
                  <div className="ha-icon-add" onClick={() => nodeClick(1)} />
                </li>
                <li title="编辑">
                  <div className="ha-icon-bianji" onClick={() => nodeClick(2)} />
                </li>
                <li title="删除">
                  <div className="ha-icon-shanchu" onClick={() => nodeClick(3)} />
                </li>
              </ul>
            </div>
            <div className="hatech-content">
              <Tree
                ref={treeRef}
                data={treeData}
                treeData={treeData}
                treeDefaultExpandAll
                treeCheckable={false}
                treeCheckStrictly={false}
                treeSelectable={true}
                treeDraggable={true}
                treeNodeFilterProp="title"
                filterTreeNode={filterNode}
                onDragEnd={handleDragEnd}
                onSelect={mouseLeft}
                allowDrop={allowDrop}
                allowDrag={allowDrag}
              />
            </div>
          </hatechBox>
        </div>
        <div className="hatech-panel-item hatech-cell-9">
          <hatechBox title={table.title}>
            <div className="hatech-content">
              <HatechTable
                ref={hatechTableRef}
                table={table}
                hatechTable={{
                  cellBtnClick,
                  fmtNameClick,
                  setIsEnable,
                  onTableSearch,
                  onTableReset,
                  add,
                  setUpDuty,
                  edit,
                  detail,
                  delete: deleteItem,
                  setAdmin
                }}
              >
                <div className="hatech-search">
                  <Form onFinish={onTableSearch} model={table.search} labelSuffix="：">
                    <Form.Item label="用户" labelWidth="45px">
                      <Select
                        filterable
                        v-model={table.search.userId}
                        clearable
                        placeholder="请选择用户"
                      >
                        <Select.Option label="全部用户" value="" />
                        {userList.map((item) => (
                          <Select.Option key={item.id} label={item.name} value={item.userId} />
                        ))}
                      </Select>
                    </Form.Item>
                    <div>
                      <Button type="primary" size="small" onClick={onTableSearch}>
                        查询
                      </Button>
                      <Button type="info" size="small" onClick={onTableReset}>
                        清空
                      </Button>
                    </div>
                  </Form>
                </div>
              </HatechTable>
            </div>
          </hatechBox>
        </div>
      </div>
      <Dialog
        title={editNode.title}
        visible={editNode.dialogFormVisible}
        onCancel={editNodeCancel}
        onOk={editNodeSubmit}
        footer={[
          <Button key="cancel" onClick={editNodeCancel}>取消</Button>,
          <Button key="submit" type="primary" loading={loading} onClick={editNodeSubmit}>保存</Button>
        ]}
      >
        <Form
          ref={editNodeFormRef}
          model={editNode.data}
          rules={editNode.rules}
          labelWidth="auto"
          labelSuffix="："
        >
          <Form.Item label="组织名称" className={isErrorMsg} name="groupName">
            <Input
              v-model={editNode.data.groupName}
              autocomplete="off"
              maxLength={100}
              minLength={1}
              showCount
              placeholder="请输入组织名称，最长100个字"
            />
            <span className="el-form-item__error">{errMsg}</span>
          </Form.Item>
          <Form.Item label="上级组织" name="parentId">
            <Select
              filterable
              clearable
              v-model={editNode.data.parentId}
              placeholder="请选择组织"
              options={treeData}
              props={classifyProps}
              onInput={treeSelect}
              onChange={changeNode}
              ref={parentIdRef}
              disabled={editNode.dialogType && editNode.level === 1}
            />
          </Form.Item>
        </Form>
      </Dialog>
      <HatechDialog form={form} hatechDialog={{ formSubmit: () => {} }}>
        <div className="hatech-dialog-from">
          <Form
            model={form.data}
            rules={form.rules}
            ref={form.name}
            labelWidth="auto"
            labelSuffix="："
            hideRequiredMark={form.disabled}
          >
            <Form.Item label="姓名" name="name">
              <Input
                title={form.data.name}
                disabled={form.disabled}
                v-model={form.data.name}
                autocomplete="off"
                placeholder="请输入姓名"
              />
            </Form.Item>
            <Form.Item label="用户账号" name="username">
              <Input
                disabled={form.disabled}
                title={form.data.username}
                v-model={form.data.username}
                autocomplete="off"
                placeholder="请输入用户账号"
              />
            </Form.Item>
            <Form.Item label="所属组织" name="groupId">
              <Select
                filterable
                v-model={form.data.groupId}
                placeholder="请选择组织"
                options={treeData}
                props={classifyProps}
                disabled={form.disabled}
                clearable
              />
            </Form.Item>
            <Form.Item label="手机号码" name="mobilePhone">
              <Input
                disabled={form.disabled}
                title={form.data.mobilePhone}
                v-model={form.data.mobilePhone}
                autocomplete="off"
                placeholder="用户手机号码"
              />
            </Form.Item>
            <Form.Item label="电子邮箱" name="email">
              <Input
                disabled={form.disabled}
                title={form.data.email}
                v-model={form.data.email}
                maxLength={100}
                showCount
                autocomplete="off"
                placeholder="用户邮箱"
              />
            </Form.Item>
            <Form.Item label="角色" name="roleIds">
              <Select
                filterable
                v-model={form.data.roleIds}
                placeholder="请选择角色"
                options={roleList}
                props={classifyProps}
                disabled={form.disabled}
                clearable
              />
            </Form.Item>
            <Form.Item label="紧急联系人" name="emergencyContact">
              <Input
                disabled={form.disabled}
                title={form.data.emergencyContact}
                v-model={form.data.emergencyContact}
                autocomplete="off"
                placeholder="紧急联系人"
              />
            </Form.Item>
            <Form.Item label="紧急联系人电话" name="emergencyMobile">
              <Input
                disabled={form.disabled}
                title={form.data.emergencyMobile}
                v-model={form.data.emergencyMobile}
                autocomplete="off"
                placeholder="紧急联系人手机号码"
              />
            </Form.Item>
            <Form.Item label="排序号" name="orderInfo">
              <Input
                disabled={form.disabled}
                title={form.data.orderInfo}
                v-model={form.data.orderInfo}
                autocomplete="off"
                placeholder={form.disabled ? '' : '排序号'}
              />
            </Form.Item>
          </Form>
        </div>
      </HatechDialog>
      <Dialog
        title={orgData.title}
        visible={orgData.dialogFormVisible}
        onCancel={groupAddUserCancel}
        onOk={groupAddUserSure}
        footer={[
          <Button key="cancel" onClick={groupAddUserCancel}>取 消</Button>,
          <Button key="submit" type="primary" onClick={groupAddUserSure}>确 定</Button>
        ]}
      >
        <org ref={orgRef} />
      </Dialog>
      <Dialog
        title={dutyDialog.title}
        visible={dutyDialog.dialogFormVisible}
        onCancel={setUpDutyCancel}
        onOk={setUpDutySure}
        footer={[
          <Button key="cancel" onClick={setUpDutyCancel}>取 消</Button>,
          <Button key="submit" type="primary" onClick={setUpDutySure}>确 定</Button>
        ]}
        onClose={dutyDialogClose}
      >
        <Form
          model={form.data}
          ref={form.name}
          labelWidth="auto"
          labelSuffix="："
          hideRequiredMark={!form.contdisabled}
        >
          <Form.Item label="设置职责" name="duty">
            <Radio.Group v-model={dutyDialog.data.duty}>
              {dutyDialog.dutyRadios.map((item, index) => (
                <Radio key={index} value={item.label}>{item.name}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Dialog>
    </div>
  );
};

export default EmergencyOrg;
