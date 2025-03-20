import { useQuery } from "@tanstack/react-query";
import { TableSideBar } from "./Components/TablesSideBar/TableSideBar";

import './TablesPage.css'
import TableControlPanel from "./Components/TablesConrolPanel/TableControlPanel";
import { Routes, Route } from "react-router-dom";

const getTablesList = async () => {
    const response = await fetch('http://localhost:3500/tables')
        .then(res => res.json());

    return response;
}

export const TablesPage = () => {
    const {data: tablesList, _a, isFetching: tablesListIsFetching, refetch} = useQuery({
        queryKey: ['tablesList'],
        queryFn: getTablesList
    })

    console.log(tablesList);

    if (tablesListIsFetching) {
        return <h1>Загрузка</h1>
    }

    return (
        <div className="tables-page">
            <TableSideBar tablesList={tablesList}/>
            <div className="tables-page__content">
                <Routes>
                    <Route path="/:tableName" element={<></>}/>
                </Routes>
            </div>
            <TableControlPanel />
        </div>
    );
}