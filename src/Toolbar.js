import React from 'react';

const Toolbar = ({ 
    onZoom, 
    onTranslate, 
    onToJSON, 
    onZoomFit, 
    onCenterContent,
    onProp,
    onAttr 
}) => {
    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button onClick={() => onZoom(-0.1)}>缩小画布</button>
            <button onClick={() => onZoom(0.1)}>放大画布</button>
            <button onClick={() => onZoomFit()}>适中</button>
            <button onClick={() => onCenterContent()}>居中</button>
            <button onClick={() => onTranslate(80, 40)}>平移画布</button>
            <button onClick={onToJSON}>导出</button>
            <button onClick={onProp}>prop</button>
            <button onClick={onAttr}>attr</button>
        </div>
    );
};

export default Toolbar;