/**
 * 删除当前节点时要重置选中的节点
 */
export const resetSelectedNode = (deletedNode, treeData) => {
  // 如果删除的节点没有父节点，则它是根节点
  if(deletedNode.parentId === 0) {
    const deletedNodeIndex = treeData.findIndex(item => item.id === deletedNode.id);
    if(deletedNodeIndex > 0) {
        return treeData[deletedNodeIndex - 1]; // 返回前一个兄弟节点
    } 
    if(deletedNodeIndex < treeData.length - 1) {
        return treeData[deletedNodeIndex + 1]; // 返回后一个兄弟节点
    }
    return null; // 如果没有兄弟节点，返回null
  }
  const parentNode = findNodeByKey(treeData, deletedNode.parent); // 找到父节点
  const siblings = parentNode.children || []; // 获取兄弟节点
  const deletedNodeIndex = siblings.findIndex(item => item.id === deletedNode.id);
  if(deletedNodeIndex > 0) {
      return siblings[deletedNodeIndex - 1]; // 返回前一个兄弟节点
  }
  if(deletedNodeIndex < siblings.length - 1) {
      return siblings[deletedNodeIndex + 1]; // 返回后一个兄弟节点 
  }
  return parentNode; // 如果没有兄弟节点，返回父节点
}


/**
 * 找到匹配节点
 */
export function findNodeByKey(treeData, id) {
  for(let i = 0; i < treeData.length; i++) {
    if(treeData[i].id === id) {
      return treeData[i]; // 找到匹配的节点，返回它
    }
    if(treeData[i].children && treeData[i].children.length > 0) {
      const result = findNodeByKey(treeData[i].children, id); // 递归查找子节点
      if(result) {
        return result; // 找到匹配的节点，返回它
      } 
    }
  }
  return null; // 没有找到匹配的节点，返回null
}

/**
 * 新增节点
 */
export function addTreeNode(tree, uniqueKeyName, params, childrenKey="children") {
    let updatedTree;
    if(Array.isArray(tree)) {
     let found = false;
     const newTree = tree.map(node => {
      const [updatedNode, isFound] = addNode(node, uniqueKeyName, params, childrenKey);
      if(isFound) {
        found = true;
      }
      return updatedNode;
     }); 
     updatedTree = found ? newTree : [...newTree, params];
    } else {
    const  [updatedNode, found] = addNode(tree, uniqueKeyName, params, childrenKey);
    updatedTree = found ? updatedNode : {updatedNode, params };
    }
    return updateTreeIndex(updatedTree); // 重新计算索引
}

function addNode(node, uniqueKeyName, params, childrenKey) {
  if(node[uniqueKeyName] === params[uniqueKeyName]) {
    return [{
      ...node,
      ...params,
      [childrenKey]: node[childrenKey] ? [...node[childrenKey], params] : [params]
    }, true]; // 找到匹配的节点，返回它
  }
  let found = false;
  const newChildren = node[childrenKey]?.map(child => {
    const [updatedChild, isFound] = addNode(child, uniqueKeyName, params, childrenKey);
    if(isFound) {
      found = true;
    }
    return updatedChild;
  }); 
  return [
    newChildren.length ? {...node, [childrenKey]: newChildren} : node,
    found
  ]
}

/**
 * 匹配关键词，更新指定属性值，用于树更新
 */
export function updateTree(tree, uniqueKeyName, uniqueKeyValue, targetKey, newValue, childrenKey="children") {
    if(Array.isArray(tree)) {
      return tree.map(node => updateTreeNode(node, uniqueKeyName, uniqueKeyValue, targetKey, newValue, childrenKey)); 
    }
    return updateTreeNode(tree, uniqueKeyName, uniqueKeyValue, targetKey, newValue, childrenKey);
}

function updateTreeNode(node, uniqueKeyName, uniqueKeyValue, targetKey, newValue, childrenKey) {
 const newNode = { ...node };
 if(newNode[uniqueKeyName] === uniqueKeyValue) {
  newNode[targetKey] = newValue; // 找到匹配的节点，更新它
 } 
 if(newNode[childrenKey]) {
  newNode[childrenKey] = newNode[childrenKey].map(child => updateTreeNode(child, uniqueKeyName, uniqueKeyValue, targetKey, newValue, childrenKey));
 }
 return newNode;
}

/**
 * 匹配关键词，删除节点及其子节点
 */
export function deleteTreeNode(tree, uniqueKeyName, uniqueKeyValue, childrenKey="children") {
    let updatedTree;
    if(Array.isArray(tree)) {
     updateTree = tree.map(node => deleteNode(node, uniqueKeyName, uniqueKeyValue, childrenKey)).filter(Boolean);
    } else {
      updatedTree = deleteNode(tree, uniqueKeyName, uniqueKeyValue, childrenKey);
    }
    return updateTreeIndex(updatedTree); // 重新计算索引
}

function deleteNode(node, uniqueKeyName, uniqueKeyValue, childrenKey) {
  if(node[uniqueKeyName] === uniqueKeyValue) {
    return null; // 找到匹配的节点，返回它 
  } 
  const newNode = {...node };
  if(newNode[childrenKey]) {
    newNode[childrenKey] = newNode[childrenKey].map(child => deleteNode(child, uniqueKeyName, uniqueKeyValue, childrenKey)).filter(Boolean);
  }
  return newNode;
}

// 更新标题索引
function updateTreeIndex(tree){
    return Array.isArray(tree) ? tree.map((node, index) => generateIndex(node, `${index+1}`)) : generateIndex(tree, '1');
}

function generateIndex(node, parentIndex) {
 const newNode = {...node, index: parentIndex };
 if(newNode.children) {
  newNode.children = newNode.children.map((child, index) => generateIndex(child, `${parentIndex}.${index+1}`)); 
 }
 return newNode;
}


/**
 * 新增要素
 */
export function addYaosu(tree, targetParentKey, newContent) {
    function traverse(nodeList){
        return nodeList.map(node => {
            const newNode = {...node};
            if(node.id === targetParentKey) {
                newNode.contents = (node.contents || []).concat(newContent);
                return newNode;
            }
            if(node.children) {
                newNode.children = traverse(node.children); 
            }
            return newNode;
        })
    }
    return traverse(tree);
}

/**
 * 删除要素
 */
export function deleteYaosu(tree, targetParentKey, contentKeyToRemove) {
    function traverse(nodeList) {
        return nodeList.map(node => {
            const newNode = {...node};
            if(node.id === targetParentKey) {
                newNode.contents = (node.contents || []).filter(content => content.id !== contentKeyToRemove);
                return newNode;
            }
            if(node.children) {
                newNode.children = traverse(node.children);
            }
            return newNode; 
        }) 
    }
    return traverse(tree);
}

/**
 * 匹配关键词，更新要素
 */
export function updateYaosu(tree, targetParentKey, contentToUpdate) {
    function traverse(nodeList) {
        return nodeList.map(node => {
            const newNode = {...node};
            if(node.id === targetParentKey) {
                newNode.contents = (node.contents || []).map(content => content.id === contentToUpdate.id ? {...content,...contentToUpdate} : content);
                return newNode;
            } 
            if(node.children) {
                newNode.children = traverse(node.children); 
            }
            return newNode;
        }) 
    }
    return traverse(tree);
}

