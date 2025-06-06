import { Children } from "react";
import portConfig from "./utils/portConfig";
const data = {
    nodes: [
      {
        id: 'node1',
        x: 140,
        y: 40,
        shape: 'custom-react-node',
        label: 'hello',
        ports: portConfig,
      },
      {
        id: 'node2',
        x: 280,
        y: 240,
        width: 100,
        height: 40,
       shape: 'custom-node',
        label: 'hello2',
        ports: portConfig,
      },
      {
        id: 'node3',
        x: 80,
        y: 440,
        width: 100,
        height: 40,
       shape: 'rect',
        label: 'node3',
        ports: portConfig,
      },
      {
        id: 'node4',
        x: 80,
        y: 540,
        width: 100,
        height: 40,
       shape: 'rect',
        label: 'node4',
        ports: portConfig,
      },
      {
        id: 'node5',
        x: 580,
        y: 40,
        width: 100,
        height: 40,
        shape: 'custom-node-width-port',
        label: 'node5',
        ports: {
          items: [
            {id: 'port_1', group: 'bottom'},
            {id: 'port_2', group: 'bottom'},
          ]
        }
      },
      {
        id: 'node6',
        x:580,
        y: 140,
        width: 100,
        height: 40,
        shape: 'custom-node-width-port',
        label: 'node6',
        ports: {
          items: [
            {id: 'port_3', group: 'top'},
            {id: 'port_4', group: 'top'},
          ]
        }
      },
      {
        id: 'node7',
        x: 540,
        y: 40,
        width: 100,
        height: 40,
        shape: 'custom-click-node',
        attrs: {
          label: {
            text: 'node7'
          }
        },
        ports: portConfig,
      },
    ],
    edges: [
      {
        source: {cell: 'node1', port: 'port_right'},
        target: {cell: 'node2', port: 'port_left'},
      },
      {
        shape: 'double-edge',
        source: 'node3',
        target: 'node4',
      },
      {
        source: {cell: 'node5', port: 'port_1'},
        target: {cell: 'node6', port: 'port_3'},
        attrs: {
          line: {
            stroke: '#000',
            strokeWidth: 1,
          }
        }
      },
    ],
  };

  export default data;

  const tree = [
    {
      key: '-1',
      type: 'home',
      title: 'a',
      parent: null,
      children: [
        {
          key: '1-1',
          type: 'home',
          title: 'a-1',
          parent: '-1',
          children: [],
          contents: [
            {
              data: [],
              key: 'c-2',
              parent: '1-1'
            }
          ]
        }
      ],
      contents: [
        {
          data: [],
          key: 'c-1',
          parent: '-1'
        }
      ]
    }
  ]