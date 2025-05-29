import {message} from 'antd'
import documentEditorService from '../services/documentEditorService'
import {

} from '../utils'

export const createDocumentEditor = (prefix) => {
    if(!prefix) {
        throw new Error('prefix is required')
    };

    const SET_LOADING = `${prefix}_SET_LOADING`;
    const SET_PLAN_ID = `${prefix}_SET_PLAN_ID`;
    const SET_TEMPLATE = `${prefix}_SET_TEMPLATE`;
    const SET_MODE = `${prefix}_SET_MODE`;
    const SET_CURRENT_STEP = `${prefix}_SET_CURRENT_STEP`;
    const SET_KEY_WORDS = `${prefix}_SET_KEY_WORDS`;
    const SET_EDITING_CONTENT = `${prefix}_SET_EDITING_CONTENT`;
    const SET_TREEDATA = `${prefix}_SET_TREEDATA`;
    const SET_ACTIVE_TREE_NODE = `${prefix}_SET_ACTIVE_TREE_NODE`;
    const SET_CONTENT_LIST = `${prefix}_SET_CONTENT_LIST`;
    const ADD_CONTENT_WRAPPER = `${prefix}_ADD_CONTENT_WRAPPER`;
    const EDIT_CONTENT_WRAPPER_TITLE = `${prefix}_EDIT_CONTENT_WRAPPER_TITLE`;
    const DELETE_CONTENT_WRAPPER = `${prefix}_DELETE_CONTENT_WRAPPER`;
    const ADD_CONTENT_FACTOR_ITEM = `${prefix}_ADD_CONTENT_FACTOR_ITEM`;
    const UPDATE_CONTENT_FACTOR_ITEM = `${prefix}_UPDATE_CONTENT_FACTOR_ITEM`;
    const SORTED_CONTENTS = `${prefix}_SORTED_CONTENTS`;
    const DELETE_YAOSU = `${prefix}_DELETE_YAOSU`;
    const SET_LOCK = `${prefix}_SET_LOCK`;
    const SET_MODAL = `${prefix}_SET_MODAL`;
    const SET_PREVIEW = `${prefix}_SET_PREVIEW`;

    // ACTIONS
    const actions = {
        setLoading: (loading) => ({type: SET_LOADING, payload: loading}),
        setPlanId: (planId) => ({type: SET_PLAN_ID, payload: planId}),
        setTemplate: (template) => ({type: SET_TEMPLATE, payload: template}),
        setMode: (mode) => ({type: SET_MODE, payload: mode}),
        setCurrentStep: (currentStep) => ({type: SET_CURRENT_STEP, payload: currentStep}),
        setKeyWords: (keyWords) => ({type: SET_KEY_WORDS, payload: keyWords}),
        setEditingContent: (editingContent) => ({type: SET_EDITING_CONTENT, payload: editingContent}),
        setTreeData: (treeData) => ({type: SET_TREEDATA, payload: treeData}),
        setActiveTreeNode: (activeTreeNode) => ({type: SET_ACTIVE_TREE_NODE, payload: activeTreeNode}),
        setContentList: (contentList) => ({type: SET_CONTENT_LIST, payload: contentList}),
        addContentWrapper: (contentWrapper) => ({type: ADD_CONTENT_WRAPPER, payload: contentWrapper}), 
        editContentWrapperTitle: (contentWrapper) => ({type: EDIT_CONTENT_WRAPPER_TITLE, payload: contentWrapper}),
        deleteContentWrapper: (contentWrapper) => ({type: DELETE_CONTENT_WRAPPER, payload: contentWrapper}),
        addYaosu: (contentFactorItem) => ({type: ADD_CONTENT_FACTOR_ITEM, payload: contentFactorItem}),
        updateYaosu: (contentFactorItem) => ({type: UPDATE_CONTENT_FACTOR_ITEM, payload: contentFactorItem}),
        sortedYaosu: (contentFactorItem) => ({type: SORTED_CONTENTS, payload: contentFactorItem}),
        deleteYaosu: (contentFactorItem) => ({type: DELETE_YAOSU, payload: contentFactorItem}),
        setLock: (lock) => ({type: SET_LOCK, payload: lock}),
    }

    // 异步actions
    const asyncActions = {
       // 获取关键词
       getKeyWords: (planId) => async (dispatch) => {
           try{
            const response = await documentEditorService.getKeyWords(planId);
            if(response && response.success) {
                dispatch(actions.setKeyWords(response.data));
            } else {
                message.error(response.message);
           }
        } catch(error) {
            message.error(error.message);
        }
       },
       // 预览
       setPreviewAsync: (params) => async (dispatch) => {
          const  { isPreview, planId, templateId } = params;
          try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.setPreview({isPreview, planId, templateId});
            if(response && response.success) {
                dispatch(actions.setPreview(response.data));
            } else {
                message.error(response.message);
           } 
          } catch(error) {
            message.error(error.message); 
          } finally {
            dispatch(actions.setLoading(false));
          }
       },
       // 获取左侧树
       getTreeDataAsync: (params) => async (dispatch) => {
        const { planId, templateId } = params;
        try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.getTreeData({planId, templateId});
            if(response && response.success) {
                dispatch(actions.setTreeData(response.data)); 
            } else {
                message.error(response.message);
            }
        } catch(error) {
            
        } finally {
            dispatch(actions.setLoading(false));
        }
       },
       // 新增左侧目录
       addTreeNodeAsync: (params) => async (dispatch, getState) => {
           const { documentEditorState} = getState()[prefix];
           const { planId, isTemplate} = documentEditorState
           try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.addTreeNode({...params, planId, isTemplate});
            if(response && response.success) {
                dispatch(actions.setTreeData(response.data));
                // 内容区域同步刷新
                dispatch(asyncActions.getContentListAsync({planId, templateId: params.templateId}));
                message.success('新增成功'); 
            } else {
                message.error(response.message);
            }
           } catch(error) {
            message.error(error.message); 
           } finally {
            dispatch(actions.setLoading(false));
           }
       },
       // 获取内容列表
       getContentListAsync: (params) => async (dispatch, getState) => {
           const { documentEditorState} = getState()[prefix];
           const { planId, isTemplate} = documentEditorState
           try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.getContentList({...params, planId, isTemplate});
            if(response && response.success) {
                dispatch(actions.setContentList(response.data)); 
            } else {
                message.error(response.message);
            }
           } catch(error) {
            message.error(error.message); 
           } finally {
            dispatch(actions.setLoading(false));
            }
       },
       // 添加要素
       addYaosuAsync: (params) => async (dispatch, getState) => {
           const { documentEditorState} = getState()[prefix];
           const { planId, isTemplate} = documentEditorState
           try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.addYaosu({...params, planId, isTemplate});
            if(response && response.success) {
                dispatch(actions.addYaosu(response.data));
                message.success('新增成功'); 
            } else {
                message.error(response.message);
            }
           } catch(error) {
            message.error(error.message); 
           } finally {
            dispatch(actions.setLoading(false));
           } 
       },
       // 排序后更新contens
       sortedContentsAsync: (params) => async (dispatch, getState) => {
           const { documentEditorState} = getState()[prefix];
           const { planId, isTemplate} = documentEditorState
           const { oldContents, ...restParams } = params 
           dispatch(actions.sortedYaosu(restParams));
           try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.sortedContents({...restParams, oldContents, planId, isTemplate});
            if(response && response.success) {
                message.success('排序成功'); 
            } else {
                message.error(response.message);
                dispatch(actions.sortedYaosu({contents: oldContents, id: restParams.id}));
            } 
           } catch(error) {
            message.error(error.message); 
            dispatch(actions.sortedYaosu({contents: oldContents, id: restParams.id}));
           } finally {
            dispatch(actions.setLoading(false));
            }
       },
       // 删除要素
       deleteYaosuAsync: (params) => async (dispatch, getState) => {
           const { documentEditorState} = getState()[prefix];
           const { planId, isTemplate} = documentEditorState
           try{
            dispatch(actions.setLoading(true));
            const response = await documentEditorService.deleteYaosu({...params, planId, isTemplate});
            if(response) {
                message.success('ccc');
                dispatch(actions.deleteYaosu(params));
            }
           }  catch(error) {

           }finally {
            dispatch(actions.setLoading(false))
           }
       },
       // 保存图片
       uploadImageAsync: async(params) => {

       }
    };

    // reducer
    const initialState = {
        loading: false,
        planId: undefined,
        isTemplate: 1,
        currentStep: 0,
        mode: 'add',
        isPreview: false,
        editingContent: null,
        keyWords: [],
        treeData: [],
        activeTreeNode: null,
        modal: null,
    }
}