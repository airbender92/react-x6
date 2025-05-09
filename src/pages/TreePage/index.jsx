import React, { useState } from 'react';
import CategoryTree from './CategoryTree';

const App = () => {
    const [activeNode, setActiveNode] = useState(null);
    const [treeData, setTreeData] = useState([/* 初始数据 */]); // 接收分类树数据

    // 扁平化分类树数据（保持原有逻辑）
    const flattenTree = (data) => {
        let result = [];
        data.forEach(item => {
            result.push(item);
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenTree(item.children));
            }
        });
        return result;
    };

    // 右侧内容基于扁平化数据生成
    const contentList = flattenTree(treeData);

    const onSelectNode = (node) => {
        setActiveNode(node);
        const targetElement = document.getElementById(node.key);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <CategoryTree 
                onSelectNode={onSelectNode}
                onTreeDataChange={setTreeData} // 同步分类树数据到 App
            />
            <div style={{ width: '70%', padding: '16px' }}>
                {contentList.map(item => (
                    <div
                        key={item.key}
                        id={item.key}
                        style={{ marginLeft: `${item.level * 20}px` }}
                        className={activeNode?.key === item.key ? 'active-content' : ''}
                    >
                        <h3>{item.title}</h3>
                        <p>类型: {item.type}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}; 

export default App;
    