/**
 * 通过监听mousedown 指定拖拽手柄
 */

import { Table } from 'antd';
import update from 'immutability-helper';
import React, { useCallback, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const type = 'DraggableBodyRow';

const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
    const ref = useRef(null);
    const [{ isOver, dropClassName }, drop] = useDrop({
        accept: type,
        collect: (monitor) => {
            const { index: dragIndex } = monitor.getItem() || {};
            if (dragIndex === index) {
                return {};
            }
            return {
                isOver: monitor.isOver(),
                dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
            };
        },
        drop: (item) => {
            moveRow(item.index, index);
        },
    });

    let canDrag = false;
    const [, drag] = useDrag({
        type,
        item: {
            index,
        },
        canDrag: () => canDrag,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            canDrag = false;
        },
    });

    const handleDragStart = (e) => {
        const handle = e.target.closest('.drag-handle');
        if (handle) {
            canDrag = true;
            drag(ref.current);
        }
    };

    drop(drag(ref));

    return (
        <tr
            ref={ref}
            className={`${className}${isOver ? dropClassName : ''}`}
            style={{
                ...style,
            }}
            onMouseDown={handleDragStart}
            {...restProps}
        >
            <td>
                <span className="drag-handle" style={{ cursor: 'move' }}>
                    {/* 这里可以放你的 SVG 元素 */}
                    <svg width="20" height="20" viewBox="0 0 100 100">
                        <rect x="10" y="10" width="80" height="80" fill="gray" />
                    </svg>
                </span>
            </td>
            {restProps.children}
        </tr>
    );
};

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
];

const App = () => {
    const [data, setData] = useState([
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
        },
    ]);

    const components = {
        body: {
            row: DraggableBodyRow,
        },
    };

    const moveRow = useCallback(
        (dragIndex, hoverIndex) => {
            const dragRow = data[dragIndex];
            setData(
                update(data, {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, dragRow],
                    ],
                })
            );
        },
        [data]
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <Table
                columns={columns}
                dataSource={data}
                components={components}
                onRow={(_, index) => {
                    const attr = {
                        index,
                        moveRow,
                    };
                    return attr;
                }}
            />
        </DndProvider>
    );
};

export default App;
    