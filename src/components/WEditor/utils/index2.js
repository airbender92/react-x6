// 带索引的
// 更新树节点标题
function updateTree(tree, targetKey, newTitle) {
    const updatedTree = Array.isArray(tree)
      ? tree.map(node => updateTreeNode(node, targetKey, newTitle))
      : updateTreeNode(tree, targetKey, newTitle);
    
    return updateTreeIndex(updatedTree);
  }
  
  function updateTreeNode(node, targetKey, newTitle) {
    const newNode = { ...node };
    if (newNode.key === targetKey) newNode.title = newTitle;
    if (newNode.children) {
      newNode.children = newNode.children.map(child => 
        updateTreeNode(child, targetKey, newTitle)
      );
    }
    return newNode;
  }
  
  // 删除树节点
  function deleteTreeNode(tree, targetKey) {
    const updatedTree = Array.isArray(tree)
      ? tree.map(node => deleteNode(node, targetKey)).filter(Boolean)
      : deleteNode(tree, targetKey);
    
    return updateTreeIndex(updatedTree);
  }
  
  function deleteNode(node, targetKey) {
    if (node.key === targetKey) return null;
    const newNode = { ...node };
    if (newNode.children) {
      newNode.children = newNode.children
        .map(child => deleteNode(child, targetKey))
        .filter(Boolean);
    }
    return newNode;
  }
  
  // 添加树节点
  function addTreeNode(tree, parentKey, newNode) {
    let updatedTree;
    
    if (Array.isArray(tree)) {
      let found = false;
      const newTree = tree.map(node => {
        const [updatedNode, isFound] = addNode(node, parentKey, newNode);
        if (isFound) found = true;
        return updatedNode;
      });
      updatedTree = found ? newTree : [...newTree, newNode];
    } else {
      const [updatedNode, found] = addNode(tree, parentKey, newNode);
      updatedTree = found ? updatedNode : [updatedNode, newNode];
    }
    
    return updateTreeIndex(updatedTree);
  }
  
  function addNode(node, parentKey, newNode) {
    if (node.key === parentKey) {
      return [{
        ...node,
        children: node.children ? [...node.children, newNode] : [newNode]
      }, true];
    }
    
    let found = false;
    const newChildren = node.children?.map(child => {
      const [updatedChild, childFound] = addNode(child, parentKey, newNode);
      found ||= childFound;
      return updatedChild;
    }) || [];
    
    return [
      newChildren.length ? { ...node, children: newChildren } : node,
      found
    ];
  }
  
  // 生成节点索引
  function updateTreeIndex(tree) {
    return Array.isArray(tree)
      ? tree.map((node, index) => generateIndex(node, `${index}.0`))
      : generateIndex(tree, '0.0');
  }
  
  function generateIndex(node, parentIndex) {
    const newNode = { ...node, index: parentIndex };
    
    if (newNode.children) {
      newNode.children = newNode.children.map((child, i) => {
        const childIndex = `${parentIndex}.${i}`;
        return generateIndex(child, childIndex);
      });
    }
    
    return newNode;
  }