const data = {
    nodes: [
      {
        id: 'node1',
        x: 140,
        y: 40,
        shape: 'custom-react-node',
        label: 'hello'
      },
      {
        id: 'node2',
        x: 280,
        y: 240,
        width: 100,
        height: 40,
        attrs: {
          body: {
            fill: '#F39C12',
            stroke: '#000',
            rx: 16,
            ry: 16,
          },
          label: {
            text: 'World',
            fill: '#333',
            fontSize: 18,
            fontWeight: 'bold',
            fontVariant: 'small-caps',
          },
        },
      },
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
      },
    ],
  };

  export default data;