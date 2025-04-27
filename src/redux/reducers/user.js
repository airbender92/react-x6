
const initialState = {
  count: 0,
  name: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'user/INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'user/DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'user/RESET':
      return {...state, count: 0 };
    case 'user/FETCH_USER':
        return {...state, name: action.payload }; // 假设action.payload是用户数据，将其存储在state.user中
    default:
      return state;
  }
};

export default reducer;