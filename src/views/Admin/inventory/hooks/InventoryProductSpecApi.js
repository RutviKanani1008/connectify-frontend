// ==================== Packages =======================
import { useState } from 'react';
import { useDeleteApi, useGetApi, usePostApi, usePutApi } from '../../../../hooks/useApi';

// ====================================================


const APIS = {
  spec: '/inventory/product-spec',
};

export const useGetProductSpecs = () => {
  const [productSpecs, setProductSpecs] = useState([]);
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getProductSpec = async (query = {}) => {
    const { data, error } = await apiCall(`${APIS.spec}/all`, {
      params: query,
    });
    if (data && !error) {
      setProductSpecs(data);
    }
  };

  return {
    getProductSpec,
    isLoading,
    isSuccess,
    isError,
    productSpecs,
    setProductSpecs,
  };
};


export const useCreateSpec = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createProductSpec = (productSpecData, loadingMsg) =>
    apiCall(`${APIS.spec}`, productSpecData, loadingMsg);

  return { createProductSpec, isLoading, isSuccess, isError };
};
export const useProductSpecDefaultSelected = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const saveProductSpecSelected = (productSpecData, loadingMsg) =>
    apiCall(`${APIS.spec}/saveDefault`, productSpecData, loadingMsg);

  return { saveProductSpecSelected, isLoading, isSuccess, isError };
};
export const useDeleteSpec = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteSpec = (id, loadingMsg) =>
    apiCall(`${APIS.spec}/${id}`, loadingMsg);

  return { deleteSpec, isLoading, isSuccess, isError };
};

export const useUpdateProductSpec = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateProductSpec = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.spec}/${id}`, updateData, loadingMsg);

  return { updateProductSpec, isLoading, isSuccess, isError };
};

