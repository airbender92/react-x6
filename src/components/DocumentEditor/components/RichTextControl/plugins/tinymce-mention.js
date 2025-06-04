import tinymce from "tinymce/tinymce";
import styles from '../index.less'

tinymce.PluginManager.add('mention', function(editor, url) {
    // 关键词列表
    const mentionOptions = editor.options.get('mentionOptions');
    const options = mentionOptions || [];

    let dropdown = null;
    let selectedIndex = -1;
    let closeDropdownTimer = null;
    let optionsWrapper = null;

    const createDropdown = () => {
        if(dropdown){
            dropdown.remove();
        }
        dropdown = document.createElement('div');
        dropdown.className = styles.tinymceMentionDropdown;
        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = 100000;
        dropdown.style.backgroundColor = '#fff';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        dropdown.style.minWidth = '100px';
        document.body.appendChild(dropdown);
        dropdown.addEventListener('mousedown', (e) => {
            if(!e.target.closest('input')) {
                e.preventDefault();
            }
        });

        // 添加输入框（关键新增代码）
        const input = document.createElement('input');
        input.type = 'text';
        input.className = styles.tinymceMentionInput; // 需确保 index.less 有此样式
        input.placeholder = '输入提及对象...';
        input.style.width = '100%';
        input.style.padding = '6px 10px';
        input.style.border = 'none';
        input.style.borderBottom = '1px solid #eee';
        dropdown.appendChild(input); // 插入输入框到下拉框

        optionsWrapper = document.createElement('div'); // 用于包裹选项的容器
        dropdown.appendChild(optionsWrapper); // 插入容器到下拉框

        // 保存原始选项用于过滤（关键新增代码）
        const originalOptions = [...options];

          // 绑定输入事件（关键新增代码）
          input.addEventListener('input', (e) => {
            const keyword = e.target.value.trim().toLowerCase();
            const filteredOptions = originalOptions.filter(option => 
                option.title.toLowerCase().includes(keyword)
            );
            updateDropdown(filteredOptions); // 触发选项更新
        });

         // 初始加载所有选项（修改：使用原始选项）
         updateDropdown(originalOptions);
         document.addEventListener('click', closeDropdownOnOutsideClick);
    };

    // 更新下拉框内容
    const updateDropdown = (items) => {
        optionsWrapper.innerHTML = ''; // 清空容器
        if(items.length === 0){
            const option = document.createElement('div');
            option.className = styles.tinymceMentionOption;
            option.textContent = '没有找到相关选项';
            option.style.padding = "6px 10px";
            optionsWrapper.appendChild(option);
            return;
        }
        items.forEach((item, index) => {
            const option = document.createElement('div');
            option.className = styles.tinymceMentionOption;
            option.textContent = item.title;
            option.style.padding = "6px 10px";
            option.style.cursor = "pointer"; 

            // 选中
            if(index === selectedIndex){
                item.style.backgroundColor = '#f0f0f0';
            }
            option.addEventListener('click', () => {
                if(closeDropdownTimer){
                    clearTimeout(closeDropdownTimer);
                }
                insertMention(item);
            });
            optionsWrapper.appendChild(option);
        })
    };

    // 关闭下拉菜单
    const closeDropdown = () => {
        if(dropdown){
            dropdown.remove();
            dropdown = null;
        }
        selectedIndex = -1;
    };

    // 点击外部关闭下拉菜单
    const closeDropdownOnOutsideClick = (e) => {
        if(!dropdown || dropdown.contains(e.target)){
            return;
        }
        closeDropdown();
    };

    // 插入关键词
    const insertMention = (option) => {
       editor.undoManager.transact(() => {
        // 获取光标位置
        const range = editor.selection.getRng();
        // 定位到@符号位置
        const atPosition = range.startOffset - 1;
        const atRange = range.cloneRange();
        atRange.setStart(range.startContainer, atPosition);
        atRange.setEnd(range.startContainer, atPosition + 1);
        atRange.deleteContents();
        // 创建插入元素
        const text = `@@${option.title}@@`;
        const mentionNode = editor.dom.create('span',
            {
                "data-mention": option.title,
                contenteditable: false,
                style: "background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; cursor: pointer;"
            },
            text);
            // 直接在@符号删除后的位置插入
            atRange.insertNode(mentionNode);
            // 将光标定位到插入的位置
            const newRange = editor.dom.createRng();
            newRange.setStartAfter(mentionNode);
            newRange.setEndAfter(mentionNode);
            editor.selection.setRng(newRange);
       });
       closeDropdown();
    };

    // 键盘事件
    const handleKeyDown = (e) => {
       if(!dropdown){
        return;
       } 
       const options = dropdown.querySelectorAll(`.${styles.tinymceMentionOption}`);
       if(options.length === 0){
        return;
       }
       // 向上箭头
       if(e.keyCode === 38){
        e.preventDefault();
       selectedIndex = (selectedIndex - 1 + options.length) % options.length;
       updateDropdown(options);
       }
       // 向下箭头
       else if(e.keyCode === 40){
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % options.length;
        updateDropdown(options);
       } 
       // 回车
       else if(e.keyCode === 13){
        e.preventDefault();
        if(selectedIndex >= 0 && selectedIndex < options.length){
            insertMention(options[selectedIndex].textContent);
        }
       }
       // esc
       else if(e.keyCode === 27){
        e.preventDefault();
        closeDropdown();
       }

    };

    // 获取光标位置
    const getCaretPosition = () => {
        const selection = editor.selection.getRng();
        if(!selection){
            return {left: 0, top: 0};
        }
        let rect;
        // 处理iframe
        if(editor.inline === false) {
            const iframe = editor.getContentAreaContainer().querySelector('iframe');
            const iframceRect = iframe.getBoundingClientRect();
            const selection = editor.selection;
            const rng = selection.getRng();
            const caretRect = rng.getBoundingClientRect();
            const rect = caretRect.width > 0 ? caretRect : rng.getClientRects().length > 0 ? rng.getClientRects()[0] : null;
            if(rect){
                return {
                    left: rect.left + iframceRect.left + window.scrollX - iframe.contentWindow.scrollX,
                    top: rect.top + iframceRect.top + window.scrollY - iframe.contentWindow.scrollY + 15,
                }; 
            }
            return {left: 0, top: 0};
        } else {
            const clonedRange = selection.cloneRange();
            rect = clonedRange.getBoundingClientRect();
        }
        return {
            left: rect.left,
            top: rect.bottom + 5,
        }
    };

    // 检查光标前是否为孤立的@
    const isPreviousCharStandaloneAt = () => {
        const selection = editor.selection;
        const range = selection.getRng();
        const node = range.startContainer;
        const offset = range.startOffset;

        // 检查光标前是否有字符
        if(offset === 0) return false;
        // 检查前一个字符是否为@
        if(node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            if(text.charAt(offset - 1) !== '@') return false;

            // 检查@是否在data-mention元素里
            const parent = editor.dom.getParent(node, "[data-mention]");
            if(parent) return false;
            return true;
        }

        // 检查@前面的字符是否为控制或行首
        const isAtStartOfNode = offset === 1; // @是节点的第一个字符
        const prevChar = isAtStartOfNode ? " " : node.nodeValue?.charAt(offset - 2);
        const isPrevSpace = prevChar === ' ' || prevChar === '\n';
        // 检查@是否在data-mention元素里
        const parent = editor.dom.getParent(node, "[data-mention]");
        return isPrevSpace || !parent;
    };

    // 检查是否输入了@符号
    const checkForAtSymbol = () => {
        // 获取当前光标的Range对象，
        const range = editor.selection.getRng();
        // 光标前无内容，直接返回
        if(range.startOffset === 0) return;
        // 创建一个新的Range, 定位到光标前一个字符的位置
        const prevCharRange = range.cloneRange();
        prevCharRange.setStart(range.startContainer, range.startOffset - 1);
        prevCharRange.setEnd(range.startContainer, range.startOffset);
        // 获取该位置的字符内容
        const prevChar = prevCharRange.toString();
        if(prevChar === '@') {
            const atPosition = range.startOffset - 1;
            const atRange = range.cloneRange();
            atRange.setStart(range.startContainer, atPosition)
            atRange.setEnd(range.startContainer, atPosition + 1);

            // 获取光标符号位置
            const caretPosition = getCaretPosition();

            // 创建下拉菜单
            createDropdown();
            let left = caretPosition.left;
            let top = caretPosition.top;

            // 边界检测
            const {width, height} = dropdown?.getBoundingClientRect() || {width: 200, height: 150}
            const dropdownWidth = width;
            const dropdownHeight = height;
            // 获取视口尺寸
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            // 如果右侧空间不足，将下拉菜单显示在@符号左侧
            if(left + dropdownWidth > viewportWidth) {
                left = Math.max(0, rect.right - dropdownWidth)
            }
            // 如果下方空间不足，将下拉菜单显示在上方
            if(top + dropdownHeight > viewportHeight) {
                top = rect.top - dropdownHeight - 5;
            }
            dropdown.style.left = `${left}px`;
            dropdown.style.top = `${top}px`;

            // 添加键盘导航事件
            editor.on('keydown', handleKeyDown)
        }
    };

    // 添加编辑器监听
    editor.on('input', (e) => {
        if(isPreviousCharStandaloneAt()) {
            checkForAtSymbol();
        }
    });

    editor.on('click', (e) => {
        closeDropdownOnOutsideClick(e)
    })

    // 编辑器销毁时清理
    editor.on('remove', () => {
        document.removeEventListener('click', closeDropdownOnOutsideClick)
    })

    // 返回插件信息
    return {
        getMetadata: function () {
            return {
                name: 'Mention Plugin',
                url: 'local'
            }
        }
    }

})