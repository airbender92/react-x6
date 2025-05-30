import React, {useRef, forwardRef, useImperativeHandle, use} from 'react';
import { Empty } from 'antd';
import BundleEditor from './BundleEditor';

const RichTextControl = forwardRef((props, ref) => {

    const {mode, moduleContents, isEditing, editorActions, editorState } = props;
    const editorRef = useRef(null);
    const { keyWords} = editorState
    const isEditable = mode === 'edit' || mode === 'create';
    const showEmpty = !moduleContents || moduleContents.length === 0;

    const getContent = () => {
        if (editorRef.current) {
            const html = editorRef.current.getContent();
            const text = editorRef.current.getContent({ format: 'text' });
            return {
                html,
                text,
            };
        }
        return {
            html: '',
            text: '',
        };
    }

    useImperativeHandle(ref, () => ({
        getContent,
        editorRef,
    }));

    if(showEmpty) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无内容" />;
    }

    return (
        <BundleEditor
            ref={editorRef}
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