
const initialState = {
  mode: 'edit', // edit or preview
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'weditor/CHANGE_MODE':
        return {
            ...state,
            mode: action.payload,
        }
        default:
        return state
    }
}

export default reducer;