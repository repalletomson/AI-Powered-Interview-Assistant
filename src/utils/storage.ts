import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: unknown) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Check if we're in a browser environment
const isClient = typeof window !== 'undefined';

const storage = isClient 
  ? createWebStorage('local') 
  : createNoopStorage();

export default storage;