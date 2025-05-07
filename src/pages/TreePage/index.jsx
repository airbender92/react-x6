import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import CategoryTree from './CategoryTree';

const App = () => {
    const [activeNode, setActiveNode] = useState(null);
    const [contentList, setContentList] = useState([
        {
            title: '初始分类',
            key: '1',
            level: 1,
            parent: null,
            type: '通用类'
        }
    ]);

    const onSelectNode = (node) => {
        setActiveNode(node);
        const targetElement = document.getElementById(node.key);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

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

    return (
        <div style={{ display: 'flex' }}>
            <CategoryTree onSelectNode={onSelectNode} />
            <div style={{ width: '70%', padding: '16px' }}>
                {contentList.map(item => (
                    <div
                        key={item.key}
                        id={item.key}
                        style={{ marginLeft: `${item.level * 20}px` }}
                        className={activeNode && activeNode.key === item.key ? 'active-content' : ''}
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
    