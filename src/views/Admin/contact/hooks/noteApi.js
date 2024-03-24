import {
  useGetApi,
  useDeleteApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  notes: '/notes',
  bulkNotes: '/bulk-notes',
  printNotes: '/print-notes',
  noteFolder: '/change-note-folder',
};

export const useGetNotes = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getNotes = (query = {}) =>
    apiCall(`${APIS.notes}`, {
      params: query,
    });

  return { getNotes, isLoading, isSuccess, isError };
};

export const usePrintNotes = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getPrintTask = (query = {}) =>
    apiCall(`${APIS.printNotes}`, {
      params: query,
    });

  return { getPrintTask, isLoading, isSuccess, isError };
};

export const useCreateNote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createNote = (note, loadingMsg) =>
    apiCall(`${APIS.notes}`, note, loadingMsg);

  return { createNote, isLoading, isSuccess, isError };
};

export const useCreateBulkNote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createBulkNote = (note, loadingMsg) =>
    apiCall(`${APIS.bulkNotes}`, note, loadingMsg);

  return { createBulkNote, isLoading, isSuccess, isError };
};

export const useUpdateNote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateNote = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.notes}/${id}`, updateData, loadingMsg);

  return { updateNote, isLoading, isSuccess, isError };
};

export const useDeleteNote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteNote = (id, loadingMsg) =>
    apiCall(`${APIS.notes}/${id}`, loadingMsg);

  return { deleteNote, isLoading, isSuccess, isError };
};

export const useUpdateNoteFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateNoteFolder = (userData, loadingMsg) =>
    apiCall(`${APIS.noteFolder}`, userData, loadingMsg);

  return { updateNoteFolder, isLoading, isSuccess, isError };
};
