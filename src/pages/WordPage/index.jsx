import React, { useRef, useEffect } from 'react';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import image from '@/assets/images/img.png'

const ExportComponent = () => {
    const contentRef = useRef(null);
    const [htmlTemplate, setHtmlTemplate] = React.useState('');

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
                orientation: 'portrait',
                margins: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                    header: 720,
                    footer: 720,
                    gutter: 0
                }
            });
            saveAs(converted, 'exported.docx');
        }
    };

    return (
        <div>
            <div ref={contentRef}>
                <h1 style={{ fontSize: '24px', fontFamily: 'Arial' }}>这是居中标题</h1>
                <p style={{ fontSize: '16px', fontFamily: 'Arial' }}>这是缩进段落，这里可以包含更多的文本和元素。</p>
                <table border="1" style={{ fontSize: '14px', fontFamily: 'Arial' }}>
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
                {/* 可以添加图片等其他元素，但要确保图片是 base64 格式 */}
                <img src={image} alt="示例图片" />
            </div>
            <button onClick={handleExport}>导出为 DOCX</button>
        </div>
    );
};

export default ExportComponent;