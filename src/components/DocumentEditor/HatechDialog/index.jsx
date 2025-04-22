import React from 'react';
import { ElDialog, ElButton } from 'element-react';
import 'element-theme-default';

// 定义样式变量
const dialogSizes = {
  large: '800px',
  normal: '650px',
  small: '500px',
  mini: '400px',
  cron: '440px'
};

const HatechDialog = ({ hatechDialog, form }) => {
  const handleDialogClose = (done) => {
    if (form.name && hatechDialog?.$refs?.[form.name]) {
      hatechDialog.$refs[form.name].resetFields();
    }
    done();
  };

  const handleFormSubmit = (param) => {
    param.id = form.data.id;
    param.row = form.data;
    if (hatechDialog[param.fun]) {
      return hatechDialog[param.fun].call(null, param);
    }
    return '';
  };

  const handleCloseDialog = () => {
    if (form.close && hatechDialog[form.close]) {
      return hatechDialog[form.close].call(null, form);
    }
    return '';
  };

  let minWidth = '';
  if (form.dialogSize && dialogSizes[form.dialogSize]) {
    minWidth = dialogSizes[form.dialogSize];
  }

  return (
    form.dialogFormVisible && (
      <div className="hatech-dialog">
        <ElDialog
          className={form.dialogSize ? `hatech-dialog-${form.dialogSize}` : ''}
          title={form.title}
          visible={form.dialogFormVisible}
          onCancel={(done) => handleDialogClose(done)}
          top={form.top}
          width={form.formWidth}
          closeOnClickModal={false}
          modal={false}
          appendToBody={form.appendToBody}
          onClose={handleCloseDialog}
        >
          <div>{form.children}</div>
          <div slot="footer" className="dialog-footer">
            {Object.entries(form.formOption).map(([key, option]) => (
              option.isShow && (
                <ElButton
                  key={key}
                  type={option.type}
                  size={option.size}
                  onClick={() => handleFormSubmit({ key, fun: option.fun, option })}
                >
                  {option.name}
                </ElButton>
              )
            ))}
          </div>
        </ElDialog>
      </div>
    )
  );
};

export default HatechDialog;
