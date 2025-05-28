import { useRef } from 'react';
import BundledEditor from './BundledEditor'


export default function App() {
  const editorRef = useRef(null);
  
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };



  return (
    <>
      <BundledEditor
        onInit={(_evt, editor) => editorRef.current = editor}
        initialValue='<p>This is the initial content of the editor.</p>'
        init={{
            license_key: 'gpl', // 使用开源免费版本
          height: 500,
          menubar: false,
          statusbar: false, // 隐藏状态栏
          plugins: [
            'advlist', 'anchor', 'autolink', 'help', 'image', 'link', 'lists',
            'searchreplace', 'table', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image ',
             advlist_bullet_styles: 'square',
  advlist_number_styles: 'lower-alpha,lower-roman,upper-alpha,upper-roman',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          
        }}
      />
      <button onClick={log}>Log editor content</button>
    </>
  );
}