import React, { useState, createRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client'; 
import TableSelection from './TableSelection';
import EditorCell from './EditorCell';

const ParentComponent = () => {
    const customTableRef = createRef();
    const MIN_WIDTH = '80px';
    const MIN_HEIGHT = '30px';

    const onCreateTable = (rows, cols) => {
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse'; // 合并边框
        table.style.border = '1px solid #ccc'; // 表格整体边框

        const tbody = document.createElement('tbody');

        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('td');
                cell.style.minWidth = MIN_WIDTH;
                cell.style.minHeight = MIN_HEIGHT;
                cell.style.border = '1px solid #ccc'; // 单元格边框
                const editorCell = React.createElement(EditorCell);
                const root = ReactDOM.createRoot(cell);
                root.render(editorCell);
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        if (customTableRef.current) {
            customTableRef.current.innerHTML = '';
            customTableRef.current.appendChild(table);
            // 监听单元格内容变化
            const rowsElements = table.querySelectorAll('tr');
            rowsElements.forEach((row) => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell) => {
                    const observer = new MutationObserver(() => {
                        adjustRowHeight(row);
                    });
                    observer.observe(cell, { childList: true, subtree: true });
                });
            });
        }
    };

    const adjustRowHeight = (row) => {
        const cells = row.querySelectorAll('td');
        let maxHeight = 0;
        cells.forEach((cell) => {
            const cellHeight = cell.getBoundingClientRect().height;
            if (cellHeight > maxHeight) {
                maxHeight = cellHeight;
            }
        });
        cells.forEach((cell) => {
            cell.style.height = `${maxHeight}px`;
        });
    };

    return (
        <div>
            <TableSelection onCreateTable={onCreateTable} />
            <div ref={customTableRef}></div>
        </div>
    );
};

export default ParentComponent;    