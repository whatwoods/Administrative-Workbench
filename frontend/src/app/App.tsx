import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { OfflineIndicator } from '@/shared';
import AppRoutes from './routes';
import './App.css';

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <OfflineIndicator />
            <AppRoutes />
        </Router>
    );
}

export default App;
