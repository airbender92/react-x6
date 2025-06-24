import React, {useRef, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { Spin } from 'antd';
import DocumentContent from './DocumentContent';
import {CategoryTree} from './CategoryTree';
import { NavigationBlocker} from './NavigationBlocker'
import BtnGroups from './components/BtnGroups'
import styles from './styles.module.css';

const DocumentEditor = (props) => {
    const documentContentRef = useRef();
    const dispatch = useDispatch();
    const { 
        editorActions,
        editorState,
     } = props;
     const {
        loading,
        planId,
        mode,
        isTemplate,
        currentStep,
        treeData,
        activeTreeNode,
        contentList,
     } = editorState;

     const onSelectNode = (node) => {
       if(documentContentRef.current){
        documentContentRef.current.handleTreeSelect(node);
       }
     }

     useEffect(() => {
        if(planId) {
            dispatch(editorActions.getTreeDataAsync({relId: planId, isTemplate: isTemplate}));
            dispatch(editorActions.getContentList({relId: planId, isTemplate: isTemplate}));
        }
     }, [dispatch, planId, isTemplate])

     return (
        <div className={styles.documentEditorOuter}>
            <Spin spinning={loading} size='large'>
                <NavigationBlocker when={mode !== 'view'} />
                <div className={`${styles.documentEditorWrapper} ${isTemplate ? '' : styles.plan}`}>
                    <div className={styles.left}>
                        <CategoryTree
                            dispatch={dispatch}
                            editorActions={editorActions}
                            treeData={treeData}
                            activeTreeNode={activeTreeNode}
                            mode={mode}
                            editorState={editorState}
                            onSelectNode={onSelectNode}
                        />
                    </div>
                    <DocumentContent 
                        ref={documentContentRef}
                        dispatch={dispatch}
                        editorActions={editorActions}
                        editorState={editorState}
                        treeData={treeData}
                        activeTreeNode={activeTreeNode}
                        contentList={contentList}
                    />
                </div>
                {
                    !isTemplate &&
                    <BtnGroups 
                        dispatch={dispatch}
                        editorActions={editorActions}
                        editorState={editorState}
                    />
                }
            </Spin>
        </div> 
     )
}

export default DocumentEditor;