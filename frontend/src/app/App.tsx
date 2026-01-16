import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';


import { Toaster } from 'react-hot-toast';
import { OfflineIndicator, AIFloatingWidget } from '@/shared';
import AppRoutes from './routes';
import './App.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error: any) { return { hasError: true }; }
    componentDidCatch(error: any, errorInfo: any) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 20, color: 'white' }}><h1>Something went wrong.</h1></div>;
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Toaster position="top-right" />
                {/* <OfflineIndicator /> */}
                <AppRoutes />
                <AIFloatingWidget />
            </Router>
        </ErrorBoundary>
    );
}

export default App;
