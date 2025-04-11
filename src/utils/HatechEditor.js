import Editor from 'wangeditor';

let hatechEditor;
let tempContent; // tempContent存储临时内容 取消编辑时赋值
let contentHtml; // 全局存上一次的内容
class HatechEditor {
  editorDom // 编辑器dom对象

  editorId // 编辑器ID属性名称

  menus // 自定义菜单配置

  preNode // 上一个编辑的节点

  content // 编辑器内容

  display // 编辑器是否显示

  _saveBtnClick // 保存按钮触发操作

  _cancleBtnClick // 取消按钮触发操作

  _insertBtnClick // 插入要素触发操作

  _insertIndexBtnClick // 插入指标要触发的操作

  _assessBtnClick // 插入要素触发操作

  constructor(option) {
    if (Object.keys(option).length === 0) {
      return false;
    }
    this.editorId = option.id;
    this.menus = option.menus;
    this.preNode = option.node;
    this.display = option.display;
    this._saveBtnClick = option.save || null;
    this._cancleBtnClick = option.cancle || null;
    this._insertBtnClick = option.insertEle || null;
    this._insertIndexBtnClick = option.insertIndex || null;
    this._assessBtnClick = option.insertAssess || null;
    this._initSetEleFunc = option.setEle || null;
    this._initSetEleFunc(this._setEle);
    if (this.editorId !== undefined && this.editorId !== null) {
      if (this.menus.length > 0) {
        this._initEditor();
        this._createDom();
      }
    }
  }

  /**
   * 初始化渲染富文本编辑器
   */
  _initEditor() {
    const _this = this;
    if (_this.preNode) {
      _this._hatechEditSave(_this.preNode);
    }
    contentHtml = '';
    hatechEditor = new Editor(this.editorId);
    hatechEditor.customConfig = {
      uploadImgShowBase64: true,
      onchange: (html) => {
        _this.content = html;
        contentHtml = html;
      }
    };
    // 使用 base64 保存图片
    hatechEditor.customConfig.uploadImgShowBase64 = true;
    // 隐藏上传网络功能
    hatechEditor.customConfig.showLinkImg = false;
    // 超链接校验
    hatechEditor.customConfig.linkCheck = function (text, link) {
      if (link !== '' && text !== '') {
        // eslint-disable-next-line no-useless-escape
        const reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
        if (!reg.test(link)) {
          return '请输入正确的网址(例如 http://www.baidu.com)';
        }
        return true;
      }else if(text==''){
          return '链接名称不能为空'
      }else if(link==''){
          return '链接地址不能为空'
      }
    };
    // 自定义处理粘贴的文本内容
    hatechEditor.customConfig.pasteTextHandle = function (html) {
      // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
      html = html.replace(/<!--[\w\W\r\n]*?-->/gim, '');
      // 清除<w:xxx> 这样的标签
      html = html.replace(/<(w.*).+?>/gim, '');
      return html;
    };
    hatechEditor.customConfig.menus = [
      'head', // 标题
      'bold', // 粗体
      'fontSize', // 字号
      'fontName', // 字体
      'italic', // 斜体
      'underline', // 下划线
      'strikeThrough', // 删除线
      'foreColor', // 文字颜色
      'backColor', // 背景颜色
      'link', // 插入链接
      'list', // 列表
      'justify', // 对齐方式
      'quote', // 引用
      'image', // 插入图片
      'table', // 表格
      'undo', // 撤销
      'redo' // 重复
    ];
    hatechEditor.create();
    _this.editorDom = document.getElementById(_this.editorId.substring(1));
    _this.editorDom.style.display = _this.display;
    // 1:获取编辑器同级向上子节点
    const contentNode = _this.editorDom.previousElementSibling;
    // 2:隐藏内容节点
    contentNode.style.display = 'none';
    // 3：将内容节点数据回填给编辑器
    hatechEditor.txt.html(contentNode.innerHTML);
    _this.content = contentNode.innerHTML;
    tempContent = contentNode.innerHTML;
    // eslint-disable-next-line no-proto
    hatechEditor.menus.menus.table.__proto__._insert = function _insert(
      rowNum,
      colNum
    ) {
      // 拼接 table 模板
      let r = 0;
      let c = 0;
      let html =
        '<table border="1" width="100%" cellpadding="0" cellspacing="0">';
      for (r = 0; r < rowNum; r++) {
        html += '<tr>';
        if (r === 0) {
          for (c = 0; c < colNum; c++) {
            html += '<th style="border:1px solid #fff">&nbsp;</th>';
          }
        } else {
          for (c = 0; c < colNum; c++) {
            html += '<td style="border:1px solid #fff">&nbsp;</td>';
          }
        }
        html += '</tr>';
      }
      html += '</table><p><br></p>';

      // 执行命令
      const { editor } = this;
      editor.cmd.do('insertHTML', html);

      // 防止 firefox 下出现 resize 的控制点
      editor.cmd.do('enableObjectResizing', false);
      editor.cmd.do('enableInlineTableEditing', false);
    };
  }

  /**
   * 创建扩展组件
   */
  _createDom() {
    const toolbar = this.editorDom.getElementsByClassName('w-e-toolbar')[0];
    for (const m of Array.from(toolbar.children)) {
      for (const n of Array.from(m.children)) {
        switch (n.className) {
          case 'w-e-icon-header':
            n.title = '标题';
            break;
          case 'w-e-icon-bold':
            n.title = '粗体';
            break;
          case 'w-e-icon-text-heigh':
            n.title = '字号';
            break;
          case 'w-e-icon-font':
            n.title = '字体';
            break;
          case 'w-e-icon-italic':
            n.title = '斜体';
            break;
          case 'w-e-icon-underline':
            n.title = '下划线';
            break;
          case 'w-e-icon-strikethrough':
            n.title = '删除线';
            break;
          case 'w-e-icon-pencil2':
            n.title = '文字颜色';
            break;
          case 'w-e-icon-paint-brush':
            n.title = '背景颜色';
            break;
          case 'w-e-icon-link':
            n.title = '插入链接';
            break;
          case 'w-e-icon-list2':
            n.title = '设置列表';
            break;
          case 'w-e-icon-paragraph-left':
            n.title = '对齐方式';
            break;
          case 'w-e-icon-quotes-left':
            n.title = '引用';
            break;
          case 'w-e-icon-image':
            n.title = '上传图片';
            break;
          case 'w-e-icon-table2':
            n.title = '插入表格';
            break;
          case 'w-e-icon-undo':
            n.title = '撤销';
            break;
          case 'w-e-icon-redo':
            n.title = '重做';
            break;
        }
      }
    }
    if (this.menus.length > 0) {
      for (const option of this.menus) {
        const WEMenu = document.createElement('div');
        const iBtn = document.createElement('i');
        WEMenu.className = 'w-e-menu';
        WEMenu.style.zIndex = '10001';
        iBtn.className = `hatech_${option}`;
        if (option === 'screen') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._hatechEditScreen(iBtn);
          };
          iBtn.innerHTML = "<i title='全屏' class='el-icon-full-screen' aria-hidden='true'></i>";
        } else if (option === 'save') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._hatechEditSave();
          };
          iBtn.innerHTML = "<i title='保存'><div class='saveBtn ha-icon-baocun'></div></i>";
        } else if (option === 'cancle') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._hatechEditCancle(iBtn);
          };
          iBtn.innerHTML = "<i title='取消' class='el-icon-close' aria-hidden='true'></i>";
        } else if (option === 'insert') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._insertBtnClick(this._insertEle);
          };
          iBtn.innerHTML = "<i title='插入要素' class='el-icon-bottom-right' aria-hidden='true'></i>";
        } else if (option === 'index') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._insertIndexBtnClick(this._insertIndex);
          };
          iBtn.innerHTML = "<i title='插入指标' class='fa fa-sign-in' aria-hidden='true'></i>";
        } else if (option === 'assess') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._assessBtnClick(this._insertAssess);
          };
          iBtn.innerHTML = "<i title='插入评估' class='el-icon-chat-dot-square' aria-hidden='true'></i>";
        } else if (option === 'table') {
          iBtn.onclick = (event) => {
            if (event.stopPropagation) {
              event.stopPropagation();
            } else {
              event.cancelBubble = true;
            }
            this._assessBtnClick(this._insertAssess);
          };
          iBtn.innerHTML = "<i title='表格' class='el-icon-s-grid' aria-hidden='true'></i>";
        }
        WEMenu.appendChild(iBtn);
        toolbar.appendChild(WEMenu);
      }
    }
  }

  /**
   * 插入要素函数
   * @param data 要插入的内容
   * */
  _insertEle(data) {
    hatechEditor.cmd.do('insertHTML', '<span class="_key_element" id="' + `_key_element_${data.id}` + '" style="text-decoration: none;">' + `${data.isText ? data.keyElementName : `@@专用：${data.keyElementName}@@`}` + '</span>');
    // hatechEditor.cmd.do('insertImage')
  }

  /**
   * 插入指标函数
   * @param data 要插入的内容
   * */
  _insertIndex(data) {
    hatechEditor.cmd.do('insertHTML', `<a class="_quota_element" _quota_key = "${data.id}" href="javascript:;" style="color:#8f2ca0;text-decoration: none;">${data.name.trim()}</a>`);
    // hatechEditor.cmd.do('insertImage')
  }

  /**
   * 插入评估函数
   * @param data 要插入的内容
   * */
  _insertAssess(data) {
    hatechEditor.cmd.do('insertHTML', `<a class="_key_element" id="${data.id}" href="javascript:;">${data}</a>`);
    // hatechEditor.cmd.do('insertImage')
  }

  /**
   * 初始化设置要素函数
   * @param func 要设置的要素函数
   * */
  _initSetEleFunc(func) {}

  /**
   * 设置要素函数
   * @param data 要设置的要素内容
   * */
  _setEle(data) {
    hatechEditor.cmd.do('insertHTML', `<a href="javascript:;" id="${data.id}" class="_key_element" style="color:#f00;text-decoration: none;">${data.essentialFactorContent}</a>`);
    // hatechEditor.cmd.do('insertImage')
  }

  /**
   * 全屏操作
   * @param editorDom
   * @param fullscreenBtn
   */
  _hatechEditScreen(iBtn) {
    this._toggleClass(this.editorDom, 'fullscreen-editor');
    if (iBtn.innerHTML === "<i title='全屏' class='el-icon-full-screen' aria-hidden='true'></i>") {
      iBtn.innerHTML = "<i title='取消全屏' class='fa fa-window-close' aria-hidden='true'></i>";
    } else {
      iBtn.innerHTML = "<i title='全屏' class='el-icon-full-screen' aria-hidden='true'></i>";
    }
  }

  /**
   * 保存操作
   * @param editorId
   * @param fullscreenBtn
   */
  _hatechEditSave(node) {
    this.content = hatechEditor.txt.html();
    contentHtml = hatechEditor.txt.html();
    if (node) {
      if (node.content === undefined) {
        return false;
      }
      const preEditorDom = document.getElementById(`editor${node.id}`);
      if (preEditorDom !== null) {
        // 1:获取编辑器同级向上子节点
        const contentNode = preEditorDom.previousElementSibling;
        // 2：隐藏编辑器
        preEditorDom.style.display = 'none';
        // 3：将编辑器内容回填到同级向上兄弟节点中
        if (contentHtml) {
          contentNode.innerHTML = contentHtml;
          node.content = contentHtml;
        } else {
          contentNode.innerHTML = node.content;
        }
        contentNode.style.display = 'block';

        if (this._saveBtnClick != null) {
          if (contentHtml) {
            this._saveBtnClick(node.id, preEditorDom, contentHtml, node);
          } else {
            this._saveBtnClick(node.id, preEditorDom, node.content, node);
          }
        }
      }
    } else {
      if (this.content === undefined) {
        return false;
      }
      // 1:获取编辑器同级向上子节点
      const contentNode = this.editorDom.previousElementSibling;
      // 2：隐藏编辑器
      this.editorDom.style.display = 'none';
      // 3：将编辑器内容回填到同级向上兄弟节点中
      contentNode.innerHTML = this.content;
      contentNode.style.display = 'block';

      if (this._saveBtnClick !== null) {
        this._saveBtnClick(this.editorId.substring(1), this.editorDom, this.content);
      }
    }
  }

  /**
   * 取消操作
   * @param editorId
   * @param fullscreenBtn
   */
  _hatechEditCancle(iBtn) {
    // 1:获取编辑器同级向上子节点
    const contentNode = this.editorDom.previousElementSibling;
    // 2：隐藏编辑器
    this.editorDom.style.display = 'none';
    hatechEditor.txt.html(`${tempContent}`);
    this.content = tempContent;
    // 3：将编辑器内容回填到同级向上兄弟节点中
    contentNode.innerHTML = this.content;
    contentNode.style.display = 'block';

    if (this._cancleBtnClick != null) {
      this._cancleBtnClick(this.editorId.substring(1), this.editorDom, this.content);
    }
  }

  /**
   * 样式处理
   * @param obj
   * @param cls
   */
  _toggleClass(obj, cls) {
    if (this._hasClass(obj, cls)) {
      this._removeClass(obj, cls);
    } else {
      this._addClass(obj, cls);
    }
  }

  /**
   * 判断样式
   * @param obj
   * @param cls
   * @returns {RegExpMatchArray}
   */
  _hasClass(obj, cls) {
    return obj.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`));
  }

  /**
   * 添加样式
   * @param obj
   * @param cls
   */
  _addClass(obj, cls) {
    if (!this._hasClass(obj, cls)) {
      obj.className += ` ${cls}`;
    }
  }

  /**
   * 删除样式
   * @param obj
   * @param cls
   */
  _removeClass(obj, cls) {
    if (this._hasClass(obj, cls)) {
      const reg = new RegExp(`(\\s|^)${cls}(\\s|$)`);
      obj.className = obj.className.replace(reg, ' ');
    }
  }
}

export default HatechEditor;
