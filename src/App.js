import React, { useRef, useEffect } from 'react';
import { Graph, Color } from '@antv/x6';
import './components/x6/CustomComponent'
import './utils/index'
import data from './data';
import Toolbar from './Toolbar';
import './App.css';
import { Snapline } from '@antv/x6-plugin-snapline';
import '@antv/x6-react-components/es/split-box/style/index.css'
import portConfig from './utils/portConfig'
import trash from './assets/trash.svg';

const commonAttrs = {
    // 这个对象包含了图形元素主体部分的样式属性
    body: {
        fill: '#fff',
        stroke: '#8f8f8f',
        strokeWidth: 1,
    },
    // 这个对象包含了图形标签的位置和对齐方式属性
    label: {
        // refX: 0.5 ：设置标签相对于图形主体的水平偏移量。 0.5 表示标签的水平位置将位于图形主体宽度的 50% 处，即居中位置。
        refX: 0.5,
        // refY: '100%' ：设置标签相对于图形主体的垂直偏移量。 '100%' 表示标签的垂直位置将位于图形主体高度的 100% 处，即图形的底部。
        refY: '100%',
        // refY2: 4 ：在垂直方向上进一步调整标签的位置。这里设置为 4 个单位，意味着标签将在 refY 的基础上再向下偏移 4 个单位。
        refY2: 4,
        // textAnchor: 'middle' ：设置标签文本的水平对齐方式为居中。这意味着标签文本将相对于 refX 位置居中显示。
        textAnchor: 'middle',
        // textVerticalAnchor: 'top' ：设置标签文本的垂直对齐方式为顶部对齐。这意味着标签文本的顶部将与 refY 和 refY2 确定的位置对齐。
        textVerticalAnchor: 'top',
    }
}




const App = () => {
    const graphRef = useRef(null);
    const graphInstance = useRef(null);

    useEffect(() => {
        const graph = new Graph({
            container: graphRef.current,
            highlighting: {
                // 连接桩可以被连接时在连接桩外围围渲染一个包围框
                magnetAvailable: {
                  name: 'stroke',
                  args: {
                    attrs: {
                      fill: 'transparent',
                      stroke: '#A4DEB1',
                      strokeWidth: 4,
                    },
                  },
                },
                // 连接桩吸附连线时在连接桩外围围渲染一个包围框
                magnetAdsorbed: {
                  name: 'stroke',
                  args: {
                    attrs: {
                      fill: 'transparent',
                      stroke: '#31d0c6',
                      strokeWidth: 4,
                    },
                  },
                },
              },
            connecting: {
                router: 'orth',
                connector: 'rounded',
                createEdge() {
                    return this.createEdge({
                      shape: 'edge',
                      attrs: {
                        line: {
                          stroke: '#8f8f8f',
                          strokeWidth: 1,
                        },
                      },
                    })
                  },
                allowNode(args) {
                    console.log('allowNode', args)
                    return false;
                  },
                allowMulti: false,
                allowBlank: false,
                allowLoop: false,
                allowEdge: false,
                allowPort(args){
                    console.log('allowPort', args)
                    const { sourceCell, targetCell } = args;
                    if (sourceCell === targetCell) {
                        return false; // 若相同，禁止连线
                    }
                    if (sourceCell && targetCell) {
                        const existingEdges = graph.getEdges();
                        for (let i = 0; i < existingEdges.length; i++) {
                            const edge = existingEdges[i];
                            const currentSource = edge.getSourceCell();
                            const currentTarget = edge.getTargetCell();
                            if (
                                currentSource === sourceCell &&
                                currentTarget === targetCell ||
                                (currentSource === targetCell &&
                                    currentTarget === sourceCell
                                )
                            ) {
                                return false; // 如果已经有连线，不允许再次连线
                            }
                        }
                    }
                    return true;
                },
                 // 添加 validateXXX 方法
                 validateMagnet({ cell, magnet }) {
                    // 示例逻辑：如果是特定节点类型，允许创建边
                    if (cell.shape === 'rect') {
                        return true;
                    }
                    // return false;
                    return true
                },
                validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet }) {
                    // 示例逻辑：源节点和目标节点不能是同一类型
                    if (sourceCell.shape === targetCell.shape) {
                        return true;
                    }
                    return true;
                },
            },
            grid: {
                visible: true,
                size: 10
            },
            background: {
                color: '#fffbe6', // 设置画布背景颜色
            },
            autoResize: true,
            panning: true,
            mousewheel: true
        });
        graph.use(
            new Snapline({
                enabled: true,
            })
        )
        graph.fromJSON(data);

       
        handleAddNode(graph);
        graphInstance.current = graph;

        graph.on('node:delete', ({ view, e }) => {
            e.stopPropagation()
            view.cell.remove()
          })

        return () => {
            graph.dispose();
        };
    }, []);

    const handleAddNode = (graph) => {
        const node = graph.addNode({
            id: 'addNode1',
            shape: 'rect',
            x: 200,
            y: 150,
            width: 80,
            height: 40,
            label: 'rectA',
            attrs: commonAttrs,
            ports: portConfig
        })
        console.log('node.prop()', node.prop())

        // setTimeout(() => {
        //     node.prop('size', { width: 120, height: 50 }) // 修改 x 坐标
        //     node.attr('body/fill', '#000') 
        // }, 5000)

        graph.addNode({
            id: 'addNode2',
            shape: 'polyline',
            x: 380,
            y: 150,
            width: 40,
            height: 40,
            label: 'polyline',
            attrs: {
              body: {
                ...commonAttrs.body,
                // 在 @antv/x6 中， refPoints 属性通常用于定义多边形（如 polyline 折线形状）的顶点位置
                // polyline 形状会按照这些点的顺序连接起来，形成一个封闭或开放的折线图形。
                refPoints: '0,0 0,10 10,10 10,0',
              },
              label: commonAttrs.label,
            },
          })

        graph.addEdge({
        source: 'addNode1', // 源节点 ID
        target: 'addNode2', // 目标节点 ID
        labels: [
            {
                attrs: {
                    label: {
                    text: '40%',
                    stroke: '#aaa',
                    },
                },
                position: 0.4,
                },
                {
                attrs: {
                    label: {
                    text: '60%',
                    stroke: '#aaa',
                    },
                },
                position: 0.6,
                },
        ],
        attrs: {
            line: {
                sourceMarker: 'block', // 实心箭头
                targetMarker: {
                    name: 'ellipse', // 椭圆
                    rx: 10, // 椭圆箭头的 x 半径
                    ry: 6, // 椭圆箭头的 y 半径
                },
                },
            },
        vertices: [
        { x: 300, y: 200 },
        { x: 300, y: 120 },
        ],
        router: {
            // 经过 orth 路由处理后，边的每一条链接线段都是水平或垂直的。
            name: 'orth',
            args: {},
        },
        // 如果没有 args 参数，可以简写写 connector: 'rounded'
        connector: {
            name: 'rounded',
            args: {},
        },
        })

        


    }


    const handleTranslate = (tx, ty) => {
        if (graphInstance.current) {
            graphInstance.current.translate(tx, ty);
        }
    };

    const MIN_SCALE = 0.1;
    const MAX_SCALE = 5;

    const handleZoom = (scale) => {
        if (graphInstance.current) {
            const currentScale = graphInstance.current.zoom();
            const newScale = currentScale + scale;
            if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
                graphInstance.current.zoomTo(newScale);
            }
        }
    };

    const handleToJSON = () => {
        if (graphInstance.current) {
            const json = graphInstance.current.toJSON();
            console.log('Graph JSON:', json);
        }
    };

    const handleZoomFit = () => {
        if (graphInstance.current) {
            // 此方法的作用是对画布中的元素进行缩放，缩放的级别可通过参数配置，目的是让画布能够恰好容纳所有元素。
            // 借助 maxScale 参数，你可以设定最大的缩放级别，防止缩放比例过大。
            graphInstance.current.zoomToFit({ maxScale: 1 });
        }
    };

    const handleCenterContent = () => {
        if (graphInstance.current) {
            // 该方法会把画布中的元素进行居中展示。也就是说，它会调整画布的平移位置，使所有元素处于画布的中心。
            graphInstance.current.centerContent();
        }
    }

    const handleProp = () => {
        if (graphInstance.current) {
            const nodes = graphInstance.current.getNodes();
            nodes.forEach(node => {
                const width = 100 + Math.floor(Math.random() * 50);
                const height = 40 + Math.floor(Math.random() * 50);
                node.prop('size', {width, height})
            })
        }
    }

    const handleAttr = () => {
        if (graphInstance.current) {
            const nodes = graphInstance.current.getNodes();
           nodes.forEach(node => {
            const color = Color.random().toHex();
            node.attr('body/fill', color)
           })
        }
    }

    const handleLineAttr = () => {
        if (graphInstance.current) {
            const edges = graphInstance.current.getEdges();
            edges.forEach(edge => {
                const color = Color.random().toHex();
                edge.attr('line/stroke', color)
            })
        }
    }

    const handleAddPort = () => {
        if (graphInstance.current) {
            const node = graphInstance.current.getCellById('node5')
            const ports = node.getPorts()
            const newPort = {
                id: `port_${ports.length + 1}`,
                group: 'bottom'
            }
            node.addPort(newPort)
        }
    }   
    const handleRemovePort = () => {
        if (graphInstance.current) {
            const node = graphInstance.current.getCellById('node5')
            const ports = node.getPorts()
            if (ports.length > 0) {
                node.removePort(ports[ports.length - 1].id)
            }
        }   
    }

    const handleUpdatePort = () => {
        const color = Color.random().toHex()
        if (graphInstance.current) {
            const node = graphInstance.current.getCellById('node5')
            const ports = node.getPorts()
            if (ports.length > 0) {
                const port = ports[ports.length - 1]
                node.portProp(port.id, 'attrs/circle/stroke', color)
            }
        }
    }

    return (
        <div className='react-shape-app'>
            <Toolbar 
            onZoom={handleZoom} 
            onTranslate={handleTranslate} 
            onToJSON={handleToJSON} 
            onZoomFit={handleZoomFit}
            onCenterContent={handleCenterContent} 
            onProp={handleProp}
            onAttr={handleAttr}
            onLineAttr={handleLineAttr}
            onAddPort={handleAddPort}
            onRemovePort={handleRemovePort}
            onUpdatePort={handleUpdatePort}
            />
            <div style={{width:'100%', height:'100%'}}>
            <div className='app-content' ref={graphRef} style={{ width: '100%', height: '600px' }}></div>
            </div>
           
    
        </div>
    );
};

export default App;
