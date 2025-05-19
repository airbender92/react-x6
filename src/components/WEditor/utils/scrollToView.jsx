import React, { useState, useEffect, useRef } from 'react';
import { Tree, Card } from 'antd';

const { TreeNode } = Tree;

const dataSource = [
  {
    title: 'Node 1',
    key: '1',
    children: [
      { title: 'Child Node 1.1', key: '1-1' },
      { title: 'Child Node 1.2', key: '1-2' },
    ],
  },
  {
    title: 'Node 2',
    key: '2',
    children: [
      { title: 'Child Node 2.1', key: '2-1' },
      { title: 'Child Node 2.2', key: '2-2' },
    ],
  },
  {
    title: 'Node 3',
    key: '3',
    children: [
      { title: 'Child Node 3.1', key: '3-1' },
      { title: 'Child Node 3.2', key: '3-2' },
    ],
  },
];

const generateContent = (key) => (
  <Card title={`Content for ${key}`} style={{ marginBottom: 24 }}>
    <p>Scroll this content area to update the tree selection.</p>
    <div style={{ height: 300 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <p key={i}>{`Line ${i + 1} of content for ${key}`}</p>
      ))}
    </div>
  </Card>
);

const TreeScrollSync = () => {
  const [selectedKeys, setSelectedKeys] = useState(['1']);
  const parentRef = useRef(null); // 父容器 ref
  const contentItemsRef = useRef({});
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const parentElement = parentRef.current;
    if (!parentElement) return;

    const handleScroll = () => {
      isScrollingRef.current = true;
      requestAnimationFrame(() => {
        const parentRect = parentElement.getBoundingClientRect();
        const parentTop = parentRect.top;
        const parentBottom = parentRect.bottom;
        const parentHeight = parentRect.height;

        let closestKey = null;
        let smallestDistance = Infinity;
        let firstInViewKey = null;
        let firstInViewTop = Infinity;

        Object.entries(contentItemsRef.current).forEach(([key, element]) => {
          if (!element) return;
          
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top;
          const elementHeight = rect.height;
          const elementMiddle = elementTop + elementHeight / 2;
          
          // 计算元素与父容器顶部的距离
          const distanceToParentTop = Math.abs(elementMiddle - parentTop);
          
          // 找到第一个顶部在父容器内的元素
          if (elementTop >= parentTop && elementTop < firstInViewTop) {
            firstInViewTop = elementTop;
            firstInViewKey = key;
          }
          
          // 如果元素在父容器内且距离更小，则更新选中项
          if (elementTop <= parentBottom && elementTop + elementHeight >= parentTop && distanceToParentTop < smallestDistance) {
            smallestDistance = distanceToParentTop;
            closestKey = key;
          }
        });

        // 如果没有元素完全在父容器内，使用第一个顶部在父容器内的元素
        const keyToSelect = closestKey || firstInViewKey;
        
        if (keyToSelect && keyToSelect !== selectedKeys[0]) {
          setSelectedKeys([keyToSelect]);
        }
        
        isScrollingRef.current = false;
      });
    };

    parentElement.addEventListener('scroll', handleScroll);
    return () => parentElement.removeEventListener('scroll', handleScroll);
  }, [selectedKeys]);

  // 防止因选中项变化导致的滚动位置重置
  useEffect(() => {
    if (isScrollingRef.current) return;
    
    const selectedElement = contentItemsRef.current[selectedKeys[0]];
    if (selectedElement && parentRef.current) {
      // 平滑滚动到选中元素
      selectedElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [selectedKeys]);

  const renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode 
          title={item.title} 
          key={item.key}
        />
      );
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 256, borderRight: '1px solid #e8e8e8', height: '100%', overflow: 'auto' }}>
        <Tree
          selectedKeys={selectedKeys}
          onSelect={(keys) => {
            if (!isScrollingRef.current) {
              setSelectedKeys(keys);
            }
          }}
          defaultExpandAll
        >
          {renderTreeNodes(dataSource)}
        </Tree>
      </div>
      <div 
        ref={parentRef} // 指定的父容器
        style={{ flex: 1, overflow: 'auto', padding: 24 }}
      >
        {dataSource.flatMap(item => [
          <div 
            key={item.key}
            ref={el => contentItemsRef.current[item.key] = el}
          >
            {generateContent(item.key)}
          </div>,
          ...(item.children || []).map(child => (
            <div 
              key={child.key}
              ref={el => contentItemsRef.current[child.key] = el}
            >
              {generateContent(child.key)}
            </div>
          ))
        ])}
      </div>
    </div>
  );
};

export default TreeScrollSync;  