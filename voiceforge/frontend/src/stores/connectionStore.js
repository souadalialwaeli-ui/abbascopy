import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import wsService from '../services/websocket';
import { initFirebase, listenToServerUrl } from '../services/firebase';

export const useConnectionStore = create(
  persist(
    (set, get) => ({
      status: 'disconnected', // connected | connecting | disconnected | no-gpu
      serverUrl: '',
      gpuInfo: '',
      lastConnected: null,
      firebaseConfig: null,
      apiKey: '',

      setServerUrl: (url) => {
        set({ serverUrl: url });
        api.setBaseUrl(url);
      },

      setApiKey: (key) => {
        set({ apiKey: key });
        api.setApiKey(key);
      },

      setFirebaseConfig: (config) => {
        set({ firebaseConfig: config });
        initFirebase(config);
      },

      initFirebaseListener: () => {
        const { firebaseConfig, serverUrl, apiKey } = get();
        if (apiKey) api.setApiKey(apiKey);

        if (firebaseConfig?.databaseURL) {
          initFirebase(firebaseConfig);
          listenToServerUrl((url) => {
            if (url && url !== get().serverUrl) {
              get().setServerUrl(url);
              get().checkConnection();
            }
          });
        }

        if (serverUrl) {
          api.setBaseUrl(serverUrl);
          get().checkConnection();
        }
      },

      checkConnection: async () => {
        const { serverUrl } = get();
        if (!serverUrl) {
          set({ status: 'disconnected' });
          return;
        }

        set({ status: 'connecting' });

        try {
          const data = await api.getStatus();
          const hasGpu = data.gpu && data.gpu !== 'No GPU' && data.gpu !== 'N/A';
          set({
            status: hasGpu ? 'connected' : 'no-gpu',
            gpuInfo: data.gpu || 'N/A',
            lastConnected: new Date().toISOString(),
          });
          wsService.connect(serverUrl);
        } catch {
          set({ status: 'disconnected', gpuInfo: '' });
          wsService.disconnect();
        }
      },

      disconnect: () => {
        wsService.disconnect();
        set({ status: 'disconnected', gpuInfo: '' });
      },

      connectManually: async (url) => {
        get().setServerUrl(url);
        await get().checkConnection();
      },
    }),
    {
      name: 'voiceforge-connection',
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        firebaseConfig: state.firebaseConfig,
        apiKey: state.apiKey,
      }),
    }
  )
);
