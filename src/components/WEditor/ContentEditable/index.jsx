import React, { useRef, useState } from 'react';

const ContentEditable = () => {
    const editorRef = useRef(null);
    const dropdownRef = useRef(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
    const [lastAtIndex, setLastAtIndex] = useState(-1);
    const [lastAtNode, setLastAtNode] = useState(null);

    const options = ['关键词1', '关键词2', '关键词3'];

    const getCaretPosition = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            return {
                left: rect.left + window.pageXOffset,
                top: rect.bottom + window.pageYOffset
            };
        }
        return { left: 0, top: 0 };
    };

    const handleInput = (e) => {
        const editor = editorRef.current;
        const text = editor.textContent;
        const lastIndex = text.lastIndexOf('@');
        if (lastIndex > -1) {
            // 判断 @ 是否为孤立的
            const isAlone = (lastIndex === text.length - 1) || (text[lastIndex + 1] === ' ');
            if (isAlone) {
                const caretPosition = getCaretPosition();
                setDropdownPosition(caretPosition);
                setIsDropdownVisible(true);
                setLastAtIndex(lastIndex);
                // 找到 @ 所在的节点
                let currentIndex = 0;
                const findAtNode = (node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        if (currentIndex + node.length > lastIndex) {
                            return node;
                        }
                        currentIndex += node.length;
                    } else if (node.hasChildNodes()) {
                        for (let i = 0; i < node.childNodes.length; i++) {
                            const result = findAtNode(node.childNodes[i]);
                            if (result) {
                                return result;
                            }
                        }
                    }
                    return null;
                };
                const atNode = findAtNode(editor);
                setLastAtNode(atNode);
            } else {
                setIsDropdownVisible(false);
                setLastAtIndex(-1);
                setLastAtNode(null);
            }
        } else {
            setIsDropdownVisible(false);
            setLastAtIndex(-1);
            setLastAtNode(null);
        }
    };

    const handleOptionClick = (option) => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && lastAtIndex > -1 && lastAtNode) {
            const newText = `@@${option}@@`;
            const span = document.createElement('span');
            span.textContent = newText;
            span.style.backgroundColor = 'rgba(0, 103, 222, 0.1)';
            span.style.color = '#0067de';
            span.setAttribute('contenteditable', 'false');

            // 计算 @ 在节点内的偏移量
            let currentIndex = 0;
            let offset = 0;
            const calculateOffset = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (currentIndex + node.length > lastAtIndex) {
                        offset = lastAtIndex - currentIndex;
                        return true;
                    }
                    currentIndex += node.length;
                } else if (node.hasChildNodes()) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        if (calculateOffset(node.childNodes[i])) {
                            return true;
                        }
                    }
                }
                return false;
            };
            calculateOffset(editor);

            // 删除 @ 符号
            const startRange = document.createRange();
            startRange.setStart(lastAtNode, offset);
            startRange.setEnd(lastAtNode, offset + 1);
            startRange.deleteContents();

            // 插入新内容
            const insertRange = document.createRange();
            insertRange.setStart(lastAtNode, offset);
            insertRange.setEnd(lastAtNode, offset);
            insertRange.insertNode(span);

            // 将光标移动到插入内容之后
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.setEndAfter(span);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }

        setIsDropdownVisible(false);
    };

    return (
        <div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                style={{
                    border: '1px solid #ccc',
                    minHeight: '100px',
                    padding: '10px',
                    outline: 'none'
                }}
            ></div>
            {isDropdownVisible && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                        left: dropdownPosition.left,
                        top: dropdownPosition.top,
                        zIndex: 1000
                    }}
                >
                    {options.map((option, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '5px 10px',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContentEditable;
    