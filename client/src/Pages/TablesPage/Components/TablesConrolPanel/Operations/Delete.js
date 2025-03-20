import { useState } from "react";
import { useTablePageContext } from "../../../TablesPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedTable } from "../useSelectedTable";


/**
 * @param {Object} arg
 * @param {string} arg.name
 * @param {string} arg.query
 * @returns 
 */
const deleteRequest = async ({name, query}) => {
    const searchParams = new URLSearchParams({ name, query });
    const response = await fetch(`http://localhost:3500/tables/delete?${searchParams}`, {
        method: "POST"
    });

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return response;
}

export const DeleteOperation = () => {
    const selectedTable = useSelectedTable();
    const queryClient = useQueryClient();
    const { setDisplayQuery } = useTablePageContext();
    const [ value, setValue ] = useState('');

    const mutation = useMutation({
        mutationKey: ['delete'],
        mutationFn: deleteRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['displayedData']});
            setDisplayQuery('*');
            //forceRefetchDisplayedData();
        }
    });

    const handleChangeValue = (e) => {
        setValue(e.target.value);
    }

    const handleDelete = () => {
        if (value === '' || !selectedTable) {
            return;
        }

        mutation.mutate({
            name: selectedTable,
            query: value
        });
    }

    return (
        <div className="operation-panel">
            <input 
                value={value}
                onChange={handleChangeValue}
                type="text" 
                placeholder="Delete query..." 
            />
            <button onClick={handleDelete}>Удалить</button>
        </div>
    );
};