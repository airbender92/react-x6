const contentList = [
    {
        key: '1',
        level: '1',
        title: 'HTML',
        parent: '-1',
        children: [
            {
                key: '2',
                level: '2',
                title: 'HTML 简介',
                parent: '1',
                children: [],
                contents: [
                    {
                        key: '3',
                        type: 'scene',
                        data: [],
                        attrs: {},
                    },
                    {
                        key: '3',
                        type: 'scene',
                        data: [],
                        attrs: {},
                    }
                ]
            }
        ],
        contents: []
    },
    {
        key: '4',
        level: '1',
        title: 'CSS',
        parent: '-1',
        children: [
            {
                key: '5',
                level: '2',
                title: 'CSS 简介',
                parent: '4',
                children: [],
                contents: [
                    {
                        key: '6',
                        type:'scene',
                        data: [],
                        attrs: [
                                
                        ] 
                    }
                ] 
            }
        ],
        contents: []
    }
]


function flattenConentList(data) {
    let result = [];
    data.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
            result = result.concat(flattenConentList(item.children));
        }
    });
    return result;
}