import { useLocation } from "react-router-dom";

export const useSelectedTable = () => {
    const { pathname } = useLocation();
    const match = pathname.match(/tables\/([^\/]+)/)
    const selectedTable = match ? match[1] : undefined;

    return selectedTable;
}