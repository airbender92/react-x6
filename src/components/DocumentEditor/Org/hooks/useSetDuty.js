import { useState } from 'react';
import axios from 'axios';

const useSetDuty = () => {
    const [setDutyRef] = useState(null);
    const [setDutyDialogVisible, setSetDutyDialogVisible] = useState(false);

    const setDuty = (params) => {
        console.log('Setting duty:', params);
    };

    const onFormEvent = (event) => {
        console.log('Form event:', event);
    };

    const showDialog = (data) => {
        setSetDutyDialogVisible(true);
    };

    return {
        setDutyRef,
        setDuty,
        onFormEvent,
        showDialog
    };
};

export default useSetDuty;
