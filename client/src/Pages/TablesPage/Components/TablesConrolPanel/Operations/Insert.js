import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import JsonEditor from "./JsonEditor/JsonEditor";
import { useSelectedTable } from "../useSelectedTable";
import { useTablePageContext } from "../../../TablesPage";

/**
 * 
 * @param {Object} requestBody 
 * @returns 
 */
const insertRequest = async (requestBody) => {
    const response = await fetch("http://localhost:3500/tables/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return response;
}

export const InsertOperation = () => {
    const jsonString = useRef('');
    const selectedTable = useSelectedTable();
    const queryClient = useQueryClient();
    const { setDisplayQuery } = useTablePageContext();

    const mutation = useMutation({
        mutationKey: ['insert'],
        mutationFn: insertRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['displayedData'] });
            setDisplayQuery('*');
        }
    });

    const handleSyncJsonValue = (str) => {
        jsonString.current = str;
    }

    const handleInsertDocument = () => {
        if (jsonString.current === '' || selectedTable === undefined) {
            return;
        }

        const reqBody = {
            name: selectedTable,
            data: JSON.parse(jsonString.current),
        }

        mutation.mutate(reqBody);
    }

    return (
        <div className="operation-panel">
            <JsonEditor onChange={handleSyncJsonValue}/>
            <button onClick={handleInsertDocument}>Insert</button>
        </div>
    );
};