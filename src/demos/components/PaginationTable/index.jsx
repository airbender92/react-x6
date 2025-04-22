import React from 'react';
import { Table, Pagination } from 'antd';

const PaginationTable = ({
  columns, // 表格列配置
  dataSource, // 表格数据源
  total, // 数据总数
  currentPage = 1, // 当前页码
  pageSize = 10, // 每页显示数量
  onPageChange // 页码变化回调
}) => {
  const handlePaginationChange = (page, pageSize) => {
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false} // 关闭内置分页
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={handlePaginationChange}
        showQuickJumper
        showSizeChanger
      />
    </div>
  );
};

export default PaginationTable;