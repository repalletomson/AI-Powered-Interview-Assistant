'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';

const LoadingComponent = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
      <p className="text-slate-300">Loading your interview session...</p>
    </div>
  </div>
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}