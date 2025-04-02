  // 定义开始节点的端口配置
  const startNodePorts = {
    groups: {
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 3,
            magnet: true,
            stroke: '#31d0c6',
            strokeWidth: 2,
            fill: '#fff',
          },
        },
      },
    },
    items: [
      { group: 'right', id: 'start_port_right' },
    ],
  };

      // 定义结束节点的端口配置
      const endNodePorts = {
        groups: {
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          { group: 'left', id: 'end_port_left' },
        ],
      };

// 定义通用的端口配置
 const portConfig = {
     // groups 属性用于定义不同位置端口的通用配置
    groups: {
         // 顶部端口的配置
        top: {
              // 端口位置设置为顶部
            position: 'top',
             // 端口的属性设置
            attrs: {
                 // 端口的图形为圆形
                circle: {
                     // 圆的半径为 3
                    r: 3,
                     // 开启磁性吸附功能
                    magnet: true,
                     // 圆的边框颜色
                    stroke: '#31d0c6',
                      // 圆的边框宽度
                    strokeWidth: 2,
                     // 圆的填充颜色
                    fill: '#fff',
                }
            }
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 3,
                    magnet: true,
                    stroke: '#31d0c6',
                    strokeWidth: 2,
                    fill: '#fff',
                }
            }
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 3,
                    magnet: true,
                    stroke: '#31d0c6',
                    strokeWidth: 2,
                    fill: '#fff',
                }
            }
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 3,
                    magnet: true,
                    stroke: '#31d0c6',
                    strokeWidth: 2,
                    fill: '#fff',
                }
            }      
        }
    },
     // items 属性用于定义具体的端口项
    items: [
        // 定义一个顶部端口，组为 top，ID 为 port_top
        {group: 'top', id: 'port_top'},
        {group: 'right', id: 'port_right'},
        {group: 'bottom', id: 'port_bottom'},
        {group: 'left', id: 'port_left'},
    ]
}

export default portConfig;