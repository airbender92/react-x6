import { Node} from '@antv/x6'

export class Group extends Node {
    collapsed = false;
    // 定义 postprocess 方法，在节点创建后调用，用于初始化节点为展开状态
    postprocess(){
        this.toggleCollapse(false);
    }

    isCollapsed(){
        return this.collapsed;
    }
     // 定义 toggleCollapse 方法，用于切换节点的折叠状态
    toggleCollapse(collapsed){
         // 如果 collapsed 参数为 null，则取当前 collapsed 属性的反值；否则使用传入的 collapsed 参数
        const target = collapsed == null ? !this.collapsed : collapsed;
        if(target) {
             // 如果目标状态为折叠，设置按钮图标为表示折叠的形状
            this.attr('buttonSign', {d: 'M 1 5 9 5 M 5 1 5 9'})
              // 记录节点展开时的大小
            this.expandSize = this.getSize();
              // 将节点大小调整为 100x32
            this.resize(100, 32)
        } else {
            // 如果目标状态为展开，设置按钮图标为表示展开的形状
            this.attr('buttonSign', { d: 'M 2 5 8 5'})
             // 如果之前记录了展开大小，则将节点大小恢复到展开时的大小
            if(this.expandSize){
                this.resize(this.expandSize.width, this.expandSize.height);
            }
        }
        // 更新 collapsed 属性为目标状态
        this.collapsed = target;
    }
}
// 调用 Group 类的 config 方法，配置节点的标记和属性
Group.config({
     // 定义节点的标记，即节点的 HTML 结构
    markup: [
        {
             // 创建一个矩形元素，作为节点的主体
            tagName: 'rect',
             // 为该元素指定选择器，方便后续操作
            selector: 'body'
        },
        {
             // 创建一个文本元素，用于显示节点的标签
            tagName: 'text',
            selector: 'label',
        },
        {
             // 创建一个分组元素，用于包含按钮和按钮图标
           tagName: 'g',
           selector: 'buttonGroup',
            // 定义分组元素的子元素
           children: [
            {
                 // 创建一个矩形元素，作为按钮
                tagName: 'rect',
                selector: 'button',
                 // 为按钮元素设置属性
                attrs: {
                      // 设置按钮可响应鼠标事件
                    'pointer-events': 'visiblePainted',
                }
            },
            {
                  // 创建一个路径元素，作为按钮图标
                tagName: 'path',
                selector: 'buttonSign',
                attrs: {
                      // 设置路径不填充颜色
                    fill: 'none',
                      // 设置路径不响应鼠标事件
                    'pointer-events': 'none',
                }
            }
           ] 
        }
    ],
     // 定义节点各部分的属性
    attrs: {
        body: {
             // 设置主体矩形的宽度为节点宽度的 100%
            refWidth: '100%',
             // 设置主体矩形的高度为节点高度的 100%
            refHeight: '100%',
             // 设置主体矩形无边框
            stroke: 'none',
             // 设置主体矩形的填充颜色为白色
            fill: '#fff',
        },
        buttonGroup: {
             // 设置按钮分组相对于节点左上角的 X 偏移量为 8
            refX: 8,
             // 设置按钮分组相对于节点左上角的 Y 偏移量为 8
            refY: 8,
        },
        button: {
             // 设置按钮的高度为 14
            height: 14,
            width: 16,
             // 设置按钮的圆角半径为 2
            rx: 2,
            ry: 2,
             // 设置按钮的填充颜色为浅灰色
            fill: '#f5f5f5',
            // 设置按钮的边框颜色为灰色
            stroke: '#ccc',
             // 设置鼠标悬停在按钮上时的光标样式为手型
            cursor: 'pointer',
             // 为按钮绑定一个事件，事件名为 'node:collapse'
            event: 'node:collapse',
        },
        buttonSign: {
            // 设置按钮图标相对于按钮左上角的 X 偏移量为 3
            refX: 3,
             // 设置按钮图标相对于按钮左上角的 Y 偏移量为 2
            refY: 2,
             // 设置按钮图标的边框颜色为深灰色
            stroke: '#808080'
        },
        label: {
             // 设置标签文本的字体大小为 12
            fontSize: 12,
             // 设置标签文本的填充颜色为白色
            fill: '#fff',
             // 设置标签文本相对于节点左上角的 X 偏移量为 32
            refX: 32,
            // 设置标签文本相对于节点左上角的 Y 偏移量为 10
            refY: 10
        }
    }
})