// TableControlPanel.jsx
import './TableControlPanel.css';
import React, { useState } from 'react';
import { useSelectedTable } from './useSelectedTable';
import { InsertOperation } from './Operations/Insert';
import { SelectOperation } from './Operations/Select';
import { DeleteOperation } from './Operations/Delete';
import { UpdateOperation } from './Operations/Update';

const operations = {
  SELECT: SelectOperation,
  DELETE: DeleteOperation,
  UPDATE: UpdateOperation,
  INSERT: InsertOperation
};

const TableControlPanel = () => {
    const [selectedOperation, setSelectedOperation] = useState('SELECT');

    const selectedTable = useSelectedTable();
    
    const OperationComponent = operations[selectedOperation];

    return (
        <div className={`table-control-panel ${selectedTable ? '' : 'table-control-panel_disabled'}`}>
            <select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                className="operation-select"
            >
                {Object.keys(operations).map((operation) => (
                    <option key={operation} value={operation}>
                        {operation}
                    </option>
                ))}
            </select>
            <OperationComponent />
        </div>
    );
};

export default TableControlPanel;