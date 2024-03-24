import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AddInventoryProductCategoryModal from '../components/AddInventoryProductCategoryModal';
import { required } from './../../../../configs/validationConstant';
import { useInventoryProductCategoryColumn } from '../hooks/useInventoryProductCategoryColumn';
import {
  useDeleteCategory,
  useGetCategories,
} from '../hooks/InventoryProductCategoryApi';
import ItemTable from '../../../../@core/components/data-table';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import UILoader from './../../../../@core/components/ui-loader/index';
import { useGetWooConnection } from '../hooks/InventoryWooConnectionApi';
import { Spinner } from 'reactstrap';

const productCategorySchema = yup.object().shape({
  name: yup.string().required(required('Category name')),
});

const InventoryProductCategory = ({ setTabValue }) => {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(productCategorySchema),
  });

  const [addModal, setAddModal] = useState({
    toggle: false,
    id: '',
    categoryName: '',
  });
  const [wooStatus, setWooStatus] = useState(false);

  const [currentCategoryDetail, setCurrentCategoryDetail] = useState({});
  const { inventoryProductCategoryColumns } = useInventoryProductCategoryColumn(
    {
      setCurrentCategoryDetail,
      reset,
      setAddModal,
    }
  );

  const {
    getCategories,
    isLoading: getProductCategoryLoading,
    productCategories,
  } = useGetCategories();
  const { deleteCategory } = useDeleteCategory();
  const { getWooConnection, isLoading: getWooDataLoading } =
    useGetWooConnection();

  useEffect(() => {
    getWooData();
    getRecords();
  }, []);

  const getWooData = async () => {
    const { data } = await getWooConnection();
    if (!data) {
      setWooStatus(true);
    }
  };
  const getRecords = async () => {
    await getCategories();
  };

  const handelAddNewItem = () => {
    setAddModal({ id: '', toggle: true });
    reset({ name: '' });
    setCurrentCategoryDetail({});
  };

  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this category?',
    });

    if (result.value) {
      const { error } = await deleteCategory(id, 'Delete category..');
      if (!error) {
        getRecords();
      }
    }
  };

  return (
    <>
      {getWooDataLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <>
          {wooStatus ? (
            <div className='w-100 text-center p-4'>
              <h2 className='mb-1'>
                Please connect your WooCommerce store first
              </h2>
              <p>
                To connect your WooCommerce store
                <a
                  className='text-primary'
                  onClick={() => {
                    setTabValue('wooCommerceConnection');
                  }}
                >
                  Click Here
                </a>
              </p>
            </div>
          ) : (
            <div className='inventory-product-categories-table-wrapper'>
              <UILoader blocking={getProductCategoryLoading}>
                <ItemTable
                  columns={inventoryProductCategoryColumns({
                    handleDelete,
                  })}
                  searchPlaceholder='Search Product Category'
                  data={productCategories}
                  title='Product Categories'
                  addItemLink={false}
                  onClickAdd={handelAddNewItem}
                  buttonTitle={'Add Category'}
                  itemsPerPage={5}
                  hideExport={true}
                />
              </UILoader>
            </div>
          )}
        </>
      )}
      {addModal.toggle ? (
        <AddInventoryProductCategoryModal
          getValues={getValues}
          reset={reset}
          getCategories={getCategories}
          setProductCategoryModal={setAddModal}
          productCategoryModal={addModal}
          currentCategoryDetail={currentCategoryDetail}
          setCurrentCategoryDetail={setCurrentCategoryDetail}
          formField={{
            control,
            handleSubmit,
            reset,
            setError,
            getValues,
            errors,
          }}
        />
      ) : null}
    </>
  );
};

export default InventoryProductCategory;
