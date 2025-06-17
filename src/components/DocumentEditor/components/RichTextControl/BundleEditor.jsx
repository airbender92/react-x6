import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import { Upload, Modal, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons';
import {Editor} from '@tinymce/tinymce-react';
import { content_style, customImage, customLink } from './constant'

import "tinymce/tinymce";
import "tinymce/models/dom/model";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import "tinymce/skins/ui/oxide/content.min.css";

import "tinymce/plugins/autoresize";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/table";
import "tinymce/plugins/code";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autoresize";
import "./plugins/tinymce-mention"

import styles from './index.less';

const plugins = [
  "advlist autolink lists link image charmap print preview anchor",
  "searchreplace visualblocks code fullscreen",
  "insertdatetime media table paste code help wordcount autoresize mention"
];

const toolbar = [
  "undo redo | styleselect | bold italic backcolor",
  "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
  "table customImage customLink",
]


const defaultInitConfig = {
    plugins,
    toolbar,
    content_style,
    inline: true,
    autoresize_min_height: 200,
    height: 'auto',
    width: '100%',
    menubar: false,
    statusbar: false,
    language: 'zh_CN',
    contextmenu: false,
}

const BundleEditor = forwardRef((props, ref) => {
  const {init: customInit, keyWords, editorActions, ...rest} = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const editorRef = useRef(null);

  // 下载处理函数
  const handleDownload = async (event) => {
    event.preventDefault();
    console.log('下载触发:', event);
    
    // 获取点击元素的文件URL（假设通过data属性存储）
    const fileUrl = event.target.closest('[data-file-url]')?.dataset.fileUrl;
    if (!fileUrl) return;
    
    try {
      // 调用下载逻辑
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 从data属性获取文件名
      const filename = event.target.closest('[data-file-name]')?.dataset.fileName || '下载文件';
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
    } catch (error) {
      message.error(`下载失败: ${error.message}`);
      console.error('下载错误:', error);
    }
  };
  
  const handleSetup = (editor) => {
    editor.options.register('mentionOptions', {processor: 'object[]', default: keyWords});
    editor.ui.register('custom-image', customImage);
    editor.ui.register.addButton('customImage', {
        icon: 'custom-image',
        tooltip: '插入图片',
        onAction: () => {
            setUploadType('image');
            setIsModalOpen(true);
        }
    });

     // 监听编辑器内的点击事件（关键步骤）
    editor.on('click', (e) => {
      // 检查点击的元素是否是我们插入的可下载元素
      const target = e.target;
      if (target && target.hasAttribute('data-is-downloadable')) {
        handleDownload({
          preventDefault: () => {},
          target: target,
          stopPropagation: () => {}
        });
        e.stopPropagation(); // 阻止事件冒泡
      }
    });
    
  }

  const mergedInit = {
    setup: handleSetup,
    ...defaultInitConfig,
    ...customInit,
  }

  const handleInserDom = (params, type) => {
    if(type === 'image') {
      editorRef.current.insertContent(`<img src="${params.url}" alt="${params.alt}" />`);
    }
    if(type === 'file') {
        // 插入带数据属性的可点击元素
      const insertHtml = `
        <span 
          data-is-downloadable="true"
          data-file-url="${fileUrl}"
          data-file-name="${file.name}"
          style="cursor: pointer;color:#0067de;text-decoration: underline;"
        >
          ${file.name}
        </span>
      `;
      
      editorRef.current.insertContent(insertHtml);
    }
  }


  const handleUpload = async({file, onSuccess, onError}) => {
    if(editorRef.current) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await editorActions.uploadFile(formData, uploadType);
            if (response && response.url) {
            handleInserDom(response, uploadType);
            onSuccess(response);
            setIsModalOpen(false);
            } else {
            throw new Error('上传失败');
            }
        } catch (error) {
            onError(error);
        }
    }
  }

  useEffect(() => {
   return () => {
      if (editorRef.current) {
        editorRef.current.remove();
      }
    };
  }, [keyWords, editorRef],);

  useImperativeHandle(ref, () => editorRef.current);


  const handleEditorChange = (content) => {
    setEditorValue(content);
    onChange && onChange(content);
  };

  return (
    <div className={styles.bundleEditor}>
         <Editor
        apiKey='no-api-key'
        onInit={(evt, editor) => editorRef.current = editor}
        onEditorChange={handleEditorChange}
        init={mergedInit}
        {...rest}
    />
    <Modal
        title={uploadType === 'image' ? '上传图片' : '上传文件'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose={true}
    >
        <Upload
            customRequest={handleUpload}
            showUploadList={false}
            accept={uploadType === 'image' ? 'image/*' : '*'}
        >
            <Button icon={<UploadOutlined />} type="primary">
                {uploadType === 'image' ? '选择图片' : '选择文件'}
            </Button>
        </Upload>
    </Modal>
    </div>
   
  );
});
BundleEditor.displayName = 'BundleEditor';
export default BundleEditor;



