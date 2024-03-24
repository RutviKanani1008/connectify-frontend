import {
  useGetApi,
  usePostApi,
  usePutApi,
  useDeleteApi,
} from '../../../../../hooks/useApi';

const APIS = {
  product: '/product',
};

export const useGetProducts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProducts = (query = {}) =>
    apiCall(`${APIS.product}`, {
      params: query,
    });

  return { getProducts, isLoading, isSuccess, isError };
};

export const useGetProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProduct = (id) => apiCall(`${APIS.product}/${id}`);

  return { getProduct, isLoading, isSuccess, isError };
};

export const useCreateProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createProduct = (productData, loadingMsg) =>
    apiCall(`${APIS.product}`, productData, loadingMsg);

  return { createProduct, isLoading, isSuccess, isError };
};

export const useUpdateProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateProduct = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.product}/${id}`, updateData, loadingMsg);

  return { updateProduct, isLoading, isSuccess, isError };
};

export const useDeleteProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteProduct = (id, loadingMsg) =>
    apiCall(`${APIS.product}/${id}`, loadingMsg);

  return { deleteProduct, isLoading, isSuccess, isError };
};
