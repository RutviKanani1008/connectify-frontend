// ==================== Packages =======================
import { useEffect, useState } from 'react';
// ====================================================
import UILoader from '@components/ui-loader';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import ItemTable from '../../../../../@core/components/data-table';
import {
  useDeleteCategory,
  useGetCategories,
} from '../hooks/productCategoryApis';
import { useProductCategoryColumn } from '../hooks/useCategoryColumn';
import { useForm } from 'react-hook-form';
import AddCategoryModal from '../components/AddCategoryModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../../configs/validationConstant';
import * as yup from 'yup';
import ExportData from '../../../../../components/ExportData';

const productCategorySchema = yup.object().shape({
  name: yup.string().required(required('Category name')),
});
const ProductCategories = () => {
  const [addModal, setAddModal] = useState({
    toggle: false,
    id: '',
  });

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

  const { deleteCategory } = useDeleteCategory();
  const [currentCategoryDetail, setCurrentCategoryDetail] = useState({});

  const { productCategoryColumns } = useProductCategoryColumn({
    setCurrentCategoryDetail,
    reset,
    setAddModal,
  });
  const {
    getCategories,
    isLoading: getProductCategoryLoading,
    productCategories,
  } = useGetCategories();

  useEffect(() => {
    getRecords();
  }, []);

  const getRecords = async () => {
    await getCategories();
  };

  const addNewProduct = () => {
    setAddModal({ id: '', toggle: true });
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
      <UILoader blocking={getProductCategoryLoading}>
        <ItemTable
          ExportData={<ExportData model='productCategory' />}
          columns={productCategoryColumns({
            handleDelete,
          })}
          data={productCategories}
          title='Product Categories'
          addItemLink={false}
          onClickAdd={addNewProduct}
          buttonTitle={'Add Category'}
          itemsPerPage={10}
        />
      </UILoader>

      {addModal.toggle ? (
        <AddCategoryModal
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

export default ProductCategories;
