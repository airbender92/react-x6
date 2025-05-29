import React, {useState, useEffect } from "react";
import { useHistory, Prompt} from "react-router-dom";
import { Modal} from 'antd'

export const NavigationBlocker = (props) => {
const {
    when,
    message = '确认离开当前页面吗？'
} = props;
// 是否进入Prompt的拦截模式，默认进入，在点击确认跳转后，block为false，不再进入拦截模式
const [block, setBlock] = useState(true);
const [nextLocation, setNextLocation] = useState('');
const [showConfirm, setShowConfirm] = useState(false);
const history = useHistory();

const confirmNavigation = (location) => {
    // 返回true代表直接跳转
    if(!when) return true;
    setNextLocation(location);
    setShowConfirm(true);

    // 阻止默认导航
    return false;
}

const handleConfirm = (allow) => {
    setShowConfirm(false);
    if(allow) {
        // 这是就不走confirmNavigation了，直接跳转
        setBlock(false);
        setTimeout(() => {
            history.push(nextLocation.pathname);
        },0)
    }
}
return (
    <>
        <Prompt when={block} message={confirmNavigation}/>
        <Modal
            title="提示"
            open={showConfirm}
            onOk={() => handleConfirm(true)}
            onCancel={() => handleConfirm(false)}
            okText="确定"
            cancelText="取消"
        >
            <p>{message}</p>
        </Modal> 
    </>
)


}