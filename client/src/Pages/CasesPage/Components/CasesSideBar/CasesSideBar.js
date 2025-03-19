import { useMemo } from "react";
import './CasesSideBar.css'
import { Link } from "react-router-dom";

/**
 * Сайдбар для отображения линков на задания
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Object<string, Array<string>>} props.cases - Массив объектов с одинаковыми ключами для отображения в таблице.
 * @returns {JSX.Element} Таблица с данными или сообщение об их отсутствии.
 */
export const CasesSideBar = ({ 
    cases, 
}) => {
    console.log(cases);

    const casesLinks = useMemo(() => {
        const links = [];

        for (const number in cases) {
            links.push(
                <div key={number} className="sidebar__section">
                    <h3>{`Задание ${number}`}</h3>
                    <ul>
                        {cases[number].map(letter => (
                            <li key={letter}>
                                <Link to={`/cases/${number}/${letter}`}>{`Пункт ${letter}`}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        return links;
    }, [cases])

    return (
        <div className="sidebar">
            {casesLinks}
        </div>
    );
}