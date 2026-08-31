import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { WifiOff, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OfflineBanner = () => {
  const { isOnline, simulatedOffline, toggleSimulatedOffline } = useConnectivity();
  const { t } = useTranslation('common');

  return (
    <div>
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-bounce" />
            <span>
              ⚠️ {t('offline')}: Operating in low-connectivity awareness mode. Essential medical records are accessible via {t('cachedData')}.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center">
              <Database className="w-3 h-3 mr-1" /> {t('cachedData')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
