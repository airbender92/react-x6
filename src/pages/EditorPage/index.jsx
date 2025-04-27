import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import WEditor from "@/components/WEditor";
import userActions from '@/redux/actions/user'
import { changeMode } from "@/redux/actions/weditor";

const EditorPage = () => {
   const dispatch = useDispatch();
    const weditorState = useSelector(state => state.weditor);
    const userState = useSelector(state => state.user);
    const { mode } = weditorState;
  return (
    <div>
      <h1>Editor Page</h1>
      <div className='test-demo'>
        <div>{mode}</div>
        <div>{userState.count}</div>
        <button onClick={() => dispatch(changeMode('edit'))}>edit Mode</button>
        <button onClick={() => dispatch(changeMode('preview'))}>Preview Mode</button>
        <button onClick={() => dispatch(userActions.increment())}>increament</button>
      </div>
        <WEditor />
    </div>
  );
};

export default EditorPage;