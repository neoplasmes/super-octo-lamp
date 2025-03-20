// JsonEditor.jsx
import React, { useState } from 'react';
import './JsonEditor.css';

/**
 * 
 * @param {{
 *      onChange: (string) => void,
 *      placeholder: string
 * }} props 
 * @returns 
 */
const JsonEditor = ({ 
  onChange,
  placeholder = "Вставьте или введите JSON здесь..."
}) => {
  const [jsonValue, setJsonValue] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setJsonValue(value);

    try {
        JSON.parse(value);
        setError(null); // Очищаем ошибку, если JSON валиден
        onChange(value);
    } catch (err) {
        setError(`Невалидный JSON: ${err.message}`);
        onChange('');
    }
  };


  return (
    <div className="json-editor-container">
      <textarea
        className={`json-editor-textarea ${error ? 'error' : ''}`}
        value={jsonValue}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
        rows={20}
        cols={20}
      />
      {error && <div className="json-editor-error">{error}</div>}
    </div>
  );
};

export default JsonEditor;