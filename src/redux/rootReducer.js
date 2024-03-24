// ** Reducers Imports
import navbar from './navbar';
import layout from './layout';
import common from './common';
import user from './user';
import cmsContent from './cmsContent';
import email from './email';
import pipeline from './pipeline';
import baseQueryApi from './api/baseQueryApi';

const rootReducer = {
  navbar,
  layout,
  common,
  user,
  email,
  cmsContent,
  pipeline,
  [baseQueryApi.reducerPath]: baseQueryApi.reducer,
};

export default rootReducer;
