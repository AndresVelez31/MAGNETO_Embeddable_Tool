import React, { useState } from 'react';
import { Administrador } from './components/Administrador';
import PortalCandidato from './components/PortalCandidato';
import './App.css';

const App: React.FC = () => {
    const [vista, setVista] = useState<'admin' | 'candidato'>('candidato');

    return (
        <div className="app">
            {/* Toggle para cambiar entre vistas */}
            <div className="view-toggle">
                <div className="toggle-container">
                    <div className="toggle-buttons">
                        <button
                            onClick={() => setVista('candidato')}
                            className={`toggle-btn ${vista === 'candidato' ? 'active' : ''}`}
                        >
                            Portal Candidato
                        </button>
                        <button
                            onClick={() => setVista('admin')}
                            className={`toggle-btn ${vista === 'admin' ? 'active' : ''}`}
                        >
                            Administrador
                        </button>
                    </div>
                </div>
            </div>

            {vista === 'candidato' ? <PortalCandidato /> : <Administrador />}
        </div>
    );
};

export default App;