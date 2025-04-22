import React, { useState, useEffect, useRef } from 'react';
import { Table, Pagination, Popover, Checkbox, Spin, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import PrePlanManageService from '../../../prePlanManage/service/prePlanManage';

const prePlanservice = new PrePlanManageService();

const HatechTable = ({ hatechTable, table }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [headerOptionByShow, setHeaderOptionByShow] = useState([]);
  const [columnByHide, setColumnByHide] = useState([]);
  const tableRef = useRef(null);

  // 计算新的单元格操作选项
  const newCellOption = (record) => {
    return table.cellOption.filter((v) => v.isShow && (!v.formatterKey || _controllOperationShow(v, record)));
  };

  // 控制操作项显示
  const _controllOperationShow = (option, record) => {
    let flag = true;
    option.formatterKey.forEach((v, i) => {
      if (typeof record[v] === 'boolean') {
        flag = flag && record[v];
      } else {
        option.value.forEach((a, b) => {
          if (Array.isArray(a)) {
            if (i === b) {
              flag = flag && a.includes(record[v]);
            }
          } else {
            flag = flag && a === record[v] && i === b;
          }
        });
      }
    });
    return flag;
  };

  // 初始化列显隐状态
  const _initCellIsHide = () => {
    prePlanservice[table.showCellUrl]({ tableName: table.id }).then((response) => {
      if (response.data) {
        const cell = JSON.parse(response.data.param);
        if (cell.length > 0) {
          const newColumn = table.column.map((clm) => {
            const found = cell.find((cel) => cel.prop === clm.prop);
            if (found) {
              return { ...clm, isHide: found.isHide, width: found.width };
            }
            return clm;
          });
          setColumnByHide(newColumn.filter((item) => item.isHide === true));
        }
      }
    }).catch(() => {
      setIsLoading(false);
    });
  };

  // 表格格式化点击处理
  const _onTableFmtClick = (param) => {
    if (hatechTable[param.event]) {
      return hatechTable[param.event](param);
    }
    return '';
  };

  // 表格操作按钮点击处理
  const _hatechTableOptionBtn = (param) => {
    if (param.row !== undefined) {
      param.select = [param.row];
    } else {
      param.select = table.select;
    }
    if (hatechTable[param.type]) {
      return hatechTable[param.type](param);
    }
    return '';
  };

  // 排序变化处理
  const _sortChange = (column) => {
    if (column && table.sort.custom) {
      table.sort.sortName = column.field;
      if (column.order === 'descend') {
        table.sort.sortType = 'DESC';
      } else {
        table.sort.sortType = 'ASC';
      }
      _initTable(1);
    }
  };

  // 行点击处理
  const _rowClick = (record) => {
    // 模拟 emit 事件
    console.log('row-click event emitted', record);
  };

  // 执行表格列操作
  const _excuteTable = (column, type) => {
    const newColumn = columnByHide.map((cell) => {
      if (cell.prop === column.prop) {
        if (type === 1) {
          return { ...cell, isHide: !column.isHide };
        } else {
          return { ...cell, width: column.width };
        }
      }
      return cell;
    });

    let cellString = '';
    newColumn.forEach((cell) => {
      cellString += `,{"prop":"${cell.prop}", "width":"${cell.width}", "isHide": ${cell.isHide}}`;
    });

    prePlanservice[table.dropCellUrl]({
      tableName: table.id,
      param: `[${cellString.substr(1)}]`
    }).then(() => {
      setColumnByHide(newColumn);
    }).catch(() => {});
  };

  // 列显隐变化处理
  const _onIsCellHide = (column) => {
    _excuteTable(column, 1);
  };

  // 表格列拖拽结束处理
  const _tableCellDragend = (newWidth, oldWidth, column) => {
    _excuteTable({ prop: column.dataIndex, width: newWidth }, 2);
  };

  // 表格编号计算
  const _tableIndex = (current, index) => {
    return ((current - 1) * table.limit) + index + 1;
  };

  // 初始化表格数据
  const _initTable = (type, callback) => {
    let params = {};
    if (table.page) {
      params = {
        page: table.page,
        limit: table.limit,
        sortName: table.sort.sortName,
        sortType: table.sort.sortType,
        ...table.search
      };
    } else {
      params = {
        sortName: table.sort.sortName,
        sortType: table.sort.sortType,
        ...table.search
      };
    }

    for (const key in params) {
      if (typeof params[key] === 'object') {
        if (params[key] === null) {
          params[key] = '';
        } else {
          params[key] = `${params[key][0]},${params[key][1]}`;
        }
      }
    }

    if (!table.statusScroll) {
      setIsLoading(true);
    }

    prePlanservice[table.url](params).then((response) => {
      if (response.success) {
        if (response.count >= 0 && response.data.length === 0 && table.page > 1) {
          table.page = 1;
          _initTable();
        } else {
          setTotal(response.count);
          setDataSource(response.data);
        }
        if (callback) {
          callback();
        }
      } else {
        console.error(response.msg);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  // 分页大小变化处理
  const _tableSizeChange = (limit) => {
    table.page = 1;
    table.limit = limit;
    _initTable();
  };

  // 分页页码变化处理
  const _tableCurrentChange = (page) => {
    table.page = page;
    _initTable();
  };

  // 表格选择行变化处理
  const _tableChangeRows = (selectedRowKeys, selectedRows) => {
    table.select = selectedRows;
  };

  useEffect(() => {
    if (table.headerOption && table.headerOption.length > 0) {
      setHeaderOptionByShow(table.headerOption.filter((item) => item.isShow === true));
    }
    if (table.column && table.column.length > 0) {
      setColumnByHide(table.column.filter((item) => item.isHide === true));
    }
    if (!table.handInit) {
      _initCellIsHide();
      _initTable();
    }
  }, []);

  // 定义表格列
  const columns = [];
  if (table.selectMore) {
    columns.push({
      title: '选择',
      key: 'selection',
      width: 45,
      align: 'center',
      render: (_, record) => (
        <Checkbox
          onChange={() => {
            const selectedRows = tableRef.current?.getSelectedRowKeys();
            if (selectedRows.includes(record.id)) {
              tableRef.current?.deselectRow(record.id);
            } else {
              tableRef.current?.selectRow(record.id);
            }
          }}
        />
      ),
    });
  }
  if (table.isIndexShow) {
    columns.push({
      title: '编号',
      key: 'index',
      fixed: 'left',
      align: 'center',
      width: table.numberWidth || 50,
      render: (_, __, index) => _tableIndex(table.page, index),
    });
  }
  columnByHide.forEach((column) => {
    columns.push({
      title: column.label,
      dataIndex: column.prop,
      key: column.prop,
      align: column.alignLeft ? 'left' : 'center',
      headerAlign: 'center',
      ellipsis: true,
      minWidth: column.minWidth,
      render: (text, record) => {
        if (column.formatter && column.click) {
          return (
            <div
              className="td-cell"
              onClick={(e) => {
                e.stopPropagation();
                _onTableFmtClick({ event: column.click, row: record });
              }}
              dangerouslySetInnerHTML={{
                __html: column.formatter[record[column.prop]]
                 ? column.formatter[record[column.prop]].replace('${value}', record[column.prop])
                  : record[column.prop],
              }}
            />
          );
        } else if (column.formatter && column.otherProp) {
          return (
            <div
              className="td-cell"
              dangerouslySetInnerHTML={{
                __html: column.formatter[record[column.otherProp]]
                 ? column.formatter[record[column.otherProp]].replace('${value}', record[column.prop])
                  : record[column.prop],
              }}
            />
          );
        } else if (column.replaceProp) {
          return (
            <div
              className="td-cell"
              dangerouslySetInnerHTML={{
                __html: record[column.prop] === ''
                 ? record[column.replaceProp].replace('${value}', record[column.prop])
                  : record[column.prop],
              }}
            />
          );
        } else if (column.formatter) {
          return (
            <div
              className="td-cell"
              dangerouslySetInnerHTML={{
                __html: column.formatter[record[column.prop]]
                 ? column.formatter[record[column.prop]].replace('${value}', record[column.prop])
                  : record[column.prop],
              }}
            />
          );
        }
        return <div className="td-cell">{text}</div>;
      },
    });
  });
  if (table.showTableOption) {
    columns.push({
      title: '操作',
      key: 'option',
      align: 'center',
      headerAlign: 'center',
      minWidth: table.operationWidth || 'auto',
      render: (_, record) => (
        <>
          {newCellOption(record).map((option, key) => (
            <span key={option.name + key} title={option.name}>
              {option.type && (
                <div
                  className={`ha-icon-${option.icon}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    _hatechTableOptionBtn({
                      key,
                      type: option.type,
                      index: dataSource.indexOf(record),
                      row: record,
                      option,
                    });
                  }}
                />
              )}
              {!option.type && option.titleDesc && (
                <div
                  className={`ha-icon-${option.icon}`}
                  // 这里假设 v-tip 是自定义指令，暂时不实现
                />
              )}
              {!option.type && option.textOperation && (
                <span style={{ color: '#409EFF' }}>{option.name}</span>
              )}
            </span>
          ))}
        </>
      ),
    });
  }

  return (
    <div className="hatech-plugin-table">
      {/* 按条件查询模块 */}
      {React.cloneElement(hatechTable, { name: 'hatech-search' })}
      <div className="hatech-table">
        {/* 表格头部布局 */}
        <div className="hatech-table-header">
          <div className="hatech-table-header-left">
            <ul>
              <li>{table.title}</li>
            </ul>
          </div>
          {table.totalContent && (
            <div className="hatech-table-header-content">
              <ul>
                <li>{table.totalContent}</li>
                <li>{table.signCount}</li>
                <li>{table.noSign}</li>
              </ul>
            </div>
          )}
          {table.showHeaderOption && (
            <div className="hatech-table-header-right">
              <ul>
                {headerOptionByShow.map((option, key) => (
                  <li
                    key={key}
                    title={option.name}
                    onClick={() => _hatechTableOptionBtn({ key, type: option.type, option })}
                  >
                    <div className={`ha-icon-${option.icon}`} />
                  </li>
                ))}
                {!table.columnShow && (
                  <li title="显隐列">
                    <Popover
                      placement="bottom"
                      content={
                        <div>
                          {table.column.map((column, key) => (
                            <Checkbox
                              key={key}
                              checked={column.isHide}
                              name={column.prop}
                              onChange={() => _onIsCellHide(column)}
                            >
                              {column.label}
                            </Checkbox>
                          ))}
                        </div>
                      }
                    >
                      <MenuOutlined />
                    </Popover>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        {/* 表格主体布局 */}
        <Spin spinning={isLoading || table.loading} tip="加载中，请稍后...">
          <Table
            ref={tableRef}
            rowKey={table.rowKey || 'id'}
            maxHeight={table.maxHeight}
            dataSource={dataSource}
            columns={columns}
            onRow={(record) => ({
              onClick: () => _rowClick(record),
            })}
            onHeaderCell={(column) => ({
              onDragEnd: (e) => {
                const newWidth = e.target.offsetWidth;
                const oldWidth = column.width;
                _tableCellDragend(newWidth, oldWidth, column);
              },
            })}
            onSelectChange={_tableChangeRows}
            style={{ width: table.tableWidth }}
            className={table.rowClassName || ''}
            pagination={false}
          />
        </Spin>
        {/* 表格底部布局，表格分页设置 */}
        {!table.noPage && (
          <div className="hatech-table-footer">
            <Pagination
              background
              layout={['total', 'sizes', 'prev', 'pager', 'next', 'jumper']}
              current={table.page}
              pageSizeOptions={table.pageSize}
              pageSize={table.limit}
              total={total}
              onChange={_tableCurrentChange}
              onShowSizeChange={_tableSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HatechTable;
