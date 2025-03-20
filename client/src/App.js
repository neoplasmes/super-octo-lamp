import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CasesPage } from './Pages/CasesPage/CasesPage';
import { TablesPage } from './Pages/TablesPage/TablesPage';
import { NavBar } from './Components/NavBar/NavBar';

const queryClient = new QueryClient();

export const App = () => {
    
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="main">
                    <NavBar />
                    <Routes>
                        <Route path='/cases/*' element={<CasesPage />}/>
                        <Route path='/tables/*' element={<TablesPage />}/>
                    </Routes>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}