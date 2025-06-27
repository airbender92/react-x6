import React, {useEffect} from 'react'
import { Outlet } from 'react-router-dom';
import 'antd/dist/antd.css';
import './App.css';

function App() {

  useEffect(() => {
    window.listenThings = window.listenThings || {};
    // 只设置一次事件监听器
    const handleMessage = (e) => {
       for(key in window.listenThings) {
          window.listenThings[key] && window.listenThings[key](e);
        }
    }

    // 添加事件监听器
    window.addEventListener('message', handleMessage);
    // 注册添加和删除监听函数
    window.addListenMessage = (key, callback) => {
      window.listenThings[key] = callback;
    }

    window.delListenMessage = (key) => {
      delete window.listenThings[key];
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
  return (
    <div className="app-container">
      {/* 这里可以放公共头部、导航等 */}
      <main>
        <Outlet />
      </main>
      {/* 这里可以放公共底部 */}
    </div>
  );
}

export default App;