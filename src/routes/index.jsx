import { createHashRouter } from 'react-router-dom';
import App from '@/App';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import EditorPage from '@/pages/EditorPage';
import UserPage from '@/pages/UserPage';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'user',
        element: <UserPage />
      },
      {
        path: 'editor',
        element: <EditorPage />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

export default router;