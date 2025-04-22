import { useState } from 'react';
import axios from 'axios';

const useOrganizeYj = (ctx) => {
    const [organizeYjRef] = useState(null);
    const [organizeYjCurd, setOrganizeYjCurd] = useState({
        // 模拟表格配置
        table: {
            config: {
                columns: [
                    { title: 'ID', dataIndex: 'id', key: 'id' },
                    { title: 'Name', dataIndex: 'name', key: 'name' }
                ]
            },
            data: []
        },
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const [organizeYjEvents] = useState({
        onRowClick: (record) => {
            console.log('Row clicked:', record);
        }
    });
    const [orgRef] = useState(null);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [setFunCallback, setSetFunCallback] = useState(null);

    const setFun = (callback) => {
        setSetFunCallback(callback);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/organizeYjData');
            setOrganizeYjCurd((prev) => ({
                ...prev,
                table: {
                    ...prev.table,
                    data: response.data
                }
            }));
        } catch (error) {
            console.error('Error fetching organizeYj data:', error);
        }
    };

    // 模拟组件挂载时获取数据
    useState(() => {
        fetchData();
    }, []);

    return {
        organizeYjRef,
        organizeYjCurd,
        organizeYjEvents,
        orgRef,
        uploadDialog,
        setFun
    };
};

export default useOrganizeYj;
