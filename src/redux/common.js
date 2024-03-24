import { createSelector, createSlice } from '@reduxjs/toolkit';

export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    processing: false, // will be used only when submitting forms,
    latestChangeLog: null,
    socket: null,
    sidebarCount: {
      supportTicket: 0,
      featureRequest: 0,
    },
    taskManagerMenuCollapsed: true,
  },

  reducers: {
    setProcessing: (state, action) => {
      state.processing = action.payload;
    },
    setLatestChangeLog: (state, action) => {
      state.latestChangeLog = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setSidebarCount: (state, action) => {
      state.sidebarCount = { ...state.sidebarCount, ...action.payload };
    },
    handleTaskManagerMenuCollapsed: (state, action) => {
      state.taskManagerMenuCollapsed = action.payload;
    },
  },
});

export const {
  setProcessing,
  setLatestChangeLog,
  setSocket,
  setSidebarCount,
  handleTaskManagerMenuCollapsed,
} = commonSlice.actions;

export const selectLatestChangeLog = (state) => state.common.latestChangeLog;

export const selectLatestChangeLogVersion = createSelector(
  selectLatestChangeLog,
  (changeLog) => (changeLog ? changeLog.version : null)
);

export const selectSocket = (state) => state.common.socket;

export const selectSidebarCount = (state) => state.common.sidebarCount;
export const getTaskManagerMenuCollapsed = (state) =>
  state.common.taskManagerMenuCollapsed;

export default commonSlice.reducer;
