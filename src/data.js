const data = {
    nodes: [
      {
        id: 'node1',
        x: 140,
        y: 40,
        shape: 'custom-react-node',
        label: 'hello',
      },
      {
        id: 'node2',
        x: 280,
        y: 240,
        width: 100,
        height: 40,
       shape: 'custom-node',
        label: 'hello2'
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