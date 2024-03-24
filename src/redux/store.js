// ** Redux Imports
import rootReducer from './rootReducer';
import { configureStore } from '@reduxjs/toolkit';
// import logger from 'redux-logger';
import baseQueryApi from './api/baseQueryApi';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return [
      ...getDefaultMiddleware({
        serializableCheck: false,
      }),
      baseQueryApi.middleware,
      // logger,
    ];
  },
});

export { store };
