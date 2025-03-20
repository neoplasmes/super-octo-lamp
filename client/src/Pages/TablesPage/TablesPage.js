import { useQuery } from "@tanstack/react-query";
import { TableSideBar } from "./Components/TablesSideBar/TableSideBar";

import './TablesPage.css'
import TableControlPanel from "./Components/TablesConrolPanel/TableControlPanel";
import { Routes, Route } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import { useSelectedTable } from "./Components/TablesConrolPanel/useSelectedTable";
import { SimpleTable } from "./Components/SimpleTable/SimpleTable";

const getTablesList = async () => {
    const response = await fetch('http://localhost:3500/tables')
        .then(res => res.json());

    return response;
}

/**
 * 
 * @param {string} name
 * @param {string} query
 * @returns 
 */
const selectRequest = async (name, query) => {
    const searchParams = new URLSearchParams({ name, query });
    const response = await fetch(`http://localhost:3500/tables/select?${searchParams}`);

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return await response.json();
}

const tablePageContext = createContext();

export const useTablePageContext = () => {
    return useContext(tablePageContext);
}

export const TablesPage = () => {
    const selectedTable = useSelectedTable();
    const [displayQuery, setDisplayQuery] = useState('*');

    const {data: tablesList, _a, isFetching: tablesListIsFetching} = useQuery({
        queryKey: ['tablesList'],
        queryFn: getTablesList
    })

    const { data: dataToDisplay } = useQuery({
        queryKey: ['displayedData', selectedTable, displayQuery],
        queryFn: () => selectRequest(selectedTable, displayQuery),
        enabled: Boolean(selectedTable)
    })

    console.log(dataToDisplay);

    if (tablesListIsFetching) {
        return <h1>Загрузка</h1>
    }

    return (
        <div className="tables-page">
            <tablePageContext.Provider value={{setDisplayQuery}}>
                <TableSideBar tablesList={tablesList}/>
                <div className="tables-page__content">
                    <Routes>
                        <Route path="/:tableName" element={
                            dataToDisplay && dataToDisplay.length > 0 ? 
                                <SimpleTable data={dataToDisplay}/> : 
                                <h6>no data</h6>
                        }/>
                    </Routes>
                </div>
                <TableControlPanel />
            </tablePageContext.Provider>
        </div>
    );
}