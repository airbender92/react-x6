import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';

const EditorCell = forwardRef((props, ref) => {
    const { mode = 'edit', content = { html: '', text: '' }, onContentChange } = props;
    const editorRef = useRef(null);
    const dropdownRef = useRef(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
    const [lastAtIndex, setLastAtIndex] = useState(-1);
    const [lastAtNode, setLastAtNode] = useState(null);

    const options = ['关键词1', '关键词2', '关键词3'];

        // 初始化内容（包含 span 标签结构）
        useEffect(() => {
            if (editorRef.current) {
                editorRef.current.innerHTML = content.html; // 恢复 HTML 结构
            }
        }, [content.html]);

            // 新增：点击外部关闭下拉框
    const handleClickOutside = (e) => {
        const dropdown = dropdownRef.current;
        // 点击目标不在下拉框和输入框内时关闭
        if (dropdown && !dropdown.contains(e.target) ) {
            setIsDropdownVisible(false);
        }
    };

    // 新增：生命周期监听全局点击事件
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        const newContent = {
            html: editorRef.current.innerHTML,
            text: editorRef.current.textContent
        };
        onContentChange?.(newContent); // 触发父组件状态更新
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
            span.setAttribute('data-type', 'keyword'); // 标记为关键词类型，用于后续替换 tex

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
        const newContent = {
            html: editorRef.current.innerHTML,
            text: editorRef.current.textContent
        };
        onContentChange?.(newContent); // 触发父组件状态更新
        setIsDropdownVisible(false);
    };

    // 获取当前 DOM 的 HTML 和文本
    const getDomContent = () => {
        const editor = editorRef.current;
        const html = editor.innerHTML;
        const text = editor.textContent;
        console.log('HTML:', html);
        console.log('文本:', text);
        return { html, text };
    };

    // 根据接口返回的真实数据做替换
    const replaceKeywords = (data) => {
        const { text } = getDomContent();
        let replacedText = text;
        data.forEach(item => {
            for (const [placeholder, value] of Object.entries(item)) {
                replacedText = replacedText.replace(new RegExp(placeholder, 'g'), value);
            }
        });
        const editor = editorRef.current;
        editor.textContent = replacedText;
    };

    useImperativeHandle(ref, () => ({
        getDomContent,
        replaceKeywords
    }));

    return (
        <>
            <div
                ref={editorRef}
                contentEditable={mode === 'edit'}
                onInput={handleInput}
                style={{
                    border: 'none',
                    minHeight: '100px',
                    height: 'auto', // 允许高度自动调整
                    width: '100%', // 确保宽度满
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
        </>
    );
});

export default EditorCell;
    