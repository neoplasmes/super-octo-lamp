import { TableBuilder } from "../../../../Components/TableBuilder/TableBuilder"

/**
 * 
 * @param {{
 *      data: Object<string, string>
 * }} props 
 */
export const SimpleTable = ({ data }) => {
    return (
        <TableBuilder data={data}/>
    )
}