import React, { useRef, useEffect } from 'react';
import { Graph } from '@antv/x6';
import './components/x6/CustomComponent'
import data from './data';
import Toolbar from './Toolbar';
import './App.css';
import { Snapline } from '@antv/x6-plugin-snapline';
import '@antv/x6-react-components/es/split-box/style/index.css'


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

        return () => {
            graph.dispose();
        };
    }, []);

    const handleAddNode = (graph) => {
        graph.addNode({
            shape: 'rect',
            x: 200,
            y: 150,
            width: 80,
            height: 40,
            label: 'rect',
            attrs: commonAttrs
        })

        graph.addNode({
            shape: 'polyline',
            x: 380,
            y: 150,
            width: 40,
            height: 40,
            label: 'polyline',
            attrs: {
              body: {
                ...commonAttrs.body,
                refPoints: '0,0 0,10 10,10 10,0',
              },
              label: commonAttrs.label,
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

    return (
        <div className='react-shape-app'>
            <Toolbar 
            onZoom={handleZoom} 
            onTranslate={handleTranslate} 
            onToJSON={handleToJSON} 
            onZoomFit={handleZoomFit}
            onCenterContent={handleCenterContent} 
            />
            <div style={{width:'100%', height:'100%'}}>
            <div className='app-content' ref={graphRef} style={{ width: '100%', height: '600px' }}></div>
            </div>
           
    
        </div>
    );
};

export default App;
