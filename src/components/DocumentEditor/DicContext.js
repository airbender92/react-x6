import React, { useContext } from 'react';
import useCommon from './hooks/useCommon'

const DicContext = createContext();

export const DicProvider = ({children}) => {
    const { allDept} = useCommon();

    return (
        <DicContext.Provider value={{allDept}}>
            {children}
        </DicContext.Provider>
    )
}

export const useDicContext = () => {
    return useContext(DicContext);
}