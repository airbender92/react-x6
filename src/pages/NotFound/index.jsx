import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="not-found">
      <h1>404 - 页面不存在</h1>
      <Button type="primary" onClick={() => navigate('/')}>
        返回首页
      </Button>
    </div>
  );
}