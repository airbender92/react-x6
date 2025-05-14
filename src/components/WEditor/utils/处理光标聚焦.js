import React, { useState, useRef, useEffect } from 'react';

const EditableWithPlaceholder = () => {
  const [hasContent, setHasContent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const placeholder = '请输入内容...';

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 初始化占位符
    if (!element.textContent?.trim()) {
      element.innerHTML = `<span class="text-gray-400">${placeholder}</span>`;
    }

    // 监听内容变化
    const observer = new MutationObserver(() => {
      const content = element.textContent?.trim() || '';
      setHasContent(content !== '' && content !== placeholder);
    });

    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (element && element.innerHTML === `<span class="text-gray-400">${placeholder}</span>`) {
      element.innerHTML = ''; // 清除占位符
      
      // 重新聚焦并设置光标位置
      setTimeout(() => {
        element.focus();
        
        // 设置光标到开始位置
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 0);
    }
  };

  const handleBlur = () => {
    const element = ref.current;
    if (element && !element.textContent?.trim()) {
      element.innerHTML = `<span class="text-gray-400">${placeholder}</span>`;
    }
  };

  return (
    <div
      ref={ref}
      contentEditable={true}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="border border-gray-300 rounded p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
    />
  );
};

export default EditableWithPlaceholder;