import tinymce from "tinymce/tinymce";

tinymce.PluginManager.add('customLink', function(editor) {
    return {
        getMetadata: function() {
            return {
                name: 'customLink',
                url: 'local'
            };
        },
    }
});