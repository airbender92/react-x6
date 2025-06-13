<import React, {
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

    const { treeData, isTemplate } = editorState;

    const parentRef = useRef(null);
    const controlsRef = useRef({});
    const subControlsRef = useRef({});
    const isScrollingRef = useRef(false);
    const isTreeClickRef = useRef(false);
    const lastScrollTopRef = useRef(0);
    const scrollTimeoutRef = useRef(null);
    
    // 存储当前可见的节点ID
    const [visibleNodeId, setVisibleNodeId] = useState(null);
    
    // 用于存储 IntersectionObserver 实例
    const observerRef = useRef(null);
    
    // 滚动到顶部按钮状态
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    // 滚动位置状态，用于导航栏样式变化
    const [scrollPosition, setScrollPosition] = useState(0);
    
    // 记录最后一次选中的节点ID
    const lastSelectedNodeIdRef = useRef(null);
    
    // 记录节点的层级关系
    const nodeHierarchyRef = useRef({});

    // 初始化节点层级关系
    useEffect(() => {
        const buildHierarchy = (nodes, parentId = null, level = 0) => {
            if (!nodes) return;
            
            nodes.forEach(node => {
                nodeHierarchyRef.current[node.id] = {
                    level,
                    parentId
                };
                
                if (node.children && node.children.length > 0) {
                    buildHierarchy(node.children, node.id, level + 1);
                }
            });
        };
        
        buildHierarchy(treeData);
    }, [treeData]);

    // 初始化 IntersectionObserver
    useEffect(() => {
        // 创建一个 IntersectionObserver 实例
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-id');
                    setVisibleNodeId(id);
                    
                    // 只有当不是通过点击树节点触发的滚动时，才更新选中节点
                    if (!isTreeClickRef.current) {
                        const node = findNodeByKey(treeData, id);
                        if (node) {
                            dispatch(editorActions.setActiveTreeNode(node));
                        }
                    }
                }
            });
        }, {
            root: parentRef.current,
            rootMargin: '0px',
            threshold: 0.1 // 当元素可见度达到10%时触发
        });
        
        observerRef.current = observer;
        
        // 观察所有内容元素
        const observeElements = () => {
            // 先断开所有观察
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            
            // 重新观察所有元素
            Object.entries(controlsRef.current).forEach(([key, element]) => {
                if (element) {
                    element.setAttribute('data-id', key);
                    observerRef.current.observe(element);
                }
            });
            
            Object.entries(subControlsRef.current).forEach(([key, element]) => {
                if (element) {
                    element.setAttribute('data-id', key);
                    observerRef.current.observe(element);
                }
            });
        };
        
        // 初始观察
        observeElements();
        
        // 当内容列表变化时重新观察
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [treeData, contentList]);

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
            
            // 更新滚动位置状态，用于导航栏样式变化
            setScrollPosition(parentElement.scrollTop);
            
            // 显示/隐藏回到顶部按钮
            setShowBackToTop(parentElement.scrollTop > 300);
            
            // 设置超时，滚动停止后处理
            scrollTimeoutRef.current = setTimeout(() => {
                if(!isScrollingRef.current) {
                    updateSelectedNodeByScroll(activeTreeNode?.id);
                }
                isScrollingRef.current = false;
                isTreeClickRef.current = false;
            }, 100); // 100ms 后无滚动，视为停止
        };
        
        parentElement.addEventListener('scroll', handleScroll);
        return () => parentElement.removeEventListener('scroll', handleScroll);
    }, [activeTreeNode?.id]);

    // 根据滚动位置更新选中节点 - 改进版本
    const updateSelectedNodeByScroll = (currentSelectedKey) => {
        const parentElement = parentRef.current;
        if (!parentElement) return;
        
        requestAnimationFrame(() => {
            const parentRect = parentElement.getBoundingClientRect();
            const parentTop = parentRect.top;
            const parentBottom = parentRect.bottom;
            const parentMiddle = (parentTop + parentBottom) / 2;

            // 收集所有在视口中的节点
            const visibleNodes = [];

            const allNodes = [
                ...Object.entries(controlsRef.current).map(([key, element]) => ({key, element, type: 'normal'})),
                ...Object.entries(subControlsRef.current).map(([key, element]) => ({key, element, type: 'sub'})),
            ];

            allNodes.sort((a, b) => {
                if(a.type === 'sub' && b.type === 'normal') {
                    return -1;
                }
                if(a.type === 'normal' && b.type === 'sub') {
                    return 1;
                }
                return 0;
            });

            allNodes.forEach(({key, element, type}) => {
                if(!element) return;
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top;
                const elementHeight = rect.height;
                const elementBottom = rect.bottom;
                const elementMiddle = elementTop + elementHeight / 2;
                
                // 判断元素是否与视口有重叠部分
                const isOverlapping = elementBottom >= parentTop && elementTop <= parentBottom;
                
                if (isOverlapping) {
                    // 计算节点与视口中心的距离
                    const distanceToCenter = Math.abs(elementMiddle - parentMiddle);
                    
                    // 计算节点在视口中的可见比例
                    const visibleHeight = Math.min(elementBottom, parentBottom) - Math.max(elementTop, parentTop);
                    const visibleRatio = visibleHeight / elementHeight;
                    
                    visibleNodes.push({
                        id: key,
                        distanceToCenter,
                        visibleRatio,
                        elementTop,
                        elementBottom,
                        elementMiddle
                    });
                }
            });
            
            // 如果没有可见节点，不做任何操作
            if (visibleNodes.length === 0) {
                return;
            }
            
            // 按照距离视口中心的距离排序
            visibleNodes.sort((a, b) => a.distanceToCenter - b.distanceToCenter);
            
            // 找到最接近视口中心的节点
            let closestNode = visibleNodes[0];
            
            // 检查是否有父子关系的节点同时可见
            const filteredNodes = visibleNodes.filter(node => {
                // 查找该节点的所有父节点
                let parentId = nodeHierarchyRef.current[node.id]?.parentId;
                let hasParentVisible = false;
                
                while (parentId) {
                    // 检查父节点是否也在可见列表中
                    const parentVisible = visibleNodes.some(vn => vn.id === parentId);
                    if (parentVisible) {
                        hasParentVisible = true;
                        break;
                    }
                    
                    // 向上查找更高层级的父节点
                    parentId = nodeHierarchyRef.current[parentId]?.parentId;
                }
                
                // 如果有父节点可见，且父节点比当前节点更接近视口中心，则排除当前节点
                if (hasParentVisible) {
                    const parentNode = visibleNodes.find(vn => vn.id === parentId);
                    if (parentNode && parentNode.distanceToCenter < node.distanceToCenter) {
                        return false;
                    }
                }
                
                return true;
            });
            
            // 如果过滤后还有节点，使用过滤后的第一个节点
            if (filteredNodes.length > 0) {
                closestNode = filteredNodes[0];
            }
            
            // 最终选择的节点ID
            const keyToSelect = closestNode.id;
            
            // 防止节点在父子之间跳动的逻辑
            if (keyToSelect && keyToSelect !== currentSelectedKey) {
                // 检查是否是父子关系的节点切换
                const isParentChildRelationship = (nodeId1, nodeId2) => {
                    // 检查 nodeId1 是否是 nodeId2 的父节点
                    let parentId = nodeHierarchyRef.current[nodeId2]?.parentId;
                    while (parentId) {
                        if (parentId === nodeId1) return true;
                        parentId = nodeHierarchyRef.current[parentId]?.parentId;
                    }
                    
                    // 检查 nodeId2 是否是 nodeId1 的父节点
                    parentId = nodeHierarchyRef.current[nodeId1]?.parentId;
                    while (parentId) {
                        if (parentId === nodeId2) return true;
                        parentId = nodeHierarchyRef.current[parentId]?.parentId;
                    }
                    
                    return false;
                };
                
                // 如果是父子关系的节点切换，并且新节点的可见比例不够高，则保持当前选择
                if (
                    currentSelectedKey && 
                    isParentChildRelationship(keyToSelect, currentSelectedKey) && 
                    closestNode.visibleRatio < 0.5
                ) {
                    return; // 不更新选择，避免跳动
                }
                
                const newActiveNode = findNodeByKey(treeData, keyToSelect);
                if (newActiveNode) {
                    dispatch(editorActions.setActiveTreeNode(newActiveNode));
                    lastSelectedNodeIdRef.current = keyToSelect;
                }
            }
        });
    }

    const handleTreeSelect = (selectedNode) => {
        isTreeClickRef.current = true;
        const selectedElement = controlsRef.current[selectedNode?.id];
        const subSelectedElement = subControlsRef.current[selectedNode?.id];
        const dom = subSelectedElement || selectedElement;
        
        if(dom && parentRef.current) {
            // 添加滚动前的高亮效果
            const allElements = [
                ...Object.values(controlsRef.current),
                ...Object.values(subControlsRef.current)
            ];
            
            allElements.forEach(el => {
                if (el) {
                    el.classList.remove('active-highlight');
                }
            });
            
            if (dom) {
                dom.classList.add('active-highlight');
                setTimeout(() => {
                    dom.classList.remove('active-highlight');
                }, 1500);
            }
            
            // 滚动到元素
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
            );
        }
    }
    
    // 回到顶部
    const scrollToTop = () => {
        if (parentRef.current) {
            parentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    useImperativeHandle(ref, () => ({
        handleTreeSelect,
    }));

    return (
        <div className={`${styles.documentContentWrapper} relative`} ref={parentRef}>
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
                                <div 
                                    ref={el => controlsRef.current[item.id] = el}
                                    className={`${activeTreeNode?.id === item.id ? 'active-section' : ''}`}
                                >
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
                                                    <div 
                                                        ref={el => {
                                                            if (subItem.moduleType === 'scene') {
                                                                subControlsRef.current[subItem.id] = el;
                                                            }
                                                        }}
                                                        className={`${activeTreeNode?.id === subItem.id ? 'active-section' : ''}`}
                                                    >
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
            
            {/* 回到顶部按钮 */}
            <button 
                className={`fixed right-4 bottom-4 bg-primary text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
                    showBackToTop ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                } hover:bg-primary/90 focus:outline-none`}
                onClick={scrollToTop}
            >
                <i className="fa fa-chevron-up"></i>
            </button>
        </div>
    );
});

export default DocumentContent;
