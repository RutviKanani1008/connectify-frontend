import { createSlice } from '@reduxjs/toolkit';

export const cmsContentSlice = createSlice({
  name: 'cmsContent',
  initialState: [],
  reducers: {
    storeCmsContentList: (state, action) => {
      state = action.payload;
      return state;
    },
    storeCmsPageContent: (state, action) => {
      state = state.map((obj) => {
        if (obj.page.pageId === action.payload.pageId) {
          return { ...obj, ...action.payload.data };
        }
        return obj;
      });

      return state;
    },
    storeAddCmsPageContent: (state, action) => {
      state.push(action.payload);
      return state;
    },
    storeRemoveCmsPageContent: (state, action) => {
      state = state.filter(
        (pageContent) => pageContent._id !== action.payload.cmsContentId
      );
      return state;
    },
  },
});

export const {
  storeCmsContentList,
  storeCmsPageContent,
  storeAddCmsPageContent,
  storeRemoveCmsPageContent,
} = cmsContentSlice.actions;

export const getCmsContentList = (state) => state.cmsContent;

export default cmsContentSlice.reducer;
