import { createHashRouter } from 'react-router-dom';
import App from '@/App';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import EditorPage from '@/pages/EditorPage';
import UserPage from '@/pages/UserPage';
import DragPage from '@/pages/DragPage';
import AntdPage from '@/pages/AntdPage';
import TreePage from '@/pages/TreePage';
import WordPage from '@/pages/WordPage/index';
import Tinymce from '@/pages/Tinymce';
import StepTable from '@/pages/StepTable';

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
        path: 'antd',
        element: <AntdPage />
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
        path: 'drag',
        element: <DragPage />
      },
      {
        path: 'tree',
        element: <TreePage />
      },
      {
        path: 'word',
        element: <WordPage />,
      },
      {
        path: 'tinymce',
        element: <Tinymce />,
      },
      {
        path: 'steptable',
        element: <StepTable />,
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

export default router;