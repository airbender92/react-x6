import React from "react";
import EditableDraggableTable from '@/components/EditableDraggableTable'

const App = () => {
    return (
        <div>
            <EditableDraggableTable mode='edit' value={[]}/>
        </div>
    )
}

export default App;