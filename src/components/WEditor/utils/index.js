function updateTree(tree, targetKey, newTitle) {
    // 处理当前节点是数组的情况（例如多根节点）
    if (Array.isArray(tree)) {
      return tree.map(node => updateTreeNode(node, targetKey, newTitle));
    }
    // 处理单个根节点对象
    return updateTreeNode(tree, targetKey, newTitle);
  }
  
  function updateTreeNode(node, targetKey, newTitle) {
    // 创建新节点，浅拷贝原属性
    const newNode = { ...node };
    
    // 匹配到目标key时更新标题
    if (newNode.key === targetKey) {
      newNode.title = newTitle;
    }
    
    // 递归处理子节点
    if (newNode.children) {
      newNode.children = newNode.children.map(child => 
        updateTreeNode(child, targetKey, newTitle)
      );
    }
    
    return newNode;
  }


  function deleteTreeNode(tree, targetKey) {
    // 处理多根节点情况
    if (Array.isArray(tree)) {
      return tree.map(node => deleteNode(node, targetKey)).filter(Boolean)
    }
    // 处理单根节点
    return deleteNode(tree, targetKey)
  }
  
  function deleteNode(node, targetKey) {
    // 如果是目标节点，直接返回null进行删除
    if (node.key === targetKey) return null
  
    // 浅拷贝当前节点
    const newNode = { ...node }
  
    // 递归处理子节点
    if (newNode.children) {
      newNode.children = newNode.children
        .map(child => deleteNode(child, targetKey))
        .filter(Boolean) // 过滤掉被删除的null节点
    }
  
    return newNode
  }

  function addTreeNode(tree, parentKey, newNode) {
    // 处理多根节点情况
    if (Array.isArray(tree)) {
      let found = false;
      const newTree = tree.map(node => {
        const [updatedNode, isFound] = addNode(node, parentKey, newNode);
        if (isFound) found = true;
        return updatedNode;
      });
      // 未找到parentKey时在根层级追加
      return found ? newTree : [...newTree, newNode];
    }
    // 处理单根节点
    const [updatedNode, found] = addNode(tree, parentKey, newNode);
    return found ? updatedNode : [updatedNode, newNode];
  }
  
  function addNode(node, parentKey, newNode) {
    // 找到父节点时追加子节点
    if (node.key === parentKey) {
      return [{
        ...node,
        children: node.children ? [...node.children, newNode] : [newNode]
      }, true];
    }
  
    // 递归处理子节点
    let found = false;
    const newChildren = node.children?.map(child => {
      const [updatedChild, childFound] = addNode(child, parentKey, newNode);
      found ||= childFound; // 记录是否找到父节点
      return updatedChild;
    }) || [];
  
    return [
      newChildren.length ? { ...node, children: newChildren } : node,
      found
    ];
  }