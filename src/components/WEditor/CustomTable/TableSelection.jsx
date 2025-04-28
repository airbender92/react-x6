import React, { useState } from 'react';
import { Button, Popover } from 'antd';

const TableSelection = ({onCreateTable}) => {
    const [isPopoverVisible, setPopoverVisible] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(0);
    const [hoveredCol, setHoveredCol] = useState(0);

    const handleButtonClick = () => {
        setPopoverVisible(true);
    };

    const handleMouseMove = (row, col) => {
        setHoveredRow(row);
        setHoveredCol(col);
    };

    const handleMouseClick = () => {
        setPopoverVisible(false);
        console.log(`${hoveredRow + 1}*${hoveredCol + 1}`);
        if (onCreateTable) {
            onCreateTable(hoveredRow + 1, hoveredCol + 1);
        }
    };

    const renderTable = () => {
        return (
            <table onMouseUp={handleMouseClick}>
                <tbody>
                    {Array.from({ length: 10 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: 10 }).map((_, colIndex) => (
                                <td
                                    key={colIndex}
                                    onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                                    style={{
                                        backgroundColor:
                                            rowIndex <= hoveredRow && colIndex <= hoveredCol
                                                ? 'lightblue'
                                                : 'transparent',
                                        width: '20px',
                                        height: '20px',
                                        border: '1px solid #ccc'
                                    }}
                                ></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div>
            <Button onClick={handleButtonClick}>选择表格区域</Button>
            <Popover
                visible={isPopoverVisible}
                content={
                    <div>
                        {renderTable()}
                        <div>{`${hoveredRow + 1}*${hoveredCol + 1}`}</div>
                    </div>
                }
                onVisibleChange={(visible) => setPopoverVisible(visible)}
                trigger="click"
            ></Popover>
        </div>
    );
};

export default TableSelection;    