import OrgTree from 'react-org-tree'
import domToImage from 'dom-to-image';

const horizontal = false; // true：横向  false：纵向
const collapsable = true; // true：可折叠 false：不可折叠 
const expandAll = true; // true: 全部展开 false：全部折叠 

const data = {
    id: 0,
    label: 'XXX股份有限公司',
    children: [{
        id: 1,
        label: '技术部',
        children: [{
            id: 4,
            label: '后端工程师'
        }, {
            id: 5,
            label: '前端工程师'
        }, {
            id: 6,
            label: '运维工程师'
        }]
    }, {
        id: 2,
        label: '人事部'
    }, {
        id: 3,
        label: '销售部'
    }]
}

const OrgTreeComponent = () => {

    const handleExport = () => {
        const org = document.getElementById('org');
        domToImage.toPng(org).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'org.png';
            link.href = dataUrl;
            link.click();
        });
    }
    return (
        <>
        <button onClick={handleExport}>导出</button>
        <div id="org">
        <OrgTree 
        data={data}
        horizontal={horizontal}
        collapsable={collapsable}
        expandAll={expandAll}
        />
        </div>
        </>
    )
}

export default OrgTreeComponent;