import React from "react";
import { useDispatch, useSelector } from 'react-redux'
import actions from "@/redux/actions/user";

const User = () => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user);
    const {count, name} = user;
    return (
        <div>
            <button onClick={() => dispatch(actions.increment())}>增加</button>
            <button onClick={() => dispatch(actions.decrement())}>减少</button>
            <button onClick={() => dispatch(actions.fetchUser())}>获取用户</button>
            <p>User: {name}</p>
            <p>count: {count}</p>
        </div> 
    )
}

export default User;