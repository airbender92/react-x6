import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Dialog,
  Row,
  Col
} from 'antd';
import SceneView from '../../../sceneManagement/views/AddsceneView';
import HatechBox from '../hatechBox/hatechBox';
import RadioTable from '../radioTable/radioTable';

const SceneList = ({ outlineId }) => {
  // 定义表格数据和状态
  const [table, setTable] = useState({
    title: '',
    id: 'draas-compoment-sceneList-table',
    url: '/scenes/app/scenes/scene/page',
    page: 1,
    limit: 10,
    pageSize: [10, 20, 50, 100],
    isIndexShow: false,
    data: [],
    radio: '',
    count: 0,
    selectMore: true,
    sort: {},
    mySlot: true,
    search: {
      groupId: '',
      name: '',
      sceneStatus: '6',
      sceneType: '1'
    },
    column: [
      { label: '场景名称', prop: 'name', width: 'auto', isHide: true, alignLeft: true },
      { label: '版本号', prop: 'version', width: 'auto', isHide: true, alignLeft: true },
      {
        label: '状态',
        prop: 'sceneStatus',
        width: 'auto',
        isHide: true,
        alignLeft: true,
        formatter: {
          1: '<span>已保存</span>',
          2: '<span>待审批</span>',
          3: '<span>已撤回</span>',
          4: '<span>已驳回</span>',
          5: '<span>已审批</span>',
          6: '<span>已发布</span>',
          7: '<span>已停用</span>',
          8: '<span>已变更</span>'
        }
      },
      { label: '创建人', prop: 'createUserName', width: 'auto', isHide: true, alignLeft: true },
      { label: '更新时间', prop: 'editTime', width: 'auto', isHide: true, alignLeft: true }
    ],
    showHeaderOption: false,
    headerOption: [],
    showTableOption: false,
    cellOptionWidth: '200px',
    cellOption: []
  });

  // 定义对话框数据和状态
  const [theSceneData, setTheSceneData] = useState({
    dialogFormVisible: false,
    top: '10vh',
    formWidth: '90%',
    title: '编辑场景',
    sceneId: '',
    outlineId,
    type: 'edit'
  });

  // 处理表格查询
  const onTableSearch = () => {
    // 假设 RadioTable 组件有 _initTable 方法
    // 这里可根据实际情况修改
    // this.$refs.radioTable._initTable();
  };

  // 处理表格重置
  const onTableReset = () => {
    setTable(prev => ({
      ...prev,
      search: {
        groupId: '',
        name: '',
        sceneStatus: '6',
        sceneType: '1'
      }
    }));
  };

  // 处理编辑操作
  const edit = () => {
    if (table.radio !== '') {
      setTheSceneData(prev => ({
        ...prev,
        type: 'edit',
        sceneId: table.radio,
        title: '编辑场景'
      }));
    } else {
      setTheSceneData(prev => ({
        ...prev,
        type: 'add',
        title: '新增场景'
      }));
    }
    setTheSceneData(prev => ({ ...prev, dialogFormVisible: true }));
  };

  // 处理对话框事件
  const dealDialog = (msg) => {
    setTheSceneData(prev => ({ ...prev, dialogFormVisible: msg.dialogShow }));
    if (!msg.flag) {
      // 模拟 $emit 事件
      console.log('translateListDialog event emitted with msg:', msg);
    }
  };

  return (
    <div id="sceneList">
      <HatechBox title={table.title}>
        <div className="hatech-content">
          <RadioTable radioTable={this} table={table}>
            <div className="hatech-search">
              <Form onFinish={onTableSearch}>
                <Row gutter={10}>
                  <Col span={8}>
                    <Form.Item label="场景名称" labelWidth={72} name="name">
                      <Input
                        v-model={table.search.name}
                        placeholder="请输入场景名称"
                        value={table.search.name}
                        onChange={(e) => setTable(prev => ({
                          ...prev,
                          search: { ...prev.search, name: e.target.value }
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item style={{ textAlign: 'right' }}>
                      <Button type="primary" htmlType="submit">
                        查询
                      </Button>
                      <Button onClick={onTableReset}>
                        清空
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </RadioTable>
        </div>
      </HatechBox>
      <Dialog
        closeOnClickModal={false}
        className="hatech-dialog-nodeInfo hatech-dialog-common scene-dialog sceneAddDialog"
        title={theSceneData.title}
        visible={theSceneData.dialogFormVisible}
        width={theSceneData.formWidth}
        top={theSceneData.top}
        onClose={() => setTheSceneData(prev => ({ ...prev, dialogFormVisible: false }))}
      >
        <SceneView
          onTranslateDialog={dealDialog}
          idObject={{
            id: theSceneData.sceneId,
            outlineId: theSceneData.outlineId,
            type: theSceneData.type
          }}
        />
      </Dialog>
    </div>
  );
};

export default SceneList;
