import React, { useRef, forwardRef, useImperativeHandle, use } from 'react';
import { Empty } from 'antd';
import BundleEditor from './BundleEditor';

const RichTextControl = forwardRef((props, ref) => {

    const { mode, moduleContents, isEditing, editorActions, editorState } = props;
    const bundleEditorRef = useRef(null);
    const { keyWords, isTemplate, resetKey, toggle } = editorState
    const isEditable = mode !== 'view' && isEditing;

    const showEmpty = !moduleContents || moduleContents.length === 0;

    const getContent = () => {
        const editor = bundleEditorRef.current;
        if (editor) {
            const html = editor.getContent();
            const text = editor.getContent({ format: 'text' });
            return {
                html,
                text,
            };
        }
        return {
            html: moduleContents.html || '',
            text: '',
        };
    }

    // 先设置选区，再聚焦
    function getLastTextNode(element) {
        let node = element;
        while (node.lastChild) {
            node = node.lastChild;
            if (node.nodeType === 3 && node.textContent.trim() !== '') {
                return node;
            }
        }
        return node;
    }


    useEffect(() => {
        const editor = bundleEditorRef.current;
        if (editor) {
            const lastNode = getLastTextNode(editor.getBody());
            const range = editor.dom.createRng();

            if (lastNode.nodeType === 3) {
                range.setStart(lastNode, lastNode.textContent.length);
                range.setEnd(lastNode, lastNode.textContent.length);
            } else {
                range.selectNodeContents(lastNode);
                range.collapse(false);
            }

            editor.selection.setRng(range); // 先设置选区
            editor.focus(); // 再聚焦，避免闪烁
            editor.undoManager.clear();
            editor.undoManager.add();
        }
    }, [isEditable])

    useEffect(() => {
        const editor = bundleEditorRef.current;
        if (editor && subContentKey === resetKey) {
            editor.setContent(moduleContents.html);
        }
    }, [resetKey]);

    useImperativeHandle(ref, () => ({
        getContent,
        editorRef,
    }));

    if (showEmpty) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无内容" />;
    }

    return (
        <BundleEditor
            ref={bundleEditorRef}
            initialValue={moduleContents?.html}
            init={{
                height: 500,
                menubar: false,
                plugins: 'lists link image code',
                toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image code',
                images_upload_handler: editorActions.uploadFile,
                mentionOptions: keyWords,
            }}
            keyWords={keyWords}
            editorActions={editorActions}
            isEditable={isEditable}
            {...props}
        />
    );
})
export default RichTextControl;