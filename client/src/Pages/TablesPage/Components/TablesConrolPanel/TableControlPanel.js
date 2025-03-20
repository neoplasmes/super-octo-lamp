// TableControlPanel.jsx
import React, { useState } from 'react';
import './TableControlPanel.css';

const SelectOperation = () => (
  <div className="operation-panel">
    <input type="text" placeholder="Select query..." />
    <button>Execute</button>
  </div>
);

const DeleteOperation = () => (
  <div className="operation-panel">
    <input type="text" placeholder="Delete condition..." />
    <button>Delete</button>
  </div>
);

const UpdateOperation = () => (
  <div className="operation-panel">
    <input type="text" placeholder="Update field..." />
    <input type="text" placeholder="New value..." />
    <button>Update</button>
  </div>
);

/**
 * @param {{
 *      args: { name: string, placeholder: string }[],
 *      endpoint: string
 * }} props
 */
const Operation = ({ args, endpoint }) => {

}

const operations = {
  SELECT: SelectOperation,
  DELETE: DeleteOperation,
  UPDATE: UpdateOperation
};

const TableControlPanel = () => {
  const [selectedOperation, setSelectedOperation] = useState('SELECT');
  
  const OperationComponent = operations[selectedOperation];

  return (
    <div className="table-control-panel">
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