import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Button,
  Tree,
  Progress,
  Input,
  Dialog,
  Checkbox,
  Row,
  Col,
  Form
} from 'antd';
import { useRouter } from '@hatech/core';
import domtoimage from 'dom-to-image';
import { VoBasic } from 'vue-orgchart';
import { mapState } from 'vuex';
import appConfig from '@/config';
import ReconnectingWebSocket from '@/utils/utils/vender/reconnectingWebsocket';
import HatechEditor from '@/utils/utils/hatech-editor';
import utils from '@/utils/utils/';
import BackToTop from './backToTop/backToTop';
import HatechBox from './hatechBox/hatechBox';
import HatechDialog from './hatechDialog/hatechDialog';
import emergencyOrg from './emergencyOrg/emergencyOrg';
import sceneList from './sceneList/sceneList';
import insertContent from './insertContent/insertContent';
import sceneView from '../../sceneManagement/views/AddsceneView';
import keyElement from './insertKeyElement/insertKeyElement';
import basicInfo from './basicInfo/basicInfo';
import 'vue-orgchart/dist/style.min.css';
import PrePlanManageService from '../../prePlanManage/service/prePlanManage';
import Json from '@/assets/classLib/utilLib/Json';

const service = new PrePlanManageService();

const DocumentEditor = ({ documentObject, withReturnBtn }) => {
  const router = useRouter();
  const [keyElementData, setKeyElementData] = useState({});
  const [templateType, setTemplateType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [filterText, setFilterText] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [operateType, setOperateType] = useState('add');
  const [defaultProps] = useState({
    children: 'children',
    label: 'outlineName',
    value: 'id'
  });
  const [node, setNode] = useState('');
  const [baseData, setBaseData] = useState({
    isBaseShow: !documentObject.id,
    isTreeShow: !!documentObject.id
  });
  const [editor, setEditor] = useState({
    display: 'block',
    data: []
  });
  const [hatechEditor, setHatechEditor] = useState('');
  const [cataOption] = useState([
    { label: '文本', value: 0 },
    { label: '组织', value: 1 },
    { label: '场景', value: 2 }
  ]);
  const [resourceTypeEnum] = useState([
    { label: '文档模版基本信息', value: 0 },
    { label: '预案基本信息', value: 1 },
    { label: '演练方案基本信息', value: 2 },
    { label: '演练评估基本信息', value: 3 },
    { label: '演练报告基本信息', value: 4 },
    { label: '应急报告基本信息', value: 5 },
    { label: '攻防演练报告基本信息', value: 6 }
  ]);
  const [form] = useState({
    name: 'catalogueForm',
    title: '新增目录',
    top: '10vh',
    formWidth: '40%',
    dialogFormVisible: false,
    disabled: false,
    isBtnShow: true,
    appendToBody: true,
    close: 'closeDialog',
    rules: {
      outlineName: [{ required: true, message: '目录名称不能为空', trigger: 'change' }]
    },
    data: {
      outlineName: '',
      isShowOutline: 0,
      outlineType: 0
    },
    formOption: [
      { name: '取消', fun: 'formCancel', type: 'default', isShow: true },
      { name: '保存', fun: 'formSubmit', type: 'primary', isShow: true }
    ]
  });
  const [defaultKey, setDefaultKey] = useState('');
  const [outlineLevel, setOutlineLevel] = useState('');
  const [socket, setSocket] = useState('');
  const [cataCurrentNode, setCataCurrentNode] = useState('');
  const [contCurrentNode, setContCurrentNode] = useState('');
  const [preNode, setPreNode] = useState('');
  const [editType, setEditType] = useState('');
  const [editContentType, setEditContentType] = useState('');
  const [editorId, setEditorId] = useState('');
  const [editorUser, setEditorUser] = useState([]);
  const [scrollObject, setScrollObject] = useState(null);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [myBackToTopStyle] = useState({
    right: '50px',
    bottom: '50px',
    width: '40px',
    height: '40px',
    'border-radius': '4px',
    'line-height': '45px',
    background: '#dcdfe8'
  });
  const [emergencyOrgData] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '85%',
    title: '插入组织',
    outlineId: ''
  });
  const [orgTree, setOrgTree] = useState('');
  const [progress, setProgress] = useState(0);
  const [sceneData] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '60%',
    title: '场景列表',
    outlineId: ''
  });
  const [content] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '70%',
    title: '插入文档内容',
    groupId: '',
    outlineId: ''
  });
  const [innerContent] = useState({
    innerVisible: false,
    top: '10vh',
    formWidth: '60%',
    title: '插入文档内容',
    orgData: [],
    sceneData: []
  });
  const [sceneViewData] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '90%',
    title: '编辑场景',
    sceneId: '',
    outlineId: '',
    type: documentObject.type || router.currentRoute.params.type
  });
  const [keyEleData] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '60%',
    title: '插入要素',
    data: ''
  });
  const [keyElementShow, setKeyElementShow] = useState(false);
  const [basicinfo, setBasicinfo] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [direction] = useState('rtl');
  const [basicInfoShow, setBasicInfoShow] = useState(true);
  const [treeChooseData, setTreeChooseData] = useState('');
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuTarget, setContextMenuTarget] = useState('');
  const [selectedTxt, setSelectedTxt] = useState('');
  const [eleForm] = useState({
    name: 'elementManagementFormAdd',
    title: '新增',
    top: '10vh',
    data: {
      essentialFactorName: '',
      essentialFactorDesc: '',
      essentialFactorContent: ''
    },
    isBtnShow: true,
    appendToBody: true,
    close: 'dialogClosed',
    formOption: [
      { name: '重置', fun: 'eleFormReset', type: 'warning', isShow: false },
      { name: '确定', fun: 'eleFormSubmit', type: 'primary', isShow: true }
    ],
    dialogFormVisible: false,
    rules: {
      essentialFactorName: [{ required: true, message: '元素名称不能为空' }],
      essentialFactorDesc: [{ required: true, message: '元素描述不能为空' }],
      essentialFactorContent: [{ required: true, message: '元素内容不能为空' }]
    }
  });
  const [orgLoading, setOrgLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resourceType, setResourceType] = useState('');
  const [currentTreeLevel, setCurrentTreeLevel] = useState('');
  const [basicInfoTitle, setBasicInfoTitle] = useState('');
  const [storeKeyElement, setStoreKeyElement] = useState({});
  const [isSocketError, setIsSocketError] = useState(false);
  const [itemTemp, setItemTemp] = useState('');
  const [formDatainfo, setFormDatainfo] = useState('');
  const planTreeRef = useRef(null);

  useEffect(() => {
    if (documentObject.id && documentObject.type === 'edit') {
      initWebSocket();
    }
    const strMap = new Map([
      [0, '文档模版基本信息'],
      [1, '预案基本信息'],
      [2, '演练方案基本信息'],
      [3, '演练评估要素信息'],
      [4, '演练报告要素信息']
    ]);
    setBasicInfoTitle(strMap.get(documentObject.resourceTypeEnum));
  }, [documentObject]);

  useEffect(() => {
    setScrollObject(document.getElementById('hatech-content'));
    if (document.getElementById('hatech-content')) {
      setScrollHeight(document.getElementById('hatech-content').scrollHeight);
    }
    if (documentObject.id) {
      if (documentObject.resourceType === 2) {
        setDocumentName(documentObject.name);
      } else if (documentObject.resourceType === 6) {
        setDocumentName(documentObject.attackName + '报告');
      } else {
        getDocumentName();
      }
      initPlanTree();
      getAllContent();
      if ([3, 4].includes(documentObject.resourceTypeEnum)) {
        getKeyElement();
      }
    }
  }, [documentObject]);

  useEffect(() => {
    return () => {
      if (socket) {
        socketSend(documentObject.id, contCurrentNode.id, 300, window.$store.state.micro.user.name, window.$store.state.micro.token);
        socket.close();
      }
    };
  }, []);

  const filterInput = (data) => {
    return data.replace(/\s+/g, '');
  };

  const getKeyElement = async () => {
    const res = await service.getKeyEle({
      resourceId: documentObject.id,
      resourceType: documentObject.resourceTypeEnum
    });
    if (res && res.success) {
      setKeyElementData(res.data);
    }
  };

  const getDocumentName = async () => {
    const serverMap = new Map([
      [1, 'getPrePlanById'],
      [0, 'getTemplateDetail'],
      [2, 'getDrillProgram']
    ]);
    const url = serverMap.get(documentObject.resourceType);
    const res = await service[url]({ id: documentObject.id });
    if (res && res.success) {
      setFormDatainfo(res.data);
      setDocumentName(res.data.name);
    }
  };

  const updateDocumentName = () => {
    getDocumentName();
  };

  const contentConsole = () => {
    setInnerContent({ ...innerContent, innerVisible: false });
    setContent({ ...content, dialogFormVisible: false });
  };

  const contentSure = () => {
    const newInnerContent = { ...innerContent };
    newInnerContent.orgData = [];
    newInnerContent.sceneData = [];
    if (newOutlineType.length === 0) {
      innerContentPublic();
    } else {
      newInnerContent.innerVisible = true;
      for (const data of newOutlineType) {
        data.checked = false;
        if (data.outlineType === 1) {
          newInnerContent.orgData = data;
        } else {
          newInnerContent.sceneData.push(data);
        }
      }
      setInnerContent(newInnerContent);
    }
  };

  const innerContentPublic = async () => {
    const response = await service.prePlanInsertion(contentInsert);
    if (response.data.code === 200) {
      window.$message.success(response.data.msg);
      setContent({ ...content, dialogFormVisible: false });
      initPlanTree();
      getAllContent();
    } else {
      window.$message.error(response.data.msg);
    }
  };

  const innerContentConsole = () => {
    const newInnerContent = { ...innerContent };
    newInnerContent.orgData = [];
    newInnerContent.sceneData = [];
    newInnerContent.innerVisible = false;
    setInnerContent(newInnerContent);
  };

  const innerContentSure = () => {
    setInnerContent({ ...innerContent, innerVisible: false });
    setContent({ ...content, dialogFormVisible: false });
    innerContentPublic();
  };

  const getOrgTree = (msg) => {
    setOrgTree(msg);
  };

  const insertKeyEle = () => {
    setKeyElementShow(false);
    setKeyEleData({ ...keyEleData, dialogFormVisible: true });
  };

  const addlistenerDom = (className, msg, type) => {
    const els = document.getElementsByClassName(className);
    const editShowMessage = (e) => {
      if (e.type === 'DOMSubtreeModified') {
        if (type === 'keyElement') {
          e.target.parentElement.style.cssText = '';
          e.target.parentElement.className = '';
        } else if (type === 'index') {
          e.target.parentElement.remove();
        }
      } else if (e.type === 'DOMNodeRemoved') {
        e.target.style && (e.target.style.cssText = '');
      }
      if (e.target.parentNode) {
        e.target.parentNode.removeEventListener('DOMSubtreeModified', editShowMessage, false);
      } else {
        e.target.removeEventListener('DOMNodeRemoved', editShowMessage, false);
      }
    };
    for (let i = 0; i < els.length; i++) {
      els[i].addEventListener('DOMNodeRemoved', editShowMessage, false);
      els[i].addEventListener('DOMSubtreeModified', editShowMessage, false);
    }
  };

  const addKeyEleSure = () => {
    if (keyEleData.data === '') {
      window.$message.error('操作失败，请选择要素');
      return;
    }
    addEleFunc(keyEleData.data);
    setKeyEleData({ ...keyEleData, dialogFormVisible: false });
    setTemplateType('');
    addlistenerDom('_key_element', '该要素已被修改', 'keyElement');
  };

  const closeKeyEleDialog = () => {
    setTemplateType('');
    setKeyEleData({ ...keyEleData, dialogFormVisible: false });
  };

  const addEleFunc = (data) => {};
  const setEleFunc = (data) => {};
  const addIndexFunc = (data) => {};
  const addAssessFunc = (data) => {};

  const dealRadio = (value) => {
    if ([3, 4].includes(documentObject.resourceTypeEnum)) {
      setKeyEleData({
        ...keyEleData,
        data: {
          keyElementName: keyElementData[`@@专用：${value.keyElementName}@@`],
          id: value.id,
          isText: true
        }
      });
    } else {
      setKeyEleData({ ...keyEleData, data: value });
    }
  };

  const dealIndexRadio = (value) => {
    // 假设存在 indexData 状态
    // setIndexData({ ...indexData, data: value });
  };

  const getActiveText = () => {
    const txt = window.getSelection
     ? window.getSelection()
      : document.selection.createRange().text;
    if (txt === '') {
      if (window.event) {
        window.event.cancelBubble = true;
      }
    } else {
      setSelectedTxt(txt.toString());
    }
  };

  const setKeyEle = () => {
    if (selectedTxt.trim() === '') {
      window.$message.warning('请选择要设置的内容');
      return;
    }
    if (selectedTxt.length > 500) {
      window.$message.warning('设置要素内容长度不能超过 500 个字符！');
      return;
    }
    setEleForm({
      ...eleForm,
      data: { ...eleForm.data, essentialFactorContent: selectedTxt }
    });
    setEleForm({ ...eleForm, dialogFormVisible: true });
  };

  const eleFormSubmit = (record) => {
    const formRef = document.querySelector(`[name="${eleForm.name}"]`);
    if (formRef.checkValidity()) {
      window.$http_t.post('/plan/word/essential/factor/edit', eleForm.data).then((res) => {
        if (res.data.code === 200) {
          const data = {
            id: res.data.data,
            essentialFactorContent: eleForm.data.essentialFactorContent
          };
          setEleFunc(data);
          setEleForm({ ...eleForm, dialogFormVisible: false });
          eleFormReset();
          window.$message.success(res.data.msg);
          addlistenerDom('_key_element', '该要素已被修改', 'keyElement');
        } else {
          window.$message.error(res.data.msg);
        }
      });
    } else {
      return false;
    }
  };

  const eleFormReset = () => {
    const formRef = document.querySelector(`[name="${eleForm.name}"]`);
    formRef.reset();
  };

  const dialogClosed = (form) => {
    const formRef = document.querySelector(`[name="${form.name}"]`);
    if (formRef) {
      formRef.reset();
    }
  };

  const initPlanTree = async () => {
    const res = await service.getPlanCatalog({
      resourceId: documentObject.id,
      resourceType: documentObject.resourceTypeEnum
    });
    if (res && res.success) {
      setTreeData(res.data);
      if (planTreeRef.current) {
        planTreeRef.current.setCurrentKey(null);
      }
      if (res.data.length > 0) {
        setTimeout(() => {
          if (defaultKey && planTreeRef.current) {
            planTreeRef.current.setCurrentKey(defaultKey);
          }
        }, 0);
      }
    }
  };

  const getAllContent = async () => {
    const interval = setInterval(() => {
      if (progress >= 80) {
        clearInterval(interval);
        return;
      }
      setProgress(progress + 10);
    }, 200);
    const res = await service.getPlanAllContent({
      resourceId: documentObject.id,
      resourceType: documentObject.resourceTypeEnum
    });
    if (res && res.success) {
      setProgress(100);
      setEditor({ ...editor, data: res.data });
      const newEditorData = [...editor.data];
      for (let a = 0; a < newEditorData.length; a++) {
        const v = newEditorData[a];
        v.titleShow = true;
        v.contentShow = false;
        if (v.outlineType === 1) {
          setEmergencyOrgData({ ...emergencyOrgData, outlineId: v.id });
          if (documentObject.resourceType !== 0) {
            getOrgData(v);
          }
        } else if (v.outlineType === 2) {
          setSceneData({ ...sceneData, outlineId: v.id });
          setSceneViewData({ ...sceneViewData, outlineId: v.id });
          if (documentObject.resourceType !== 0) {
            const response = await service.getPlanSceneData({ id: v.id });
            if (response && response.success) {
              v.sceneInfo = response.data;
              setTimeout(() => {
                if (response.data) {
                  insertImgToscene(response.data, v.contentId);
                }
              }, 0);
            }
          }
        }
      }
      setEditor({ ...editor, data: newEditorData });
      setTimeout(() => {
        addlistenerDom('_key_element', '该要素已被修改', 'keyElement');
        addlistenerDom('_quota_element', '该指标已被修改', 'index');
      }, 0);
    }
  };

  const insertImgToscene = (data, contentId) => {
    setTimeout(() => {
      const img = new Image();
      img.src = data.picture;
      img.id = 'imgscene';
      const sceneImg = document.getElementsByClassName(`scene-img${contentId}`)[0];
      if (sceneImg) {
        sceneImg.innerHTML = '';
        sceneImg.appendChild(img);
      }
    }, 500);
  };

  const getOrgData = async (value) => {
    const res = await service.getPlanOrgData({ outlineId: value.id, sort: 'desc' });
    if (res && res.success) {
      const newEditorData = [...editor.data];
      for (let i = 0; i < newEditorData.length; i++) {
        if (newEditorData[i].id === value.id) {
          newEditorData[i].ds = res.data[0];
          break;
        }
      }
      setEditor({ ...editor, data: newEditorData });
      setTimeout(() => {
        orgTOImage(value.id);
      }, 0);
    }
  };

  const mouseLeft = (zobj, znode) => {
    setTreeChooseData(zobj.id);
    const returnEle = document.getElementById(`content${zobj.id}`);
    if (returnEle) {
      returnEle.scrollIntoView(true);
    }
    if (znode) {
      if (znode.data.status) {
        znode.data.status = false;
        setOutlineLevel('');
        setTreeChooseData('');
        if (planTreeRef.current) {
          planTreeRef.current.setCurrentKey(null);
        }
        setCataCurrentNode('');
        setTimeout(() => {
          const nodes = document.getElementsByClassName('ant-tree-node');
          for (let i = 0; i < nodes.length; i++) {
            nodes[i].classList.remove('ant-tree-node-selected');
          }
        }, 0);
      } else {
        znode.data.status = true;
        setOutlineLevel(zobj.outlineLevel);
        setCataCurrentNode(znode);
        setTimeout(() => {
          if (znode.$el) {
            znode.$el.classList.add('ant-tree-node-selected');
          }
        }, 0);
      }
    }
  };

  const nodeClick = (type) => {
    const data = planTreeRef.current ? planTreeRef.current.getCurrentNode() : null;
    setCataCurrentNode(data);
    if (!data && type !== 1) {
      window.$message.warning('请先选择目录');
      return;
    }
    if (data && data.outlineType === 4) {
      window.$message.warning('场景目录不能操作');
      return;
    }
    switch (type) {
      case 1:
        if (data) {
          if ([2, 3].includes(data.outlineType)) {
            window.$message.warning('场景目录下不能新增目录');
            return;
          }
          if ([10, 11, 12].includes(data.outlineType)) {
            window.$message.warning('攻防演练目录下不能新增目录');
            return;
          }
          const tree = planTreeRef.current;
          if (tree) {
            const currentNode = tree.getCurrentNode();
            if (currentNode) {
              const currentElementNode = tree.getNode(currentNode);
              if (currentElementNode.level >= 9) {
                window.$message.warning('大于 9 级无法新增');
                return;
              }
            }
          }
        }
        setForm({
          ...form,
          dialogFormVisible: true,
          data: {
            outlineName: '',
            isShowOutline: '',
            outlineType: ''
          },
          title: '新增目录'
        });
        setOperateType('add');
        const resourceType = documentObject.resourceTypeEnum;
        if (data === null) {
          setForm({
            ...form,
            data: {
              ...form.data,
              outlineName: '',
              menu: '',
              parentId: '0',
              outlineLevel: 0,
              resourceType,
              resourceId: documentObject.id,
              isShowOutline: 0,
              outlineType: 0
            }
          });
        } else {
          setForm({
            ...form,
            data: {
              ...form.data,
              outlineName: '',
              menu: data.menu,
              parentId: data.id,
              resourceType,
              resourceId: data.resourceId,
              outlineLevel: data.outlineLevel + 1,
              isShowOutline: 0,
              outlineType: 0
            }
          });
        }
        break;
      case 2:
        if (data.outlineLevel !== 0 && [10, 11, 12].includes(data.outlineType)) {
          window.$message.warning('攻防演练目录不能操作');
          return;
        }
        socketSend(documentObject.id, data.id, 200);
        setEditType('cata');
        break;
      case 3:
        deleteCategory(data);
        break;
      case 4:
        moveCategory(data.id, 0, data.resourceId);
        break;
      case 5:
        moveCategory(data.id, 1, data.resourceId);
        break;
      default:
        break;
    }
  };

  const formCancel = () => {
    const formRef = document.querySelector(`[name="${form.name}"]`);
    if (formRef) {
      formRef.reportValidity();
    }
    setForm({ ...form, dialogFormVisible: false });
  };

  const formSubmit = async () => {
    const formRef = document.querySelector(`[name="${form.name}"]`);
    if (formRef.checkValidity()) {
      if (currentTreeNode && currentTreeNode.level > 6 && form.data.outlineType === 2) {
        window.$message.warning('大于 6 级场景目录无法新增');
        return;
      }
      const res = await service.submitPlanCatalog(form.data);
      if (res && res.success) {
        if (form.data.id) {
          setDefaultKey(form.data.id);
          socketSend(documentObject.id, form.data.id, 300);
          socketSend(documentObject.id, form.data.id, 401);
          initPlanTree();
          getAllContent();
        } else {
          setDefaultKey(form.data.parentId);
          setForm({ ...form, data: { ...form.data, id: res.data } });
          socketSend(documentObject.id, null, 400);
          initPlanTree();
          getAllContent();
        }
        window.$message.success(res.msg);
        setForm({ ...form, dialogFormVisible: false });
      }
    }
  };

  const savePreNode = (node, type) => {
    if (node.outlineType !== type && node.contentShow && hatechEditor._hatechEditSave) {
      hatechEditor._hatechEditSave();
    }
  };

  const dealDialogShow = (item, data) => {
    if (item.contentShow) {
      setData({ ...data, dialogFormVisible: true });
    } else {
      socketSend(item.resourceId, item.id, 200);
    }
  };

  const cataShow = (item) => {
    item.isShowOutline = item.isShowOutline === 1 ? 0 : 1;
    const newEditorData = [...editor.data];
    for (let i = 0; i < newEditorData.length; i++) {
      if (newEditorData[i].id === item.id) {
        newEditorData[i].isShowOutline = item.isShowOutline;
        break;
      }
    }
    setEditor({ ...editor, data: newEditorData });
  };

  const insertOrg = (item) => {
    savePreNode(contCurrentNode, 1);
    setEditType('group');
    setContCurrentNode(item);
    setItemTemp(item);
    dealDialogShow(item, emergencyOrgData);
    setOrgLoading(true);
  };

  const insertOrgSure = () => {
    try {
      const imgorg = document.getElementById('imgorg');
      if (imgorg) {
        imgorg.remove();
      }
      const voBasic = document.getElementsByClassName('vo-basic')[0];
      if (voBasic) {
        voBasic.id = 'chart-container';
        const orgTable = document.getElementById('org_table');
        if (orgTable) {
          orgTable.remove();
        }
      }
    } catch (error) {
      console.log(error);
    }
    const currOrgTree = JSON.parse(JSON.stringify(orgTree));
    if (currOrgTree[0] && currOrgTree[0].children.length > 0) {
      currOrgTree[0].children.reverse();
    }
    const newEditorData = [...editor.data];
    for (let i = 0; i < newEditorData.length; i++) {
      if (newEditorData[i].outlineType === 1) {
        newEditorData[i].ds = currOrgTree[0];
      }
    }
    setEditor({ ...editor, data: newEditorData });
    setEmergencyOrgData({ ...emergencyOrgData, dialogFormVisible: false });
    orgTOImage(contCurrentNode.id || emergencyOrgData.outlineId);
    if (!contCurrentNode.contentShow) {
      socketSend(
        documentObject.id,
        contCurrentNode.id || emergencyOrgData.outlineId,
        300
      );
    }
  };

  const orgTOImage = (id) => {
    setTimeout(() => {
      const titles = document.querySelectorAll('#chart-container .title');
      for (let i = 0; i < titles.length; i++) {
        const arr = titles[i].innerText.split('');
        let text = '';
        for (const v of arr) {
          text += `<span class="node_text">${v}</span>`;
        }
        titles[i].innerHTML = text;
      }
      domtoimage
       .toPng(document.querySelector('#chart-container .orgchart'), {
          bgcolor: 'rgba(255,255,255,0)'
        })
       .then((dataUrl) => {
          const img = new Image();
          img.src = dataUrl;
          img.id = 'imgorg';
          const voBasic = document.getElementsByClassName('vo-basic')[0];
          if (voBasic) {
            voBasic.innerHTML = '';
            voBasic.appendChild(img);
            voBasic.id = 'chart-container1';
            getTableOrg(id);
          }
        })
       .catch((error) => {
          console.error('oops, something went wrong!', error);
        });
    }, 800);
  };

  const getTableOrg = async (id) => {
    const res = await service.getPlanTableOrg({ outlineId: id });
    if (res && res.success) {
      const voBasic = document.getElementsByClassName('vo-basic')[0];
      if (voBasic) {
        const orgTable = document.getElementById('org_table');
        if (orgTable) {
          voBasic.removeChild(orgTable);
        }
        let duty;
        const data = res.data;
        const table = document.createElement('table');
        table.id = 'org_table';
        table.style.cssText = 'border-collapse:collapse; width:100%';
        let str = '';
        str += '<tr>';
        str += '<th style="width: 20%; word-break: break-all;">姓名</th>';
        str += '<th style="width: 20%; word-break: break-all;">所属应急组</th>';
        str += '<th style="width: 20%; word-break: break-all;">所属组织</th>';
        str += '<th style="width: 20%; word-break: break-all;">手机号码</th>';
        str += '<th style="width: 20%; word-break: break-all;">职责</th>';
        str += '</tr>';
        data.forEach((v) => {
          str += '<tr>';
          str += `<td style="width: 20%; word-break: break-all;">${v.userName ? v.userName : ' '}</td>`;
          str += `<td style="width: 20%; word-break: break-all;">${v.groupName ? v.groupName : ' '}</td>`;
          str += `<td style="width: 20%; word-break: break-all;">${v.department ? v.department : ' '}</td>`;
          str += `<td style="width: 20%; word-break: break-all;">${v.phone ? v.phone : ' '}</td>`;
          if (v.duty === 0) {
            duty = '成员';
          } else if (v.duty === 1) {
            duty = '组长';
          } else {
            duty = '副组长';
          }
          str += `<td style="width: 20%; word-break: break-all;">${duty}</td>`;
          str += '</tr>';
        });
        table.innerHTML = str;
        voBasic.appendChild(table);
        setOrgLoading(false);
      }
    }
  };

  const insertScene = (item) => {
    savePreNode(contCurrentNode, 2);
    setEditType('scene');
    setContCurrentNode(item);
    localStorage.setItem('documentEditContCurrentNode', JSON.stringify(item));
    if (item.sceneInfo) {
      setSceneViewData({
        ...sceneViewData,
        sceneId: item.sceneInfo.id,
        outlineId: item.id
      });
      dealDialogShow(item, sceneViewData);
    } else {
      setSceneData({ ...sceneData, outlineId: item.id });
      dealDialogShow(item, sceneData);
    }
  };

  const addSceneSure = async () => {
    const sceneComponent = document.querySelector('[data-scene-component]');
    if (sceneComponent && sceneComponent.table && sceneComponent.table.radio !== '') {
      const newContCurrentNode = contCurrentNode || JSON.parse(localStorage.getItem('documentEditContCurrentNode'));
      setLoading(true);
      const params = {
        content: sceneComponent.table.radio.id,
        contentId: newContCurrentNode.contentId,
        id: newContCurrentNode.id,
        isShowOutline: newContCurrentNode.isShowOutline,
        outlineName: newContCurrentNode.outlineName,
        outlineType: 3,
        parentId: newContCurrentNode.parentId,
        resourceId: newContCurrentNode.resourceId,
        resourceType: newContCurrentNode.resourceType
      };
      const res = await service.submitPlanCatalog(params);
      if (res && res.success) {
        setSceneData({ ...sceneData, dialogFormVisible: false });
        socketSend(documentObject.id, newContCurrentNode.id, 300);
        initPlanTree();
        getAllContent();
      }
      setLoading(false);
    } else {
      window.$message.warning('请选择场景模版');
    }
  };

  const dealDialogClose = (data, flag) => {
    setData({ ...data, dialogFormVisible: flag });
    if (!contCurrentNode.contentShow) {
      socketSend(documentObject.id, contCurrentNode.id, 300);
    }
  };

  const sceneListClose = () => {
    dealDialogClose(sceneData, false);
  };

  const sceneViewClose = () => {
    dealDialogClose(sceneViewData, false);
  };

  const dealListDialog = (msg) => {
    if (!msg.flag) {
      acceptMessage(msg);
    }
    dealDialogClose(sceneData, msg.dialogShow);
  };

  const dealDialog = (msg) => {
    if (!msg.flag) {
      acceptMessage(msg);
    }
    dealDialogClose(sceneViewData, msg.dialogShow);
  };

  const acceptMessage = (msg, isNewData) => {
    initPlanTree();
    getAllContent();
    const newEditorData = [...editor.data];
    for (let i = 0; i < newEditorData.length; i++) {
      if (newEditorData[i].outlineType === 2 && newEditorData[i].contentId === contCurrentNode.contentId) {
        newEditorData[i].sceneInfo = msg;
        setTimeout(() => {
          insertImgToscene(msg, newEditorData[i].contentId);
        }, 0);
        break;
      }
    }
    setEditor({ ...editor, data: newEditorData });
  };

  const dealBasicinfo = (msg) => {
    setBasicinfo(msg);
    setDocumentObject({ ...documentObject, id: msg.id });
    setBasicInfoShow(!basicInfoShow);
  };

  const deleteCategory = async (data) => {
    const { resourceId } = data;
    window.$confirm('你要删除吗?', '确认提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      closeOnPressEscape: false,
      confirmButtonType: 'danger',
      modalType: 'default'
    })
     .then(async () => {
        const res = await service.deletePlanCatalog({
          ids: data.id,
          resourceId: data.resourceId
        });
        if (res && res.success) {
          setDefaultKey('');
          initPlanTree();
          socketSend(resourceId, null, 400);
          getAllContent();
          setPreNode('');
          window.$message.success(res.msg);
        }
      })
     .catch(() => {});
  };

  const moveCategory = async (id, type, resourceId) => {
    const res = await service.movePlanCatalog({ id, type });
    if (res && res.success) {
      socketSend(resourceId, null, 400);
      initPlanTree();
      getAllContent();
      window.$message.success(res.msg);
    }
  };

  const closeDialog = (form) => {
    if (form.data.id) {
      socketSend(documentObject.id, form.data.id, 300);
    }
    const formRef = document.querySelector(`[name="${form.name}"]`);
    if (formRef) {
      formRef.reset();
    }
  };

  const baseBtnClick = () => {
    setBaseData({ ...baseData, isBaseShow: true, isTreeShow: false });
  };

  const treeBtnClick = () => {
    setBaseData({ ...baseData, isTreeShow: true, isBaseShow: false });
  };

  const editorOption = (editorId, item) => {
    if (documentObject.route.params.attackAndDefense) return;
    if (item.contentShow) return;
    if (preNode) {
      socketSend(documentObject.id, preNode.id, 300);
    }
    setEditorId(editorId);
    setEditType('cont');
    setItemTemp(item);
    socketSend(item.resourceId, item.id, 200);
  };

  const editorTitle = (item) => {
    const newEditorData = [...editor.data];
    for (let i = 0; i < newEditorData.length; i++) {
      if (newEditorData[i].id === item.id) {
        newEditorData[i].titleShow = false;
        break;
      }
    }
    setEditor({ ...editor, data: newEditorData });
  };

  const editorTitleSave = (item) => {
    const newEditorData = [...editor.data];
    for (let i = 0; i < newEditorData.length; i++) {
      if (newEditorData[i].id === item.id) {
        newEditorData[i].titleShow = true;
        break;
      }
    }
    setEditor({ ...editor, data: newEditorData });
  };

  const filterWordStyle = (html) => {
    // 此处可实现具体逻辑
  };

  const socketSend = (id, nodeId, type, userName, token) => {
    if (socket) {
      const message = {
        id,
        nodeId,
        type,
        userName,
        token
      };
      socket.send(JSON.stringify(message));
    }
  };

  const initWebSocket = () => {
    const newSocket = new ReconnectingWebSocket('your-websocket-url');
    setSocket(newSocket);
    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 处理接收到的消息
    };
    newSocket.onerror = () => {
      setIsSocketError(true);
    };
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const nameFilter = (name) => {
    const regC = /^[\u4e00-\u9fa5]+$/;
    if (name.length <= 4) {
      return name;
    }
    if (regC.test(name)) {
      return name.substr(name.length - 4, name.length);
    }
    return name.substr(0, 4);
  };

  const newCataOption = () => {
    if (router.currentRoute.params.source === 'bia' || router.currentRoute.params.source === 'ra') {
      return cataOption.filter((v) => v.label === '文本');
    }
    if (router.currentRoute.params.attackAndDefense) {
      return [
        { label: '文本', value: 0 },
        { label: '演练计划', value: 10 },
        { label: '演练统计', value: 11 }
      ];
    }
    return cataOption;
  };

  return (
    <div id="documentEdit" className="hatech-bcms">
      <div
        title={basicInfoTitle}
        onClick={() => openBasicInfo()}
        className={`basicInfoBtn ${!basicInfoShow ? 'closeStyle' : ''}`}
        style={{ display: documentObject.route.params.attackAndDefense ? 'none' : 'block' }}
      >
        <div className="ha-icon-jbxx"></div>
      </div>
      <Drawer
        title={basicInfoTitle}
        modal={false}
        placement={direction}
        size="25%"
        visible={drawer}
        onClose={() => setDrawer(false)}
      >
        <basicInfo
          ref={(ref) => setBasicInfoRef(ref)}
          onTranslateBaseInfo={dealBasicinfo}
          onUpdateDocumentName={updateDocumentName}
          basicData={documentObject}
          keyElementData={keyElementData}
          drawerShow={drawer}
          onHandleCloseBasicInfo={handleClose}
          formDataInfo={formDatainfo}
        />
      </Drawer>
      <div className="hatech-panel hatech-edit">
        <div
          className={`hatech-panel-item hatech-cell-3 ${baseData.isBaseShow ? 'formBgc' : 'cataBgc'}`}
        >
          <HatechBox title={false}>
            <div className="hatech-header-left-slot">
              <span className="title-menu" title="目录大纲">目录大纲</span>
            </div>
            <div className="hatech-header-slot">
              {((baseData.isTreeShow && basicinfo.id) || documentObject.id) &&
                documentObject.type === 'edit' && (
                  <div className="hatech-item-header-option">
                    <ul>
                      <li title="新增" onClick={() => nodeClick(1)}>
                        <div className="ha-icon-add"></div>
                      </li>
                      <li title="编辑" onClick={() => nodeClick(2)}>
                        <div className="ha-icon-bianji"></div>
                      </li>
                      <li title="删除" onClick={() => nodeClick(3)}>
                        <div className="ha-icon-shanchu"></div>
                      </li>
                      <li title="上移" onClick={() => nodeClick(4)}>
                        <div className="ha-icon-up"></div>
                      </li>
                      <li title="下移" onClick={() => nodeClick(5)}>
                        <div className="ha-icon-down"></div>
                      </li>
                    </ul>
                  </div>
                )}
            </div>
            <div
              className={`hatech-content ${baseData.isBaseShow ? 'formBgc' : 'cataBgc'}`}
            >
              <div className="hatech-panel-item-body" style={{ height: '100%' }}>
                <Tree
                  ref={planTreeRef}
                  className="filter-tree"
                  data={treeData}
                  props={defaultProps}
                  defaultExpandAll
                  nodeKey="id"
                  expandOnClickNode={false}
                  highlightCurrent
                  onNodeClick={mouseLeft}
                >
                  {(node) => (
                    <span className="span-ellipsis" title={node.label}>{node.label}</span>
                  )}
                </Tree>
              </div>
            </div>
          </HatechBox>
        </div>
        <div className="hatech-panel-item hatech-cell-9">
          <HatechBox title={documentName}>
            <div className="hatech-header-slot">
              <div className="hatech-item-header-option">
                <ul>
                  <li className="editUser" style={{ display: documentObject.id && documentObject.type === 'edit' ? 'block' : 'none' }}>
                    <div>
                      {editorUser.map((item, index) => (
                        <span key={index} title={item}>{nameFilter(item)}</span>
                      ))}
                    </div>
                  </li>
                  <li title="提交" onClick={reportSubmit} style={{ display: documentObject.submitBtn ? 'block' : 'none' }}>
                    <div className="ha-icon-tijiao"></div>
                  </li>
                  <li title="导出" onClick={exportPre}>
                    <div className="ha-icon-daochu"></div>
                  </li>
                  {withReturnBtn && (
                    <li title="返回" onClick={goBack}>
                      <Button type="primary" size="small">返回</Button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
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
                {documentObject.type === 'edit' ? (
                  editor.data.map((item, key) => (
                    <div key={key} className="hatech-edit-item">
                      <div
                        className="hatech-edit-content"
                        id={`content${item.id}`}
                      >
                        {((contCurrentNode.id !== item.id || !contCurrentNode.contentShow) &&
                          ![3, 4].includes(item.outlineType)) && (
                          <span className="edit-btn">
                            <div onClick={() => deleteCategory(item)} className="ha-icon-shanchu"></div>
                            <div onClick={() => moveCategory(item.id, 0, item.resourceId)} className="ha-icon-up"></div>
                            <div onClick={() => moveCategory(item.id, 1, item.resourceId)} className="ha-icon-down"></div>
                          </span>
                        )}
                        {item.outlineType === 3 || item.outlineType === 4 ? (
                          <>
                            {item.titleShow && item.isShowOutline === 0 && (
                              <div
                                className="content-title"
                                dangerouslySetInnerHTML={{
                                  __html: `<h${item.outlineLevel + 1}>${item.outlineName}</h${item.outlineLevel + 1}>`
                                }}
                              />
                            )}
                            {!item.titleShow && (
                              <div className="content-title-input">
                                <Input
                                  id={`title${item.id}`}
                                  ref={(ref) => setTitleRef(item.id, ref)}
                                  maxLength={30}
                                  showWordLimit
                                  value={item.outlineName}
                                  onChange={(e) => {
                                    const newEditorData = [...editor.data];
                                    newEditorData[key].outlineName = e.target.value;
                                    setEditor({ ...editor, data: newEditorData });
                                  }}
                                />
                              </div>
                            )}
                            <ul className="content" dangerouslySetInnerHTML={{ __html: item.content }} />
                            <ul id={`editor${item.id}`} className="editContent" />
                          </>
                        ) : (
                          <div onClick={(e) => {
                            e.stopPropagation();
                            editorOption(`editor${item.id}`, item);
                          }}>
                            {item.titleShow && item.isShowOutline === 0 && (
                              <div
                                className="content-title"
                                dangerouslySetInnerHTML={{
                                  __html: `<h${item.outlineLevel + 1}>${item.outlineName}</h${item.outlineLevel + 1}>`
                                }}
                              />
                            )}
                            {!item.titleShow && (
                              <div className="content-title-input">
                                <Input
                                  id={`title${item.id}`}
                                  ref={(ref) => setTitleRef(item.id, ref)}
                                  maxLength={30}
                                  showWordLimit
                                  value={item.outlineName}
                                  onChange={(e) => {
                                    const newEditorData = [...editor.data];
                                    newEditorData[key].outlineName = e.target.value;
                                    setEditor({ ...editor, data: newEditorData });
                                  }}
                                />
                                <div className="title-show">
                                  {item.isShowOutline === 1 ? (
                                    <span title="不显示目录" onClick={(e) => {
                                      e.stopPropagation();
                                      cataShow(item);
                                    }}>
                                      <div className="ha-icon-yincan"></div>
                                    </span>
                                  ) : (
                                    <span title="显示目录" onClick={(e) => {
                                      e.stopPropagation();
                                      cataShow(item);
                                    }}>
                                      <div className="ha-icon-xianshi"></div>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            <ul className="content" dangerouslySetInnerHTML={{ __html: item.content }} />
                            <ul id={`editor${item.id}`} className="editContent" onMouseUp={getActiveText} />
                          </div>
                        )}
                        {item.outlineType === 2 && (
                          <div className="scene-image">
                            {documentObject.resourceType === 0 ? (
                              item.sceneInfo ? (
                                <div className={`scene-img${item.contentId}`} />
                              ) : (
                                <div className="el-tree__empty-block" style={{ border: '1px dashed #ccc' }}>
                                  <span className="el-tree__empty-text">暂无数据</span>
                                </div>
                              )
                            ) : (
                              item.sceneInfo ? (
                                <div
                                  className={`scene-img${item.contentId}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    insertScene(item);
                                  }}
                                />
                              ) : (
                                <div
                                  className="el-tree__empty-block"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    insertScene(item);
                                  }}
                                  style={{ border: '1px dashed #ccc' }}
                                >
                                  <span className="el-tree__empty-text">暂无数据</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {item.outlineType === 1 && (
                          <div className="organization-image">
                            {documentObject.resourceType === 0 ? (
                              item.ds ? (
                                <div className="org-div">
                                  <VoBasic
                                    chartClass="theOrgImg"
                                    data={item.ds}
                                    draggable
                                    direction="l2r"
                                  />
                                </div>
                              ) : (
                                <div className="el-tree__empty-block" style={{ border: '1px dashed #ccc' }}>
                                  <span className="el-tree__empty-text">暂无数据</span>
                                </div>
                              )
                            ) : (
                              item.ds ? (
                                <div
                                  className="org-div"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    insertOrg(item);
                                  }}
                                >
                                  <VoBasic
                                    chartClass="theOrgImg"
                                    data={item.ds}
                                    draggable
                                    pan
                                    direction="l2r"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="el-tree__empty-block"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    insertOrg(item);
                                  }}
                                  style={{ border: '1px dashed #ccc' }}
                                >
                                  <span className="el-tree__empty-text">暂无数据</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  editor.data.map((item, key) => (
                    <div key={key} className="hatech-edit-item">
                      <div
                        className="hatech-edit-content"
                        id={`content${item.id}`}
                      >
                        <div>
                          {item.titleShow && item.isShowOutline === 0 && (
                            <div
                              className="content-title"
                              dangerouslySetInnerHTML={{
                                __html: `<h${item.outlineLevel + 1}>${item.outlineName}</h${item.outlineLevel + 1}>`
                              }}
                            />
                          )}
                          {!item.titleShow && (
                            <div className="content-title-input">
                              <Input
                                id={`title${item.id}`}
                                ref={(ref) => setTitleRef(item.id, ref)}
                                maxLength={30}
                                showWordLimit
                                value={item.outlineName}
                                onChange={(e) => {
                                  const newEditorData = [...editor.data];
                                  newEditorData[key].outlineName = e.target.value;
                                  setEditor({ ...editor, data: newEditorData });
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
                              <div className={`scene-img${item.contentId}`} />
                            ) : (
                              <div className="el-tree__empty-block" style={{ border: '1px dashed #ccc' }}>
                                <span className="el-tree__empty-text">暂无数据</span>
                              </div>
                            )}
                          </div>
                        )}
                        {item.outlineType === 1 && (
                          <div className="organization-image">
                            {item.ds ? (
                              <div className="org-div">
                                <VoBasic
                                  data={item.ds}
                                  draggable
                                  direction="l2r"
                                />
                              </div>
                            ) : (
                              <div className="el-tree__empty-block" style={{ border: '1px dashed #ccc' }}>
                                <span className="el-tree__empty-text">暂无数据</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </HatechBox>
        </div>
      </div>
      {/* 新增/编辑 弹出框 */}
      <HatechDialog form={form} hatechDialog={this}>
        <sceneView
          onTranslateDialog={dealDialog}
          idObject={{
            id: sceneViewData.sceneId,
            outlineId: sceneViewData.outlineId,
            type: sceneViewData.type
          }}
        />
      </HatechDialog>
      {/* 插入文档类型模态框 */}
      <Dialog
        closeOnClickModal={false}
        className="hatech-dialog hatech-dialog-common current-dialog-sub"
        title={content.title}
        visible={content.dialogFormVisible}
        top={content.top}
        width={content.formWidth}
        modal={false}
        onClose={contentConsole}
      >
        <Dialog
          width="30%"
          title="是否插入该场景/组织"
          visible={innerContent.innerVisible}
          onClose={innerContentConsole}
          appendToBody
        >
          {innerContent.orgData.length !== 0 && (
            <Checkbox
              label={innerContent.orgData.outlineId}
              checked={innerContent.orgData.checked}
              onChange={() => insertContentChange(0)}
            >
              {innerContent.orgData.name}
            </Checkbox>
          )}
          {innerContent.sceneData.length !== 0 && (
            <Checkbox
              label={innerContent.sceneData.outlineId}
              checked={innerContent.sceneData.checked}
              onChange={() => insertContentChange(1)}
            >
              {innerContent.sceneData.name}
            </Checkbox>
          )}
          <div className="dialog-footer">
            <Button onClick={innerContentConsole}>取消</Button>
            <Button type="primary" onClick={innerContentSure}>确定</Button>
          </div>
        </Dialog>
        <insertContent treeChooseData={treeChooseData} />
        <div className="dialog-footer">
          <Button onClick={contentConsole}>取消</Button>
          <Button type="primary" onClick={contentSure}>确定</Button>
        </div>
      </Dialog>
      {/* 插入要素 */}
      <Dialog
        ref={(ref) => setKeyEleDialogRef(ref)}
        closeOnClickModal={false}
        className="hatech-dialog-nodeInfo hatech-dialog-common scene-dialog"
        title={keyEleData.title}
        visible={keyEleData.dialogFormVisible}
        modal={false}
        top={keyEleData.top}
        width={keyEleData.formWidth}
        onClose={closeKeyEleDialog}
        loading={loading}
      >
        <keyElement
          ref={(ref) => setKeyElementRef(ref)}
          onTranslateRadio={dealRadio}
          resource={templateType}
        />
        <div className="dialog-footer">
          <Button onClick={closeKeyEleDialog}>取消</Button>
          <Button type="primary" onClick={addKeyEleSure}>确定</Button>
        </div>
      </Dialog>
      {/* 设置要素内容 */}
      <HatechDialog form={eleForm} hatechDialog={this}>
        <div className="hatech-dialog-from">
          <Form
            name={eleForm.name}
            model={eleForm.data}
            rules={eleForm.rules}
            labelWidth="auto"
            labelSuffix="："
            hideRequiredAsterisk={eleForm.disabled}
          >
            <Row gutter={10}>
              <Col span={24}>
                <Form.Item label="要素名称" prop="essentialFactorName">
                  <Input
                    type="text"
                    autosize={eleForm.disabled}
                    title={eleForm.data.essentialFactorName}
                    value={eleForm.data.essentialFactorName}
                    onChange={(e) => {
                      const newEleForm = { ...eleForm };
                      newEleForm.data.essentialFactorName = e.target.value;
                      setEleForm(newEleForm);
                    }}
                    autocomplete="off"
                    placeholder="要素名称"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="描述" prop="essentialFactorDesc">
                  <Input
                    type="text"
                    autosize={eleForm.disabled}
                    title={eleForm.data.essentialFactorDesc}
                    value={eleForm.data.essentialFactorDesc}
                    onChange={(e) => {
                      const newEleForm = { ...eleForm };
                      newEleForm.data.essentialFactorDesc = e.target.value;
                      setEleForm(newEleForm);
                    }}
                    autocomplete="off"
                    placeholder="描述"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="要素内容" prop="essentialFactorContent">
                  <Input
                    type="textarea"
                    autosize={eleForm.disabled}
                    disabled
                    title={eleForm.data.essentialFactorContent}
                    value={eleForm.data.essentialFactorContent}
                    onChange={(e) => {
                      const newEleForm = { ...eleForm };
                      newEleForm.data.essentialFactorContent = e.target.value;
                      setEleForm(newEleForm);
                    }}
                    autocomplete="off"
                    rows="3"
                    placeholder="要素内容"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </HatechDialog>
    </div>
  );
};

export default DocumentEditor;
