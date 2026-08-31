import React, { createContext, useState, useEffect, useContext } from 'react';

const ConnectivityContext = createContext(null);

export const ConnectivityProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOnline = isOnline && !simulatedOffline;

  const toggleSimulatedOffline = () => {
    setSimulatedOffline((prev) => !prev);
  };

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline: effectiveOnline,
        realOnline: isOnline,
        simulatedOffline,
        toggleSimulatedOffline,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
