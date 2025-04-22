import { useState } from 'react';
import axios from 'axios';

const useUserOrganize = (ctx) => {
    const [userOrganizeCurd, setUserOrganizeCurd] = useState({
        // 模拟表格配置
        table: {
            config: {
                columns: [
                    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
                    { title: 'User Name', dataIndex: 'userName', key: 'userName' }
                ]
            },
            data: []
        },
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const [userOrganizeEvents] = useState({
        onRowClick: (record) => {
            console.log('User organize row clicked:', record);
        }
    });
    const [userOrganizeCurdRef] = useState(null);
    const [addUserDialogVisible, setAddUserDialogVisible] = useState(false);

    const fetchUserOrganizeData = async () => {
        try {
            const response = await axios.get('/api/userOrganizeData');
            setUserOrganizeCurd((prev) => ({
                ...prev,
                table: {
                    ...prev.table,
                    data: response.data
                }
            }));
        } catch (error) {
            console.error('Error fetching user organize data:', error);
        }
    };

    // 模拟组件挂载时获取数据
    useState(() => {
        fetchUserOrganizeData();
    }, []);

    return {
        userOrganizeCurd,
        userOrganizeEvents,
        userOrganizeCurdRef,
        addUserDialog: addUserDialogVisible
    };
};

export default useUserOrganize;
