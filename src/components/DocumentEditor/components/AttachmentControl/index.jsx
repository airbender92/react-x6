import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle
} from 'react'
import {Button, Popconfirm, Upload, message, Empty, List, Space} from 'antd'
import {
    UploadOutlined,
    PaperClipOutlined,
    FileExcelOutlined,
    FileMarkdownOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FilePptOutlined,
    FileTextOutlined
} from '@ant-design/icons'

import { getFileExtension, allowedTypes, acceptFileExtensions } from '@/utils/fileUtil'
import styles from './index.less'

const IconMap = {
    normal: <PaperClipOutlined />,
    pdf: <FilePdfOutlined />,
    xls: <FileExcelOutlined />,
    xlsx: <FileExcelOutlined />,
    doc: <FileWordOutlined />,
    docx: <FileWordOutlined />,
    ppt: <FilePptOutlined />,
    pptx: <FilePptOutlined />,
    txt: <FileTextOutlined />,
    md: <FileMarkdownOutlined />,
    csv: <FileExcelOutlined />
}

const rules = {
    maxSize: 10 * 1024 * 1024,
    allowedTypes,
    errorMsg: '请上传小于10MB的PDF/Word/Excel/PPowerPoint/CSV/TXT/Markdown文件'
}

const validateFile = (file) => {
    if(file.size > rules.maxSize) {
        message.error(rules.errorMsg);
        return false;
    }
    if(!file.type) {
        const extension = getFileExtension(file.name);
        if(acceptFileExtensions.findIndex(item => item === `.${extension}`) === -1) {
            message.error(rules.errorMsg)
            return false;
        }
    }

    if(file.type && !rules.allowedTypes.includes(file.type)) {
        message.error(rules.errorMsg);
        return false;
    }
    return true;
};

const AttachmentControl = forwardRef((props, ref) => {
    const {
        moduleStatus,
        mode,
        isEditing,
        isTemplate,
        moduleContents,
        temModuleContents,
        editorActions,
    } = props;
    const [fileList, setFileList] = useState([]);

    const isEditable = isEditing && mode !== 'view';
    const hideUploadBlock = !isEditable;

    useEffect(() => {
        if(moduleContents.fileList?.length) {
            setFileList(moduleContents.fileList)
        }
    }, [moduleContents?.fileList])

    /**
     * 自定义上传
     */
    const customRequest = async({file, onSuccess, onError}) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const result = await editorActions.uploadAsync(formData);
        if(result) {
            const formData = {success: true, url: result.savedFileUrl, fileName: file.name, fileSize: file.size }
            setLoading(false);
            onSuccess(formData, file);
            setFileList(prevFileList => [
                ...prevFileList.filter(f => f.id !== file.id),
                {
                    ...result,
                    name: file.name,
                    savedFileName: result.savedFileName,
                    url: result.savedFileUrl,
                    status: 'done',

                }
            ])
        } else {
            setLoading(false)
            onError(error)
            message.error('上传失败')
        }

        return {
            abort(){
                setLoading(false);
                message.info('上传已取消')
            }
        }
    }

    const  handleRemove = async(file) => {
        const newFileList = fileList.filter(item => item.savedFileName !== file.savedFileName);
        setFileList(newFileList)
        return true;
    }

    const handleDownload = async(file) => {
        const {savedFileName} = file;
        try{
            const extension = getFileExtension(savedFileName)
            await editorActions.downloadAsync({fileName: savedFileName, extension})
        }catch(error) {
            message.warning('下载失败')
        }
    }

    const getContents = () => {
        return {
            fileList
        }
    }

    const renderFileList = () => {
        if(!fileList?.length) return ''
        return (
            <List
            dataSource={fileList}
            renderItem={file => {
                const extension = getFileExtension(file.name);
                const Icon = IconMap[extension] || IconMap.normal;
                return (
                    <List.Item
                        actions={[
                            file.status === 'done' && (
                                <Space>
                                    <Button type='link' onClick={() => handleDownload(file)}>下载</Button>
                                    {
                                        isEditable &&
                                        <Popconfirm
                                            title="是否删除"
                                            onConfirm={() => handleRemove(file)}
                                        >
                                            <Button type='link' danger>删除</Button>
                                        </Popconfirm>
                                    }
                                </Space>
                            )
                        ]}
                    ></List.Item>
                )
            }}
            >
                <List.Item.Meta
                title={<span style={{cursor: 'pointer', color: '#0067de'}}>{file.name}</span>}
                avatar={<span style={{fontSize: 16, color: '#0067de'}}>{Icon}</span>}
                ></List.Item.Meta>
            </List>
        )
    }

    const uploadButton = (
        <Button type="primary" title="上传" icon={<UploadOutlined />}>上传附件</Button>
    )

    useImperativeHandle(ref, () => {
        return {
            getContents
        }
    })

    return (
        <div className={`${styles.attachmentControl} ${fileList?.length ? '' : styles.isEmpty}`}>
            <Upload 
                name='attachment'
                accept={acceptFileExtensions.join(',')}
                disabled={!isEditable}
                fileList={fileList}
                customRequest={customRequest}
                showUploadList={false}
                beforeUpload={validateFile}
                onPreview={null}
                onRemove={null}
            >
                {fileList?.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : ''}
                {!hideUploadBlock && uploadButton}
            </Upload>
            {renderFileList()}
        </div>
    )

})

export default AttachmentControl;