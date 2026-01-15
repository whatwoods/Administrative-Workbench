import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import './styles.css';

const OfflineIndicator: React.FC = () => {
    const { isOnline, pendingSyncCount } = useOfflineStatus();

    if (isOnline) {
        return null; // 在线时不显示
    }

    return (
        <div className="offline-indicator">
            <div className="offline-content">
                <WifiOff size={16} />
                <span>
                    离线模式
                    {pendingSyncCount > 0 && ` (${pendingSyncCount} 项待同步)`}
                </span>
            </div>
        </div>
    );
};

export default OfflineIndicator;
