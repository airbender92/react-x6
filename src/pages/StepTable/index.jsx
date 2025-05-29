import React from 'react';


const SvgBackgroundComponent = ({
  bgColor,
  width = '200px',
  height = '100px',
  children
}) => {
  // 编码 SVG 为 Data URL，支持动态颜色
  const svgDataUrl = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
      <!-- 使用三角形占满整个 viewBox -->
      <path d="M0 0 L400 0 L400 200 L0 200 Z" 
            stroke="black" stroke-width="1" fill="#3e75ff" />
      
      <!-- 可选：添加装饰元素，展示如何在占满的基础上添加细节 -->
      <path d="M0 0 L400 200 M400 0 L0 200" 
            stroke="white" stroke-width="2" stroke-dasharray="10,5" />
    </svg>
  `);

  const backgroundStyle = {
    backgroundImage: `url("data:image/svg+xml,${svgDataUrl}")`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width,
    height
  };

  return (
    <div style={backgroundStyle}>
      hello
    </div>
  );
};

export default SvgBackgroundComponent;    