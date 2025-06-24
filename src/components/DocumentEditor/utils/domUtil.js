/**
 * 从 HTML 内容中提取所有表格数据
 * @param {string} html - TinyMCE 编辑器中的 HTML 内容
 * @returns {Array<Array<Array<string>>>} - 二维数组的数组，每个子数组代表一个表格
 */
function extractTablesFromHTML(html) {
  // 创建 DOM 解析器
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // 存储所有表格数据
  const allTables = [];
  
  // 获取所有表格元素
  const tables = doc.querySelectorAll('table');
  
  // 遍历每个表格
  tables.forEach(table => {
    const tableData = [];
    
    // 获取表格的行（包括表头和表体）
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // 遍历每一行
    rows.forEach(row => {
      const rowData = [];
      
      // 获取行中的单元格（包括 th 和 td）
      const cells = Array.from(row.querySelectorAll('th, td'));
      
      // 提取每个单元格的文本内容
      cells.forEach(cell => {
        // 去除多余空格并获取文本内容
        const cellText = cell.textContent.trim();
        rowData.push(cellText);
      });
      
      // 将行数据添加到表格数据中
      tableData.push(rowData);
    });
    
    // 将表格数据添加到所有表格数据中
    allTables.push(tableData);
  });
  
  return allTables;
}

// 使用示例
const tinymceContent = '<p>这是一些文本</p><table><tr><th>姓名</th><th>年龄</th></tr><tr><td>张三</td><td>25</td></tr></table>';
const tables = extractTablesFromHTML(tinymceContent);

console.log(tables);
// 输出: 
// [
//   [
//     ["姓名", "年龄"],
//     ["张三", "25"]
//   ]
// ]

/**
 * 处理合并单元格的
 * @param {*} html 
 * @returns 
 */
function extractTablesFromHTML2(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const allTables = [];
  
  doc.querySelectorAll('table').forEach(table => {
    // 获取表格的行数和列数
    const rows = Array.from(table.querySelectorAll('tr'));
    const rowCount = rows.length;
    const colCount = rows.reduce((max, row) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const rowCols = cells.reduce((sum, cell) => {
        return sum + parseInt(cell.getAttribute('colspan') || 1, 10);
      }, 0);
      return Math.max(max, rowCols);
    }, 0);
    
    // 初始化结果矩阵，使用 null 表示空位置
    const matrix = Array(rowCount).fill().map(() => Array(colCount).fill(null));
    
    // 填充矩阵数据
    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      
      Array.from(row.querySelectorAll('th, td')).forEach(cell => {
        // 找到下一个可用位置
        while (matrix[rowIndex][colIndex] !== null) {
          colIndex++;
        }
        
        const cellText = cell.textContent.trim();
        const rowSpan = parseInt(cell.getAttribute('rowspan') || 1, 10);
        const colSpan = parseInt(cell.getAttribute('colspan') || 1, 10);
        
        // 将单元格的值填充到所有合并的位置
        for (let r = 0; r < rowSpan; r++) {
          for (let c = 0; c < colSpan; c++) {
            if (rowIndex + r < rowCount && colIndex + c < colCount) {
              matrix[rowIndex + r][colIndex + c] = cellText;
            }
          }
        }
        
        colIndex += colSpan;
      });
    });
    
    // 过滤掉全空的行（如果需要）
    const filteredMatrix = matrix.filter(row => row.some(cell => cell !== null));
    allTables.push(filteredMatrix);
  });
  
  return allTables;
}