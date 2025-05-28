// tinymce-mention.js - TinyMCE @提及功能插件

// 注册一个名为'mention'的TinyMCE插件
tinymce.PluginManager.add('mention', function(editor, url) {
    // 关键词列表
    const options = ['关键词1', '关键词2', '关键词3', '关键词4', '关键词5'];
    
    // 下拉菜单DOM元素
    let dropdown = null;
    // 当前选中的关键词索引
    let selectedIndex = -1;
    
    // 创建下拉菜单
    const createDropdown = () => {
      if (dropdown) {
        dropdown.remove();
      }
      
      dropdown = document.createElement('div');
      dropdown.className = 'tinymce-mention-dropdown';
      dropdown.style.position = 'absolute';
      dropdown.style.zIndex = '1000';
      dropdown.style.backgroundColor = 'white';
      dropdown.style.border = '1px solid #ccc';
      dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      dropdown.style.minWidth = '150px';
      
      document.body.appendChild(dropdown);
      
      // 添加选项
      updateDropdown(options);
      
      // 点击选项外的区域关闭下拉菜单
      document.addEventListener('click', closeDropdownOnOutsideClick);
    };
    
    // 更新下拉菜单选项
    const updateDropdown = (items) => {
      dropdown.innerHTML = '';
      
      items.forEach((item, index) => {
        const option = document.createElement('div');
        option.className = 'tinymce-mention-option';
        option.textContent = item;
        option.style.padding = '6px 10px';
        option.style.cursor = 'pointer';
        
        // 选中状态样式
        if (index === selectedIndex) {
          option.style.backgroundColor = '#f0f0f0';
        }
        
        option.addEventListener('click', () => {
          insertMention(item);
        });
        
        dropdown.appendChild(option);
      });
    };
    
    // 关闭下拉菜单
    const closeDropdown = () => {
      if (dropdown) {
        dropdown.remove();
        dropdown = null;
      }
      document.removeEventListener('click', closeDropdownOnOutsideClick);
      selectedIndex = -1;
    };
    
    // 点击外部关闭下拉菜单
    const closeDropdownOnOutsideClick = (e) => {
      if (dropdown && !dropdown.contains(e.target)) {
        closeDropdown();
      }
    };
    
  // 插入提及
const insertMention = (option) => {
    editor.undoManager.transact(() => {
      // 获取当前光标位置的Range
      const range = editor.selection.getRng();
      
      // 定位到@符号的位置（光标前一个字符）
      const atPosition = range.startOffset - 1;
      const atRange = range.cloneRange();
      atRange.setStart(range.startContainer, atPosition);
      atRange.setEnd(range.startContainer, atPosition + 1);
      
      // 删除@符号
      atRange.deleteContents();
      
      // 创建提及元素
      const mentionNode = editor.dom.create('span', {
        'data-mention': option,
        style: 'background-color: rgba(0, 103, 222, 0.1); color: #0067de; padding: 2px 4px; border-radius: 3px;'
      }, option);
      
      // 直接在@符号删除后的位置插入提及元素
      atRange.insertNode(mentionNode);
      
      // 将光标移动到插入内容之后
      const newRange = editor.dom.createRange();
      newRange.setStartAfter(mentionNode);
      newRange.setEndAfter(mentionNode);
      editor.selection.setRng(newRange);
    });
    
    closeDropdown();
  };
    
    // 处理键盘导航
    const handleKeydown = (e) => {
      if (!dropdown) return;
      
      const options = dropdown.querySelectorAll('.tinymce-mention-option');
      if (options.length === 0) return;
      
      // 向上箭头
      if (e.keyCode === 38) {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        updateDropdown(options);
      }
      // 向下箭头
      else if (e.keyCode === 40) {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % options.length;
        updateDropdown(options);
      }
      // 回车键
      else if (e.keyCode === 13) {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          insertMention(options[selectedIndex].textContent);
        }
      }
      // ESC键
      else if (e.keyCode === 27) {
        e.preventDefault();
        closeDropdown();
      }
    };
    
    // 检查是否输入了@符号
    const checkForAtSymbol = () => {
      const content = editor.getContent({ format: 'text' });
      const cursorPosition = editor.selection.getRng().startOffset;
      
      // 检查光标前一个字符是否是@
      if (cursorPosition > 0 && content[cursorPosition - 1] === '@') {
        // 获取@符号的位置
        const atPosition = cursorPosition - 1;
        
        // 获取@符号的DOM位置
        const rng = editor.selection.getRng();
        const atRange = rng.cloneRange();
        atRange.setStart(rng.startContainer, atPosition);
        atRange.setEnd(rng.startContainer, atPosition + 1);
        
        // 获取@符号的坐标
        let rect, editorRect, container;
        
        // 处理iframe模式
        if (editor.inline === false) {
          const iframe = editor.getContentAreaContainer().querySelector('iframe');
          const iframeWindow = iframe.contentWindow;
          const iframeDoc = iframe.contentDocument || iframeWindow.document;
          
          // 获取iframe内的Selection对象
          const iframeSelection = iframeWindow.getSelection();
          // 创建包含@符号的Range
          const iframeRange = iframeDoc.createRange();
          iframeRange.setStart(rng.startContainer, atPosition);
          iframeRange.setEnd(rng.startContainer, atPosition + 1);
          
          // 获取Range的边界矩形
          rect = iframeRange.getBoundingClientRect();
          editorRect = iframe.getBoundingClientRect();
          container = iframeDoc.body;
        } else {
          rect = atRange.getBoundingClientRect();
          editorRect = editor.getContainer().getBoundingClientRect();
          container = editor.getContainer();
        }
        
        // 创建下拉菜单
        createDropdown();
        
        // 计算基本位置
        let left = rect.left - editorRect.left + container.scrollLeft;
        let top = rect.bottom - editorRect.top + container.scrollTop + 5;
        
        // 边界检测与调整
        const dropdownWidth = 200; // 假设下拉菜单宽度为200px
        const dropdownHeight = 150; // 假设下拉菜单高度为150px
        
        // 如果右侧空间不足，将下拉菜单显示在@符号左侧
        if (left + dropdownWidth > editorRect.width) {
          left = Math.max(0, rect.right - editorRect.left - dropdownWidth + container.scrollLeft);
        }
        
        // 如果下方空间不足，将下拉菜单显示在@符号上方
        if (top + dropdownHeight > editorRect.height) {
          top = rect.top - editorRect.top - dropdownHeight + container.scrollTop - 5;
        }
        
        // 设置下拉菜单位置
        dropdown.style.left = `${left}px`;
        dropdown.style.top = `${top}px`;
        
        // 添加键盘导航事件
        editor.on('keydown', handleKeydown);
      }
    };
    
    // 添加编辑器事件监听
    editor.on('keyup', (e) => {
      // 只处理非特殊按键
      if (e.key.length === 1 || e.keyCode === 8 || e.keyCode === 46) {
        if (!dropdown) {
          checkForAtSymbol();
        } else {
          // 如果下拉菜单已打开，更新搜索结果
          const content = editor.getContent({ format: 'text' });
          const cursorPosition = editor.selection.getRng().startOffset;
          
          // 查找@符号后的文本
          let textAfterAt = '';
          let i = cursorPosition - 1;
          while (i >= 0 && content[i] !== '@') {
            i--;
          }
          
          if (i >= 0 && content[i] === '@') {
            textAfterAt = content.substring(i + 1, cursorPosition);
            if (textAfterAt.length > 0) {
              // 过滤关键词
              const filteredOptions = options.filter(option => 
                option.toLowerCase().includes(textAfterAt.toLowerCase())
              );
              updateDropdown(filteredOptions);
            }
          }
        }
      }
    });
    
    // 编辑器失去焦点时关闭下拉菜单
    editor.on('blur', closeDropdown);
    
    // 编辑器销毁时清理
    editor.on('remove', closeDropdown);
    
    // 返回插件信息
    return {
      getMetadata: function() {
        return {
          name: 'Mention Plugin',
          url: 'https://example.com/tinymce-mention'
        };
      }
    };
  });    