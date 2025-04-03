import { Graph} from '@antv/x6'
import { stroke } from '@antv/x6/lib/registry/highlighter/stroke'
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

Graph.registerNode('custom-node-width-port',{
    inherit:'rect',
    width: 100,
    height: 40,
    attrs: {
        body: {
            stroke: '#8f8f8f',
            strokeWidth: 1,
            fill: '#fff',
            rx: 6,
            ry: 6,
        }
    },
    ports: {
        groups: {
            top: {
                position: 'top',
                attrs: {
                    circle: {
                        magnet: true,
                        stroke: '#8f8f8f',
                        r: 5,
                    }
                }
            },
            bottom: {
                position: 'bottom',
                attrs: {
                    circle: {
                        magnet: true,
                        stroke: '#8f8f8f',
                        r: 5,
                    }
                }
            }
        }
    }
}, true)

// 第三个参数 true 表示允许覆盖已存在的同名节点类型
Graph.registerNode(
    'custom-click-node',
    {
        // 定义节点的标记（markup），即节点的组成结构，这里是一个数组，包含多个元素
        markup: [
            {
                // 定义一个矩形元素，用于作为节点的主体部分
                tagName: 'rect',
                 // 为该矩形元素指定一个选择器，方便后续对其进行样式设置和操作
                selector: 'body',
            },
            {
                 // 定义一个文本元素，用于在节点中显示文本内容
                tagName: 'text',
                 // 为该文本元素指定一个选择器，方便后续对其进行样式设置和操作
                selector: 'label',
            },
            {
                // 定义一个分组元素，用于将按钮文本和按钮矩形组合在一起
                tagName: 'g',
                 // 该分组元素包含两个子元素
                children: [
                    {
                         // 定义一个文本元素，用于显示按钮上的文本
                        tagName: 'text',
                         // 为该文本元素指定一个选择器，方便后续对其进行样式设置和操作
                        selector: 'btnText'
                    },
                    {
                         // 定义一个矩形元素，用于作为按钮的背景
                        tagName: 'rect',
                           // 为该矩形元素指定一个选择器，方便后续对其进行样式设置和操作
                        selector: 'btn'
                    }
                ]
            }
        ],
         // 定义节点各部分的属性，包括样式等
        attrs: {
            btn: {
                  // 设置按钮相对于节点宽度的偏移量，这里是节点宽度的 100%
                refX: '100%',
                // 相对于 refX 的额外偏移量，向左偏移 28 像素
                refX2: -28,
                 // 设置按钮在节点内的 y 轴偏移量为 4 像素
                y: 4,
                 // 设置按钮的宽度为 24 像素
                width: 18,
                 // 设置按钮的高度为 18 像素
                height: 18,
                  // 设置按钮矩形的圆角半径 x 轴方向为 10 像素
                rx: 10,
                 // 设置按钮矩形的圆角半径 y 轴方向为 10 像素
                ry: 10,
                   // 设置按钮的填充颜色为带有极低透明度的黄色
                fill: 'rgba(255,255,0,0.01)',
                  // 设置按钮的边框颜色为红色
                stroke: 'red',
                cursor: 'pointer',
                 // 定义按钮点击时触发的事件名称为 'node:delete'
                event: 'node:delete'
            },
            btnText: {
                 // 设置按钮文本的字体大小为 14 像素
                fontSize: 14,
                  // 设置按钮文本的填充颜色为红色
                fill: 'red',
                 // 设置按钮文本的内容为 'X'
                text: 'X',
                  // 设置按钮文本相对于节点宽度的偏移量，这里是节点宽度的 100%
                refX: '100%',
                 // 相对于 refX 的额外偏移量，向左偏移 23 像素
                refX2: -23,
                 // 设置按钮文本在节点内的 y 轴偏移量为 17 像素
                y: 19,
                cursor: 'pointer',
                 // 禁止按钮文本接收鼠标事件
                pointerEvent: 'none',
            },
            body: {
                  // 设置矩形主体的边框颜色为 #8f8f8f
                stroke: '#8f8f8f',
                 // 设置矩形主体的边框宽度为 1 像素
                strokeWidth: 1,
                 // 设置矩形主体的填充颜色为白色
                fill: '#fff',
                 // 设置矩形主体的圆角半径 x 轴方向为 6 像素
                rx:  6,
                  // 设置矩形主体的圆角半径 y 轴方向为 6 像素
                ry:  6,
                  // 设置矩形主体的宽度为节点宽度的 100%
                refWidth: '100%',
                 // 设置矩形主体的高度为节点高度的 100%
                refHeight: '100%',
            },
            label: {
                 // 设置标签文本的字体大小为 14 像素
               fontSize: 14,
                 // 设置标签文本相对于节点宽度的偏移量，这里是节点宽度的 50%
                refX: '50%',
                 // 设置标签文本相对于节点高度的偏移量，这里是节点高度的 50%
                refY: '50%',
                 // 设置标签文本的填充颜色为 #333
                fill: '#333',
                  // 设置标签文本的水平对齐方式为居中
                textAnchor: 'middle',
                  // 设置标签文本的垂直对齐方式为居中
                textVerticalAnchor: 'middle',
                 // 禁止标签文本接收鼠标事件
                pointerEvents: 'none',
            }
        }
    },
    true
)

Graph.registerNode('custom-group-node', {
    inherit: 'rect',
    width: 100,
    height: 40,
    attrs: {
        body: {
            stroke: '#8f8f8f',
            strokeWidth: 1,
            fill: '#fff',
            rx: 6,
            ry: 6,
        }
    }
}, true)

Graph.registerEdge('double-edge', {
    inherit: 'edge',
     // 定义边的组成结构，这里是一个包含多个元素的数组
    markup: [
        {
             // 定义一个路径元素，用于作为边的轮廓部分
            tagName: 'path',
            // 为该路径元素指定一个选择器，方便后续对其进行样式设置和操作
            selector: 'outline',
             // 定义该元素的属性
            attrs: {
                  // 设置填充颜色为无，即不填充
                fill: 'none'
            },
        },
        {
             // 定义另一个路径元素，用于作为边的实际线条部分
            tagName: 'path',
            // 为该路径元素指定一个选择器，方便后续对其进行样式设置和操作
            selector: 'line',
             // 定义该元素的属性
            attrs: {
                 // 设置填充颜色为无，即不填充
                fill: 'none',
                 // 设置鼠标悬停在该边上时的光标样式为指针
                cursor: 'pointer',
            }
        }
    ],
     // 定义边各部分的属性，包括样式等
    attrs: {
        line: {
            // 表示该路径元素用于连接节点
            connection: true,
             // 设置线条的颜色为 #dddddd
            stroke: '#dddddd',
            strokeWidth: 4,
             // 设置线条连接处的样式为圆角
            strokeLinejoin: 'round',
             // 定义边的目标端点标记
            targetMarker: {
                 // 标记类型为路径
                tagName: 'path',
                  // 设置标记的边框颜色为 #000000
                stroke: '#000000',
                // 定义路径的形状
                d: 'M 10 -3 10 -10 -2 0 10 10 10 3',
            },
        },
        outline: {
             // 表示该路径元素用于连接节点
            connection: true,
            stroke: '#000000',
            strokeWidth: 6,
             // 设置线条连接处的样式为圆角
            strokeLinejoin: 'round',
        }
    }
})

Graph.registerEdge('shadow-edge', {
     // 表明该自定义边继承自 'edge' 类型，具备普通边的基本特性
    inherit: 'edge',
    // 定义边的组成结构，这里是一个包含多个元素的数组
    markup: [
        {
             // 定义一个路径元素，用于作为边的阴影部分
            tagName: 'path',
             // 为该路径元素指定一个选择器，方便后续对其进行样式设置和操作
            selector: 'shadow',
            // 定义该元素的属性
            attrs: {
                 // 设置填充颜色为无，即不填充
                fill: 'none',
            }
        },
        {
             // 定义另一个路径元素，用于作为边的实际线条部分
            tagName: 'path',
             // 为该路径元素指定一个选择器，方便后续对其进行样式设置和操作
            selector: 'line',
             // 定义该元素的属性
            attrs: {
                 // 设置填充颜色为无，即不填充
                fill: 'none',
                cursor: 'pointer',
            }
        }
    ],
    attrs: {
         // 定义边各部分的属性，包括样式等
        line: {
            connection: true,
            stroke: '#dddddd',
            strokeWidth: 20,
            strokeLinejoin: 'round',
             // 定义边的目标端点标记
            targetMarker: {
                 // 标记类型为路径
                name: 'path',
                   // 设置标记的边框颜色为无
                stroke: 'none',
                 // 定义路径的形状
                d: 'M 0 -10 -10 0 0 10 z',
                 // 设置标记在 x 轴方向的偏移量为 -5 像素
                offsetX: -5,
            },
            // 定义边的源端点标记
            sourceMarker: {
                name: 'path',
                stroke: 'none',
                d: 'M -10 -10 0 0 -10 10 0 10 0 -10 z',
                offsetX: -5,
            }
        },
        shadow: {
             // 表示该路径元素用于连接节点
            connection: true,
             // 设置阴影在 x 轴方向的偏移量为 3 像素
            refX: 3,
            // 设置阴影在 y 轴方向的偏移量为 6 像素
            refY: 6,
             // 设置阴影的颜色为 #000000
            stroke: '#000000',
             // 设置阴影的透明度为 0.2
            strokeOpacity: 0.2,
            strokeWidth: 20,
            strokeLinejoin: 'round',
             // 定义阴影的目标端点标记
            targetMarker: {
                 // 标记类型为路径
                name: 'path',
                // 定义路径的形状
                d: 'M 0 -10 -10 0 0 10 z',
                 // 设置标记的边框颜色为无
                stroke: 'none',
                 // 设置标记在 x 轴方向的偏移量为 -5 像素
                offsetX: -5,
            },
            sourceMarker: {
                name: 'path',
                stroke: 'none',
                d: 'M -10 -10 0 0 -10 10 0 10 0 -10 z',
                offsetX: -5,
            }
        }
    }
})