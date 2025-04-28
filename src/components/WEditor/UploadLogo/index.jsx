import React, { useState } from 'react';
import { Upload, message, Button, Tooltip } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import './index.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('你只能上传 JPG/PNG 格式的图片!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        message.error('图片大小必须小于 5MB!');
    }
    return isJpgOrPng && isLt5M;
};

const UploadLogo = () => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [justifyContent, setJustifyContent] = useState('center');
    const [showButtons, setShowButtons] = useState(false);

    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        // if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        // }
    };

    const handleAlignmentChange = (newAlignment) => {
        setJustifyContent(newAlignment);
    };

    const getConfig = () => {
        return {
            imageUrl,
            justifyContent,
        };
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <UploadOutlined />}
            <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
    );

    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowButtons(true)}
            onMouseLeave={() => setShowButtons(false)}
        >
            <Upload
                name="logo"
                listType="picture-card"
                className={`avatar-uploader ${justifyContent}`}
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="logo"
                        style={{ width: '100%' }}
                    />
                ) : (
                    uploadButton
                )}
            </Upload>
            {showButtons && (
                <div style={{ position: 'absolute', bottom: -30, left: 0, right: 0, textAlign: 'center' }}>
                    <Tooltip title="左对齐">
                        <Button onClick={() => handleAlignmentChange('flex-start')}>左对齐</Button>
                    </Tooltip>
                    <Tooltip title="居中对齐">
                        <Button onClick={() => handleAlignmentChange('center')}>居中</Button>
                    </Tooltip>
                    <Tooltip title="右对齐">
                        <Button onClick={() => handleAlignmentChange('flex-end')}>右对齐</Button>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};

export default UploadLogo;    