import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { OfflineIndicator, AIFloatingWidget } from '@/shared';
import AppRoutes from './routes';
import './App.css';

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <OfflineIndicator />
            <AppRoutes />
            <AIFloatingWidget />
        </Router>
    );
}

export default App;

