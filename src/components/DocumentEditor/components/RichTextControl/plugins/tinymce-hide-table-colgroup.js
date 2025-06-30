import tinymce from "tinymce/tinymce";

/**
 * 因为未知的bug，会有table 在resize的时候无法改变宽度, 但是删除colgroup 就正常了
 */
tinymce.PluginManager.add('hideColgroup', function(editor){
    const removeColgroups = () => {
        const tables = editor.getBody().querySelectorAll('table');
        (tables || []).forEach(function(table){
            const colgroup = table.querySelector('colgroup');
            if(colgroup) {
                colgroup.remove();
            }
        })
    };
    // 初始化
    editor.on('Init', removeColgroups);
    // 监听内容变化
    editor.on('NodeChange', removeColgroups);
    // 监听表格插入事件
    editor.on('ExecCommand', function(e){
        if(e.command === 'mceInsertTable') {
            setTimeout(removeColgroups, 100)
        }
    });
    // 返回插件信息
    return {
        getMetadata: function(){
            return {
                name: 'hideColgroup',
                url: 'local'
            }
        }
    }
})