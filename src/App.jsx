import { Outlet } from 'react-router-dom';
import 'antd/dist/antd.css';
import './App.css';

function App() {
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