import React, {
    forwardRef,
    useRef,
    useContext,
    useState,
    useEffect,
    useImperativeHandle,
} from 'react';
import {
    ContainerControl,
    ContainerSubControl,
} from '../components/ContainerControl'
import {
DndContext,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { findNodeByKey } from '../utils';
import styles from './index.less';

const DocumentContent = forwardRef((props, ref) => {
   const {
    dispatch,
    editorActions,
    editorState,
    activeTreeNode,
    contentList = []
   } = props; 

   const { treeData, isTemplate} = editorState;

   const parentRef = useRef(null);
const controlsRef = useRef({});
const subControlsRef = useRef({});
const isScrollingRef = useRef(false);
const isTreeClickRef = useRef(false);
const lastScrollTopRef = useRef(0);
const scrollTimeoutRef = useRef(null);

useEffect(() => {
const parentElement = parentRef.current;
if (!parentElement) return;

const handleScroll = () => {
    if(scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
    }
   // 标记正在滚动
    isScrollingRef.current = true;
    lastScrollTopRef.current = parentElement.scrollTop;
    // 设置超时，滚动停止后处理
    scrollTimeoutRef.current = setTimeout(() => {
       if(!isScrollingRef.current) {
        updateSelectedNodeByScroll(activeTreeNode?.id);
       };
       isScrollingRef.current = false;
       isTreeClickRef.current = false;
    },100); // 100ms 后无滚动，视为停止
};
parentElement.addEventListener('scroll', handleScroll);
return () => parentElement.removeEventListener('scroll', handleScroll);
}, [activeTreeNode?.id]);

// 根据滚动位置更新选中节点
const updateSelectedNodeByScroll = (currentSelectedKey) => {
    const parentElement = parentRef.current;
    if (!parentElement) return;
    requestAnimationFrame(() => {
        const parentRect = parentElement.getBoundingClientRect();
        const parentTop = parentRect.top;
        const parentBottom = parentRect.bottom;

        let closetKey = null;
        let smallestDistance = Infinity;
        let firstInViewKey = null;
        let firstInViewTop = Infinity;

        const allNodes = [
            ...Object.entries(controlsRef.current).map(([key, element]) => ({key, element, type: 'normal'})),
            ...Object.entries(subControlsRef.current).map(([key, element]) => ({key, element, type: 'sub'})),
        ]

        allNodes.sort((a, b) => {
          if(a.type === 'sub' && b.type === 'normal') {
            return -1;
          }
          if(a.type === 'normal' && b.type === 'sub') {
            return 1;
          }
        })

        allNodes.forEach(({key, element, type}) => {
           if(!element) return;
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top;
            const elementHeight = rect.height;
            const elementMiddle = elementTop + elementHeight / 2;
            const distanceToParentTop = Math.abs(elementMiddle - parentTop);
           // 找到第一个顶部在父容器内的元素
            if (elementTop >= parentTop && elementTop < firstInViewTop) {
                closetKey = key;
                firstInViewTop = elementTop;
            }
            if(elementTop <= parentBottom && elementTop + elementHeight >= parentTop && distanceToParentTop < smallestDistance) {
                closetKey = key;
                smallestDistance = distanceToParentTop;
            }
        });
     // 如果没有元素完全在父容器内，选择第一个顶部在父容器内的元素
     let keyToSelect = closetKey || firstInViewKey;
        
     // 新增逻辑：检查选中节点是否有子节点，并在视口内的子节点中选择
     if (keyToSelect) {
         // 查找当前选中节点
         const selectedNode = findNodeByKey(treeData, keyToSelect);
         
         // 如果找到节点且有子节点
         if (selectedNode && selectedNode.children && selectedNode.children.length > 0) {
             let bestChildKey = null;
             let bestChildDistance = Infinity;
             
             // 检查所有子节点
             selectedNode.children.forEach(child => {
                 const childElement = subControlsRef.current[child.id];
                 if (childElement) {
                     const rect = childElement.getBoundingClientRect();
                     const elementTop = rect.top;
                     const elementHeight = rect.height;
                     const elementMiddle = elementTop + elementHeight / 2;
                     
                     // 检查子节点是否在视口内
                     if (elementTop <= parentBottom && elementTop + elementHeight >= parentTop) {
                         const distanceToParentTop = Math.abs(elementMiddle - parentTop);
                         // 找到距离容器顶部最近的子节点
                         if (distanceToParentTop < bestChildDistance) {
                             bestChildDistance = distanceToParentTop;
                             bestChildKey = child.id;
                         }
                     }
                 }
             });
             
             // 如果找到合适的子节点，使用子节点的key
             if (bestChildKey) {
                 keyToSelect = bestChildKey;
             }
         }
     }
        if(keyToSelect && keyToSelect !== currentSelectedKey) {
            const newActiveNode = findNodeByKey(treeData, closetKey);
            if(newActiveNode) {
                dispatch(editorActions.setActiveTreeNode(newActiveNode));
            }
     
        }
    })

}

const handleTreeSelect = (selectedNode) => {
    isTreeClickRef.current = true;
    const selectedElement = controlsRef.current[selectedNode?.id];
    const subSelectedElement = subControlsRef.current[selectedNode?.id];
    const dom = subSelectedElement || selectedElement;
    if(dom && parentRef.current) {
       dom.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
       });
    }
}

useEffect(() => {
    if(isTreeClickRef.current) {
        return;
    }
}, [activeTreeNode?.id]);

const flattenContentList = (contentList) => {
    return contentList.reduce((acc, item) => {
        acc.push(item);
        if(item.children && item.children.length > 0) {
            acc.push(...flattenContentList(item.children));
        }
        return acc;
    }, []);
}

  const flattedContentDatas = flattenContentList(contentList);

  const onDragEnd = ({active, over}) => {
    if(active?.id !== over?.id) {
     const menuId = active?.data?.current?.menuId;
     const matchedWrapper = flattedContentDatas.find((item) => item.id === menuId);
     const activeIndex = matchedWrapper?.contents?.findIndex((item) => item.id === active?.id); 
    const overIndex = matchedWrapper?.contents?.findIndex((item) => item.id === over?.id);

    const newContents = arrayMove(matchedWrapper?.contents || [], activeIndex, overIndex);
    dispatch(
        editorActions.sortedContentAsync({
            id: menuId,
            isTemplate,
            contents: newContents.map((item, index) => ({...item, sort: index + 1})),
        })
    )
    }
  }

  useImperativeHandle(ref, () => ({
    handleTreeSelect,
  }));

  return (
    <div className={styles.documentContentWrapper} ref={parentRef}>
        {
            flattedContentDatas.map((item, index) => {
                return (
                    <DndContext
                        key={item.id}
                        onDragEnd={onDragEnd}
                        modifiers={[verticalListSortingStrategy]}
                    >
                        <SortableContext items={(item.contents || []).map(i => i.id)}
                            strategy={verticalListSortingStrategy}    
                        >
                            <div ref={el => controlsRef.current[item.id] = el}>
                                <ContainerControl
                                    key={item.id}
                                    dispatch={dispatch}
                                    editorActions={editorActions}
                                    editorState={editorState}
                                    item={item}
                                    activeTreeNode={activeTreeNode}
                                >
                                    {
                                        (item.contents || [])?.map((subItem, subIndex) => {
                                            return (
                                                <div ref={el => {
                                                    if(content.moduleType === 'scene') {
                                                        subControlsRef.current[subItem.id] = el;
                                                    }
                                                }}>
                                                    <ContainerSubControl
                                                        key={subItem.id}
                                                        dispatch={dispatch}
                                                        editorActions={editorActions}
                                                        editorState={editorState}
                                                        content={subItem}
                                                        activeTreeNode={activeTreeNode}
                                                    />
                                                </div>
                                            ) 
                                        })
                                    }
                                </ContainerControl>
                            </div>
                        </SortableContext>
                    </DndContext>
                )
            })
        }
    </div>
  )

});

export default DocumentContent;