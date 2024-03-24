import { axiosPost } from "../../../../api/axios-config";
import { useDeleteApi, useGetApi, usePostApi, usePutApi } from "../../../../hooks/useApi";

const APIS = {
  product: '/inventory/product',
};


export const useGetProducts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProducts = (query = {}) =>
    apiCall(`${APIS.product}`, {
      params: query,
    });

  return { getProducts, isLoading, isSuccess, isError };
};

export const useGetProductsByName = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProductsByName = (query = {}) =>
    apiCall(`${APIS.product}/search`, {
      params: query,
    });

  return { getProductsByName, isLoading, isSuccess, isError };
};

export const useGetProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProduct = (id) => apiCall(`${APIS.product}/${id}`);

  return { getProduct, isLoading, isSuccess, isError };
};

export const useGetProductHistory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProductHistory = (query = {}) => apiCall(`${APIS.product}/history`, {params:query});

  return { getProductHistory, isLoading, isSuccess, isError };
};

export const useGetProductByBarcode = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProduct = (id) => apiCall(`${APIS.product}/barcode/${id}`);

  return { getProduct, isLoading, isSuccess, isError };
};

export const useGetProductByManufactureCode = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getProduct = (id) => apiCall(`${APIS.product}/manufactureBarcode/${id}`);

  return { getProduct, isLoading, isSuccess, isError };
}


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

export const useGetImportProducts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const getImportProducts = (body = {}) =>
    apiCall(`${APIS.product}/current-import-products`, body);

  return { getImportProducts, isLoading, isSuccess, isError };
};

export const useDeleteImportProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteImportProduct = (id) =>
    apiCall(`${APIS.product}/current-import-products/${id}`, 'deleting Product...');

  return { deleteImportProduct, isLoading, isSuccess, isError };
};

export const useDeleteImportProductDetails = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteImportProductDetails = (id) =>
    apiCall(`${APIS.product}/trash-import-products/${id}`);

  return { deleteImportProductDetails, isLoading, isSuccess, isError };
};

export const useFinalUploadProducts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const finalUploadProducts = (id, body = {}) =>
    apiCall(`${APIS.product}/final-import-products/${id}`, body);

  return { finalUploadProducts, isLoading, isSuccess, isError };
};


export const useUpdateImportProduct = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateImportProduct = (id, body = {}) =>
    apiCall(`${APIS.product}/current-import-products/${id}`, body);

  return { updateImportProduct, isLoading, isSuccess, isError };
};

export const validateProducts = (data, socketSessionId) => {

   return axiosPost(`${APIS.product}/import-products`, data, {}, true, {
    headers: {
      'socket-session-id': socketSessionId,
    },
  });

};

