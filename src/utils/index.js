import { Graph} from '@antv/x6'
// 使用 Graph 类的 registerNode 方法注册一个自定义节点类型，方便后续在图形中使用
Graph.registerNode(
    'custom-node',
    {
        // 指定该自定义节点继承自 'rect' 类型的节点，即具有矩形节点的基本特性
        inherit: 'rect',
        width: 100,
        height: 40,
         // 定义节点的标记（markup），即节点的组成结构，这里是一个数组，包含多个元素
        markup: [
            {
                 // 定义一个矩形元素，用于作为节点的主体部分
                tagName: 'rect',
                  // 为该矩形元素指定一个选择器，方便后续对其进行样式设置和操作
                selector: 'body'
            },
            {
                 // 定义一个图像元素，用于在节点中显示图片
                tagName: 'image',
                 // 为该图像元素指定一个选择器，方便后续对其进行样式设置和操作
                selector: 'img',
            },
            {
                 // 定义一个文本元素，用于在节点中显示文本内容
                tagName: 'text',
                 // 为该文本元素指定一个选择器，方便后续对其进行样式设置和操作
                selector: 'label'
            }
        ],
         // 定义节点各部分的属性，包括样式等
        attrs: {
            body: {
                // 用于设置矩形主体的边框颜色为 #8f8f8f
                stroke: '#8f8f8f',
                strokeWidth: 1,
                fill: '#fff',
                 // 设置矩形主体的圆角半径 x 轴方向为 6 像素
                rx: 6,
                // 设置矩形主体的圆角半径 y 轴方向为 6 像素
                ry: 6,
            },
            img: {
                 // 设置图像元素的源地址，这里使用的是一个在线的图片链接
                'xlink:href':
                'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
                width: 16,
                height: 16,
                 // 设置图像在节点内的 x 轴偏移量为 12 像素
                x: 12,
                y: 12,
            }
        }
    },
     // 第三个参数为布尔值，设置为 true 表示允许覆盖已存在的同名节点类型
    true,
)