import { createSlice } from '@reduxjs/toolkit';

export const taskManagerSlice = createSlice({
  name: 'taskManager',
  initialState: {
    currentTaskPagination: {
      page: 1,
      loadMore: true,
      pagination: null,
    },
  },
  reducers: {
    setCurrentTaskPagination: (state, action) => {
      state.currentTaskPagination = action.payload;
      return state;
    },
  },
});

export const { setCurrentTaskPagination } = taskManagerSlice.actions;

export const currentTaskPagination = (state) =>
  state.taskManager.currentTaskPagination;

export default taskManagerSlice.reducer;
