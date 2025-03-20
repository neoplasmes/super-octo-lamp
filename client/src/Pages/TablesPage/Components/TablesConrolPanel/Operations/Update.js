import { useState, useRef } from "react";
import { useTablePageContext } from "../../../TablesPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedTable } from "../useSelectedTable";
import JsonEditor from "./JsonEditor/JsonEditor";


/**
 * @param {Object} arg
 * @param {string} arg.name
 * @param {string} arg.query
 * @param {string} arg.instructions
 * @returns 
 */
const updateRequest = async (arg) => {
    const response = await fetch(`http://localhost:3500/tables/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg)
    });

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return response;
}

const updateInstructionsPlaceholder = `Следуйте структуре {<key>:<newValue>}`

export const UpdateOperation = () => {
    const selectedTable = useSelectedTable();
    const queryClient = useQueryClient();
    const { setDisplayQuery } = useTablePageContext();
    const [ query, setQuery ] = useState('');

    const mutation = useMutation({
        mutationKey: ['update'],
        mutationFn: updateRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['displayedData']});
            setDisplayQuery('*');
            //forceRefetchDisplayedData();
        }
    });

    const jsonString = useRef('');

    const handleChangeQuery = (e) => {
        setQuery(e.target.value);
    }

    const handleSyncJsonValue = (str) => {
        jsonString.current = str;
    }

    const handleUpdate = () => {
        if (query === '' || !selectedTable || jsonString.current === '') {
            return;
        }

        mutation.mutate({
            name: selectedTable,
            query: query,
            instructions: JSON.parse(jsonString.current),
        });
    }

    return (
        <div className="operation-panel">
            <input 
                value={query}
                onChange={handleChangeQuery}
                type="text" 
                placeholder="query..." 
            />
            <JsonEditor placeholder={updateInstructionsPlaceholder} onChange={handleSyncJsonValue}/>
            <button onClick={handleUpdate}>Обновить</button>
        </div>
    );
};