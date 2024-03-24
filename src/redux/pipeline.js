import { createSlice } from '@reduxjs/toolkit';

export const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState: {
    moduleData: [],
  },

  reducers: {
    setModuleData: (state, action) => {
      state.moduleData = [...action.payload];
    },
  },
});

export const { setModuleData, setLatestChangeLog, setSocket, setSidebarCount } =
  pipelineSlice.actions;

export const getModuleData = (state) => state.pipeline.moduleData;

export default pipelineSlice.reducer;
