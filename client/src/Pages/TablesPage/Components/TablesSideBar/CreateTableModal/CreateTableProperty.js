import React from "react";

export const allowedTypes = {
    numeric: 'NUMERIC',
    text: 'TEXT'
}
/**
 * 
 * @param {{
 *      index: number,
 *      property: { name: string, type: string },
 *      onChange: (index: number, key: string, value: string) => void,
 *      onDelete: (index: string) => void,
 * }} props 
 * @returns 
 */
export const CreateTableProperty = ({index, property, onChange, onDelete}) => {
    /**
     * @param {React.ChangeEvent<HTMLInputElement>} e 
     */
    const onNameChange = (e) => {
        onChange(index, 'name', e.target.value)
    }

    /**
     * @param {React.ChangeEvent<HTMLInputElement>} e 
     */
    const onTypeChange = (e) => {
        onChange(index, 'type', e.target.value)
    }

    const handleDeleteSelf = () => {
        onDelete(index);
    }

    return (
        <div className="field-row">
            <input
                type="text"
                value={property.name}
                onChange={onNameChange}
                placeholder="Название поля"
            />
            <select
                value={property.type}
                onChange={onTypeChange}
            >
                {Object.entries(allowedTypes).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                ))}
            </select>
            <button 
                className="remove-field"
                onClick={handleDeleteSelf}
            >
                ×
            </button>
        </div>
    );
}