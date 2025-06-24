import { useState, useEffect} from 'react'
import emergencyService from '@/services/emergencyService'

export const useCommon = props => {
    const [allDept, setAllDept] = useState([])

    const findAllDept = async() => {
        const {
            code,
            result,
        } = await emergencyService.findAllDept();
        if(code === '200') {
            setAllDept(result)
            return;
        }
        setAllDept([])
    }

    useEffect(() => {
        findAllDept();
    }, [])

    return {
        allDept
    }

}