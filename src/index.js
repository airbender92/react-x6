import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from '@/routes';
import { Provider } from 'react-redux'
import { ConfigProvider} from 'antd'
import store from './redux/store'
import 'antd/dist/antd.less'

ReactDOM.createRoot(document.getElementById('root')).render(
<Provider store={store}>
      <ConfigProvider theme={{ token: { colorPrimary: '#000' } }}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </Provider>
);