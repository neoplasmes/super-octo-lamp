import { useState } from "react";
import { useTablePageContext } from "../../../TablesPage";


export const SelectOperation = () => {
    const { setDisplayQuery } = useTablePageContext();
    const [ value, setValue ] = useState();

    const handleChangeValue = (e) => {
        setValue(e.target.value);
    }

    const handleSelect = () => {
        setDisplayQuery(value);
    }

    return (
        <div className="operation-panel">
            <input 
                value={value}
                onChange={handleChangeValue}
                type="text" 
                placeholder="Select query..." 
            />
            <button onClick={handleSelect}>Выполнить</button>
        </div>
    );
};