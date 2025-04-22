// baseTableRedux.js
export const createBaseTable = (prefix, api) => {
    // Action Types
    const SET_CURRENT_PAGE = `${prefix}/SET_CURRENT_PAGE`;
    const SET_PAGE_SIZE = `${prefix}/SET_PAGE_SIZE`;
    const SET_DATA = `${prefix}/SET_DATA`;
    const SET_LOADING = `${prefix}/SET_LOADING`;
    const SET_SEARCH_PARAMS = `${prefix}/SET_SEARCH_PARAMS`;
    const RESET_SEARCH = `${prefix}/RESET_SEARCH`;
    const SET_TOTAL = `${prefix}/SET_TOTAL`;
  
    // Action Creators
    const actions = {
      setCurrentPage: (page) => ({ type: SET_CURRENT_PAGE, payload: page }),
      setPageSize: (size) => ({ type: SET_PAGE_SIZE, payload: size }),
      setData: (data) => ({ type: SET_DATA, payload: data }),
      setLoading: (loading) => ({ type: SET_LOADING, payload: loading }),
      setSearchParams: (params) => ({ type: SET_SEARCH_PARAMS, payload: params }),
      resetSearch: () => ({ type: RESET_SEARCH }),
      setTotal: (total) => ({ type: SET_TOTAL, payload: total }),
    };
  
    // Reducer
    const initialState = {
      currentPage: 1,
      pageSize: 10,
      data: [],
      total: 0,               // 总数据量
      hasMoreData: true,      // 是否有更多数据
      loading: false,
      searchParams: {},       // 搜索条件对象
    };
  
    const reducer = (state = initialState, action) => {
      switch (action.type) {
        case SET_CURRENT_PAGE:
          return { ...state, currentPage: action.payload };
        case SET_PAGE_SIZE:
          return { ...state, pageSize: action.payload };
        case SET_DATA:
          return { ...state, data: action.payload };
        case SET_LOADING:
          return { ...state, loading: action.payload };
        case SET_SEARCH_PARAMS:
          return { 
            ...state, 
            searchParams: { ...state.searchParams, ...action.payload },
          };
        case RESET_SEARCH:
          return { 
            ...state,
            searchParams: initialState.searchParams,
            currentPage: 1, 
            hasMoreData: true, // 重置后默认认为有数据
          };
        case SET_TOTAL:
          return { 
            ...state, 
            total: action.payload,
            // 计算是否有更多数据（总条目数 > 当前页数 * 每页数量）
            hasMoreData: action.payload > state.currentPage * state.pageSize,
          };
        default:
          return state;
      }
    };
  
    // Thunk Action：获取分页数据
    const fetchTableData = () => async (dispatch, getState) => {
      const { baseTable } = getState()[prefix];
      const { currentPage, pageSize, searchParams } = baseTable;
  
      try {
        dispatch(actions.setLoading(true));
        const params = {
          page: currentPage,
          size: pageSize,
          ...searchParams,
        };
        const response = await api.fetchData(params);
        
        // 合并数据（分页加载更多场景）
        const newData = currentPage === 1 
          ? response.list 
          : [...baseTable.data, ...response.list];
  
        dispatch(actions.setData(newData));
        dispatch(actions.setTotal(response.total));
        
        // 自动计算 hasMoreData
        const hasMore = response.total > currentPage * pageSize;
        dispatch(actions.setHasMoreData(hasMore));
      } catch (error) {
        console.error('Fetch data failed:', error);
      } finally {
        dispatch(actions.setLoading(false));
      }
    };
  
    return { actions: { ...actions, fetchTableData }, reducer };
  };