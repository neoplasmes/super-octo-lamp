import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { CreateTableModal } from "./CreateTableModal/CreateTableModal";

import './TableSideBar.css'
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * @typedef {{
 *      name: string,
 *      schema: Object<string, string>
 * }} tableCreateBody
 */

/**
 * @param {tableCreateBody} requestBody
 */
const createTableRequest = async (requestBody) => {
    const response = await fetch("http://localhost:3500/tables/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return response;
}


/**
 * Сайдбар для отображения списка созданных таблиц
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Object<string, any>[]} props.tablesList - Массив объектов с одинаковыми ключами для отображения в таблице.
 * @returns {JSX.Element} Таблица с данными или сообщение об их отсутствии.
 */
export const TableSideBar = ({ tablesList }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: createTableRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tablesList']})
        }
    });

    /**
     * @param {tableCreateBody} requestBody
     */
    const handleCreate = (requestBody) => {
        mutation.mutate(requestBody);
    }

    const handleOpenModal = () => {
        if (mutation.isPending) {
            return;
        }
        
        setIsModalOpen(true);
    }
    

    const content = useMemo(() => {
        if (tablesList.length === 0) {
            return <p>Пока что вы не создали ни одну таблицу</p>
        }

        console.log(tablesList);

        return (
            <ul>
                {tablesList.map(({ indexName }) => 
                    <li key={indexName}>
                        <Link to={`/tables/${indexName}`}>{indexName}</Link>
                    </li>
                )}
            </ul>
        );
    }, [tablesList])

    return (
        <div className="sidebar">
            {content}
            <button className="sidebar__create" onClick={handleOpenModal}>
                {mutation.isPending ? 'Создание...' : 'Создать'}
            </button>
            {isModalOpen && (
                <CreateTableModal 
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    )
}