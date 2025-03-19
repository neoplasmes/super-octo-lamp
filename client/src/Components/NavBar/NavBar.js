import { Link } from 'react-router-dom';
import './NavBar.css';

export const NavBar = () => {
    return (
        <div className="nav-bar">
            <Link to="/cases">Cases</Link>
            <Link to="/tables">Tables</Link>
        </div>
    );
}