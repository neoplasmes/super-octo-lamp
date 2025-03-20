import { useState } from "react";
import { allowedTypes, CreateTableProperty } from "./CreateTableProperty.js";

import './CreateTableModal.css';

const sampleProperty = {
    name: '',
    type: allowedTypes.text
}
/**
 * 
 * @param {{
 *      onClose: () => void,
 *      onCreate: (tableSchema: Object<string, string>) => void
 * }} props 
 * @returns 
 */
export const CreateTableModal = ({ onClose, onCreate }) => {
    const [tableName, setName] = useState('');
    const [properties, setProperties] = useState([]);

    const handleAddNewProperty = () => {
        setProperties([...properties, {...sampleProperty}])
    }

    /**
     * @param {number} index 
     */
    const handleDeleteProperty = (index) => {
        setProperties(properties.filter((_, i) => i !== index));
    }

    const handleCreateTable = () => {
        if (properties.length === 0 || !/^[a-zA-Z]+$/.test(tableName)) {
            return;
        }

        console.log('aaaaaaaa')

        const tableSchema = {};

        for (const prop of properties) {
            if (prop.name === '') {
                return;
            }

            tableSchema[prop.name] = prop.type;
        }   

        const requestBody = {
            name: tableName,
            schema: tableSchema
        };

        onCreate(requestBody);
        onClose();
    }

    const handleChangeTableName = (e) => {
        setName(e.target.value);
    }

    /**
     * 
     * @param {number} index 
     * @param {string} key 
     * @param {string} value 
     */
    const handlePropertyChange = (index, key, value) => {
        const newProperties = [...properties];
        newProperties[index][key] = value;

        setProperties(newProperties);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal">
                <div className="modal__header">
                    <h4>Создание таблицы</h4>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <input
                    id="modal__table-name-input"
                    type="text"
                    value={tableName}
                    onChange={handleChangeTableName}
                    placeholder="Название талицы"
                />
                <div className="modal-content">
                    <div className="modal__prop-window">
                        {properties.map((property, index) => (
                            <CreateTableProperty
                                key={index}
                                property={property}
                                index={index}
                                onDelete={handleDeleteProperty} 
                                onChange={handlePropertyChange}
                            />
                        ))}
                    </div>
                    <button className="add-field" onClick={handleAddNewProperty}>+</button>
                    <button className="create-table" onClick={handleCreateTable}>Создать</button>
                </div>
            </div>
        </>
    );
};