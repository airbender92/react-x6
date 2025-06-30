import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import { Upload, Modal, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons';
import {Editor} from '@tinymce/tinymce-react';
import { getFileExtension, allowedTypes, acceptFileExtensions} from '@/utils/fileUtil'
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
import "./plugins/tinymce-hide-table-colgroup"
import "./plugins/tinymce-link"

import styles from './index.less';
import { useDicContext } from '../../DicContext';

const plugins = [
  'advlist',
  'autolink',
  'lists',
  'link',
  'image',
  'charmap',
  'preview',
  'mention',
  'searchreplace',
  'visualblocks',
  'table',
  'autoresize',
  'customLink'
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
    promotion: false,
    menubar: false,
    statusbar: false,
    language: 'zh_CN',
    inline_boundaries_selector: 'a[href],code,b,i,em,strong,del,ins',
    contextmenu: "customLink customImage | inserttable | cell row column deletetable",
}

const BundleEditor = forwardRef((props, ref) => {
  const {init: customInit, containerId, keyWords, editorActions, onChange, ...rest} = props;

  const [editorReady, setEditorReady] = useState(false);
  const [uploadType, setUploadType] = useState('img'); // img | file
  const bundleEditorRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef= useRef(null);

  const {dicObj} = useDicContext();
  const FILE = dicObj?.FILE || {};

  // MB单位
  const maxImageSize = FILE?.find(item => item.dicCode === 'IMAGE')?.dicCount || 5; // 默认5MB
  const maxAttachmentSize = FILE?.find(item => item.dicCode === 'ATTACH')?.dicCount || 5; // 默认5MB

  const FILE_VALIDATION = {
    img: {
      maxSize: maxImageSize * 1024 * 1024, // 转换为字节
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      errorMsg: `图片大小不能超过 ${maxImageSize}MB，支持的格式有：${allowedTypes.join(', ')}`
    },
    file:{
      maxSize: maxAttachmentSize * 1024 * 1024, // 转换为字节
      allowedTypes: acceptFileExtensions,
      errorMsg: `文件大小不能超过 ${maxAttachmentSize}MB，支持的格式有：${acceptFileExtensions.join(', ')}`
    }
  };

  // 下载处理函数
  const handleDownload = async (event) => {
    event.preventDefault();
    const fileName = event.target.getAttribute('data-file-name')?.dataset.fileName;
    if(!fileName) {
      console.error('文件名不存在');
      return;
    }
    try{
      const extension = getFileExtension(fileName);
      await editorActions.downloadAsync({fileName, extension});
    }catch(error) {
      console.error('下载文件失败:', error);
    }
  };
  
  const handleSetup = (editor) => {
    editor.options.register('mentionOptions', {processor: 'object[]', default: keyWords});
    editor.ui.register('custom-image', customImage);
    editor.ui.register('custom-link', customLink);

    editor.ui.register.addButton('customImage', {
        icon: 'custom-image',
        tooltip: '插入图片',
        onAction: () => {
            setUploadType('img');
            if(fileInputRef.current) {
              fileInputRef.current.click();
            }
        },
    });

       editor.ui.register.addButton('customLink', {
        icon: 'custom-link',
        tooltip: '插入链接',
        onAction: () => {
            setUploadType('file');
            if(fileInputRef.current) {
              fileInputRef.current.click();
            }
        },
    });

    editor.ui.register.addMenuItem('customImage', {
        icon: 'custom-image',
        tooltip: '插入图片',
        onAction: () => {
            setUploadType('img');
            if(fileInputRef.current) {
              fileInputRef.current.click();
            }
        },
    });

       editor.ui.register.addMenuItem('customLink', {
        icon: 'custom-link',
        tooltip: '插入链接',
        onAction: () => {
            setUploadType('file');
            if(fileInputRef.current) {
              fileInputRef.current.click();
            }
        },
    });

    // 编辑模式下
    if(!rest.disabled) {
      // 监听编辑器内的点击事件
      editor.on('click', e => {
        const target = e.target;
        if(target && target.hasAttribute('data-is-downloadable')){
          handleDownload({
            preventDefault: () => {},
            target: target,
            stopPropagation: () => {}
          });
          e.stopPropagation()
        }
      })
    }
    
  }

  const mergedInit = {
    setup: handleSetup,
    ...defaultInitConfig,
    ...customInit,
  }

  const handleInserDom = (params, type) => {
    if(type === 'img') {
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
  }, [keyWords]);

  useImperativeHandle(ref, () => {
    return editorRef.current;
  }, [editorReady]);


  const handleEditorChange = (content) => {
    setEditorValue(content);
    onChange && onChange(content);
  };

  return (
    <div className={styles.bundleEditor}>
         <Editor
        apiKey='no-api-key'
        onInit={(evt, editor) => {
          editorRef.current = editor;
          setEditorReady(true);
        }}
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



