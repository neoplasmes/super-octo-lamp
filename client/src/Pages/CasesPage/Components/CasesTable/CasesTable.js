import { useParams } from 'react-router-dom';
import { TableBuilder } from '../../../../Components/TableBuilder/TableBuilder';
import { useQuery } from '@tanstack/react-query';

const fetchCaseData = async (number, letter) => {
    const response = await fetch(`http://localhost:3500/cases/${number}/${letter}`)
    .then(res => res.json());

    return response;
}

export const CasesTable = () => {
    const { number, letter } = useParams();

    console.log(number, letter);

    const { data, error, isFetching } = useQuery({
        queryKey: [number, letter],
        queryFn: () => fetchCaseData(number, letter),
    });

    console.log(data);

    if (isFetching) {
        return <h3>загрузочка</h3>
    }

    if (error) {
        return <h3>ошибочка</h3>
    }

    return (
        <TableBuilder data={data}/>
    )
}