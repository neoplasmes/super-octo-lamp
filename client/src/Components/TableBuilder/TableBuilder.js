import './TableBuilder.css';

/**
 * Компонент таблицы, отображающий массив объектов.
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Array<Object<string, string | number>>} props.data - Массив объектов с одинаковыми ключами для отображения в таблице.
 * @returns {JSX.Element} Таблица с данными или сообщение об их отсутствии.
 */
export const TableBuilder = ({ data }) => {
    if (data.length === 0) {
        return <p className="table__empty">Нет данных для отображения.</p>;
    }

    const headers = Object.keys(data[0]);

    return (
        <table className="table">
            <thead className="table__head">
                <tr className="table__head-row">
                    {headers.map((header, index) => (
                        <th key={index} className="table__head-cell">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="table__body">
                {data.map((row, rowIndex) => (
                    <tr className="table__body-row" key={rowIndex}>
                        {headers.map((header, cellIndex) => (
                            <td key={cellIndex} className="table__body-cell">{row[header]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};