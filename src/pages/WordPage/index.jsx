import React, { useRef, useEffect, useState } from 'react';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import image from '@/assets/images/img.png';

const ExportComponent = () => {
    const contentRef = useRef(null);
    const [htmlTemplate, setHtmlTemplate] = useState('');
    const [orientation, setOrientation] = useState('portrait');
    const [margins, setMargins] = useState({
        top: 1440,
        right: 1440,
        bottom: 1440,
        left: 1440,
        header: 720,
        footer: 720,
        gutter: 0
    });
    const [exportMessage, setExportMessage] = useState('');

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await fetch('/document.html');
                const text = await response.text();
                setHtmlTemplate(text);
            } catch (error) {
                console.error('Error fetching HTML template:', error);
            }
        };
        fetchTemplate();
    }, []);

    const convertImagesToBase64 = async (element) => {
        const images = element.querySelectorAll('img');
        for (let img of images) {
            try {
                const response = await fetch(img.src);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    img.src = reader.result;
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error converting image to base64:', error);
            }
        }
    };

    const handleExport = async () => {
        if (contentRef.current && htmlTemplate) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlTemplate;
            const dynamicContentDiv = tempDiv.querySelector('#dynamic-content');

            // 复制内容并处理图片
            const clonedContent = contentRef.current.cloneNode(true);
            await convertImagesToBase64(clonedContent);

            dynamicContentDiv.appendChild(clonedContent);

            const updatedHtml = tempDiv.innerHTML;
            const converted = htmlDocx.asBlob(updatedHtml, {
                orientation,
                margins
            });
            saveAs(converted, 'exported.docx');
            setExportMessage('导出成功！');
            setTimeout(() => {
                setExportMessage('');
            }, 3000);
        }
    };

    const handleOrientationChange = (e) => {
        setOrientation(e.target.value);
    };

    const handleMarginChange = (e) => {
        const { name, value } = e.target;
        setMargins((prevMargins) => ({
            ...prevMargins,
            [name]: parseInt(value)
        }));
    };

    return (
        <div>
            <div>
                <label>页面方向：</label>
                <input
                    type="radio"
                    name="orientation"
                    value="portrait"
                    checked={orientation === 'portrait'}
                    onChange={handleOrientationChange}
                /> 纵向
                <input
                    type="radio"
                    name="orientation"
                    value="landscape"
                    checked={orientation === 'landscape'}
                    onChange={handleOrientationChange}
                /> 横向
            </div>
            <div>
                <label>页面边距：</label>
                <input
                    type="number"
                    name="top"
                    value={margins.top}
                    onChange={handleMarginChange}
                    placeholder="顶部边距"
                />
                <input
                    type="number"
                    name="right"
                    value={margins.right}
                    onChange={handleMarginChange}
                    placeholder="右侧边距"
                />
                <input
                    type="number"
                    name="bottom"
                    value={margins.bottom}
                    onChange={handleMarginChange}
                    placeholder="底部边距"
                />
                <input
                    type="number"
                    name="left"
                    value={margins.left}
                    onChange={handleMarginChange}
                    placeholder="左侧边距"
                />
            </div>
            <div ref={contentRef}>
                <h1 style={{ fontSize: '24px', fontFamily: 'Arial' }}>这是居中标题</h1>
                <p style={{ fontSize: '16px', fontFamily: 'Arial' }}>这是缩进段落，这里可以包含更多的文本和元素。</p>
                <table border="1" style={{ fontSize: '14px', fontFamily: 'Arial', width: '500px', height: '200px' }}>
                    <thead>
                        <tr>
                            <th>列1</th>
                            <th>列2</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>数据1</td>
                            <td>数据2</td>
                        </tr>
                        <tr>
                            <td>数据3</td>
                            <td>数据4</td>
                        </tr>
                    </tbody>
                </table>
                <ul>
                    <li>无序列表项1</li>
                    <li>无序列表项2</li>
                </ul>
                <ol>
                    <li>有序列表项1</li>
                    <li>有序列表项2</li>
                </ol>
                <img src={image} alt="示例图片" />
            </div>
            <button onClick={handleExport}>导出为 DOCX</button>
            {exportMessage && <p style={{ color: 'green' }}>{exportMessage}</p>}
        </div>
    );
};

export default ExportComponent;