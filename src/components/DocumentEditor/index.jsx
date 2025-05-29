import React, {useRef, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { Spin } from 'antd';
import DocumentContent from './DocumentContent';
import {CategoryTree} from './CategoryTree';
import { NavigationBlocker} from './NavigationBlocker'
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

     return (
        <div className={styles.documentEditorOuter}>
            <Spin spinning={loading} size='large'>
                <div className={`${styles.documentEditorWrapper}`}>
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
                </div>
            </Spin>
        </div> 
     )
}