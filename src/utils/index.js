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