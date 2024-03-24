// ==================== Packages =======================
import { useDeleteApi, useGetApi, usePostApi, usePutApi } from '../../../../hooks/useApi';
// ====================================================


const APIS = {
  criteria: '/inventory/product-criteria',
};

export const useGetCriteriaAll = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCriteria = (query = {}) => apiCall(`${APIS.criteria}/all`, { params: query });
  
  return {
    getCriteria,
    isLoading,
    isSuccess,
    isError
  };
};


export const useCheckCriteriaIsExist = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const checkCriteriaIsExist = (query) =>
    apiCall(`${APIS.criteria}/is-exist`, { params: query });

  return { checkCriteriaIsExist, isLoading, isSuccess, isError };
};

export const useGetCriteria = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCriteria = (id) => apiCall(`${APIS.criteria}/${id}`);

  return { getCriteria, isLoading, isSuccess, isError };
};

export const useCreateCriteria = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createCriteria = (productData, loadingMsg) =>
    apiCall(`${APIS.criteria}`, productData, loadingMsg);

  return { createCriteria, isLoading, isSuccess, isError };
};

export const useReorderCriteria = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const reOrderCriteria = (productData, loadingMsg) =>
    apiCall(`${APIS.criteria}/reorder`, productData, loadingMsg);

  return { reOrderCriteria, isLoading, isSuccess, isError };
};

export const useUpdateCriteria = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateCriteria = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.criteria}/${id}`, updateData, loadingMsg);

  return { updateCriteria, isLoading, isSuccess, isError };
};

export const useDeleteCriteria = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteCriteria = (id, loadingMsg) =>
    apiCall(`${APIS.criteria}/${id}`, loadingMsg);

  return { deleteCriteria, isLoading, isSuccess, isError };
};
