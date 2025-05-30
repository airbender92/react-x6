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

        Object.entries(controlsRef.current).forEach(([key, element]) => {
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
    if(selectedElement && parentRef.current) {
       selectedElement.scrollIntoView({
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
                                                <ContainerSubControl
                                                    key={subItem.id}
                                                    dispatch={dispatch}
                                                    editorActions={editorActions}
                                                    editorState={editorState}
                                                    content={subItem}
                                                    activeTreeNode={activeTreeNode}
                                                />
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