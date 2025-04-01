import React from 'react';
import { register} from '@antv/x6-react-shape'
import { Dropdown} from 'antd'

const CustomComponent = ({node}) => {
const label = node.prop('label')

return (
    <Dropdown
        menu={{
            items: [
                {
                    key: 'copy',
                    label: '复制',
                },
                {
                    key: 'paste',
                    label: '粘贴',
                },
                {
                    key: 'delete',
                    label: '删除',
                }
            ]
        }}
        trigger={['contextMenu']}
    >
        <div className="custom-react-node">{label}</div>
    </Dropdown>
)

}

register({
    shape: 'custom-react-node',
    component: CustomComponent,
    width:100,
    height:40,
})