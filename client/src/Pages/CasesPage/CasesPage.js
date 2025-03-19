import { useQuery } from '@tanstack/react-query';
import { CasesSideBar } from './Components/CasesSideBar/CasesSideBar';

import './CasesPage.css'
import { Route, Routes } from 'react-router-dom';
import { CasesTable } from './Components/CasesTable/CasesTable';

const getCasesInfoQuery = async () => {
    const response = await fetch('http://localhost:3500/cases/info')
    .then(res => res.json());

    return response;
}

export const CasesPage = () => {
    const { data: casesData, error: casesError, isFetching: casesAreFetching } = useQuery({
        queryKey: ['casesInfo'],
        queryFn: getCasesInfoQuery
    });

    return (
        <div className='cases-page'>
            {casesAreFetching ? <h1>загрузка</h1> :
                <>
                    <CasesSideBar cases={casesData}/>
                    <div>
                        <Routes>
                            <Route path=":number/:letter" element={<CasesTable />}/>
                        </Routes>
                    </div>
                </>
            }
        </div>
    );
}