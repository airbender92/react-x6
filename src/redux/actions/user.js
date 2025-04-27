const actions = {   
  increment: () => ({ type: 'user/INCREMENT' }),
  decrement: () => ({ type: 'user/DECREMENT' }),
  fetchUser: () => async (dispatch) => {
    const result = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ name: 'fabria' });
      }, 1000);
    }); 
    const user = await result;
    dispatch({ type: 'user/FETCH_USER', payload: user.name });
  }
}

export default actions;