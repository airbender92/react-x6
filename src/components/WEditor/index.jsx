

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { changeMode } from "@/redux/actions/weditor";

import CustomEditorText from './CustomEditorText'
import UploadLogo from './UploadLogo' 
import CustomTable from './CustomTable';

function WEditor() {
  const dispatch = useDispatch();
  const weditorState = useSelector(state => {
    console.log('ssssstate', state)
    return state.weditor;
  });
  const { mode } = weditorState;
return (
<div>
    <span>WEditor组件内部: {mode}</span>
    <button onClick={() => dispatch(changeMode('preview'))}>WEditor组件内部触发preview</button>
    <button onClick={() => dispatch(changeMode('edit'))}>WEditor组件内部触发edit</button>
    <CustomEditorText />
    <UploadLogo />
    <CustomTable />
  </div>
)
}


export default WEditor;