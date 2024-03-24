// ==================== Packages =======================
import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap';
import * as yup from 'yup';
import _ from 'lodash';
// ====================================================
import UILoader from '@components/ui-loader';
import { SaveButton } from '@components/save-button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { required } from '../../../../../configs/validationConstant';
import { FormField } from '@components/form-fields';
import {
  useCheckCategoryIsExist,
  useCreateCategory,
  useGetCategories,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/productCategoryApis';
import { getCurrentUser } from '../../../../../helper/user.helper';
import ItemTable from '../../../../../@core/components/data-table';
import { useProductCategoryColumn } from '../hooks/useCategoryColumn';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';

const productCategorySchema = yup.object().shape({
  name: yup.string().required(required('Category name')),
});

const AddProductCategoryModal = ({
  setProductCategoryModal,
  productCategoryModal,
  getCategories: getCategoryOptions,
  getValues: getProductFormValues,
  reset: resetProductForm,
}) => {
  const user = getCurrentUser();
  // ========================== Hooks =================================
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

  // ========================== states ================================
  const [currentCategoryDetail, setCurrentCategoryDetail] = useState({});

  // ========================== Custom Hooks ==========================
  const {
    getCategories,
    isLoading: getProductCategoryLoading,
    productCategories,
    setProductCategories,
  } = useGetCategories();
  const { createCategory, isLoading: createCategoryLoading } =
    useCreateCategory();
  const { updateCategory, isLoading: updateCategoryLoading } =
    useUpdateCategory();
  const { deleteCategory, isLoading: deleteCategoryLoading } =
    useDeleteCategory();
  const { checkCategoryIsExist, isLoading: checkIsExistLoading } =
    useCheckCategoryIsExist();
  const { productCategoryColumns } = useProductCategoryColumn({
    setCurrentCategoryDetail,
    reset,
  });

  useEffect(() => {
    reset({ name: productCategoryModal.categoryName });
    setCurrentCategoryDetail({});
    getCategories();
  }, []);

  const onSubmit = async (categoryData) => {
    if (getValues('name') && getValues('name') !== currentCategoryDetail.name) {
      const { error } = await checkCategoryIsExist({
        name: categoryData?.name?.replace(/ /g, '-').toLowerCase(),
      });
      if (error === 'Category already exists.') {
        setError(
          `name`,
          { type: 'focus', message: `Product name is already exist.` },
          { shouldFocus: true }
        );
        return;
      }
    }
    const rawData = JSON.parse(JSON.stringify(categoryData));
    rawData.company = user.company._id;
    if (rawData?.category?.value) {
      rawData.name = rawData.category.value;
    } else {
      delete rawData.category;
    }
    if (currentCategoryDetail._id) {
      const { error } = await updateCategory(
        currentCategoryDetail._id,
        rawData,
        'Update category...'
      );
      if (!error) {
        setProductCategoryModal({ toggle: false, categoryName: '' });
        getCategoryOptions();
      }
    } else {
      const { error, data } = await createCategory(rawData, 'Save Category...');
      if (!error) {
        resetProductForm({
          ...getProductFormValues(),
          category: {
            label: data.name,
            value: data._id,
          },
        });
        setProductCategoryModal({ toggle: false, categoryName: '' });
        getCategoryOptions();
      }
    }
  };

  // delete start >>>
  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this product?',
    });

    if (result.value) {
      const { error } = await deleteCategory(id, 'Delete category..');
      if (!error) {
        if (_.isArray(productCategories)) {
          const tempProducts = productCategories?.filter(
            (obj) => obj?._id !== id
          );
          setProductCategories(tempProducts);
        }
      }
    }
  };
  // delete end >>>

  return (
    <Modal
      isOpen={productCategoryModal.toggle}
      toggle={() => {
        setProductCategoryModal({ toggle: false, categoryName: '' });
      }}
      className='modal-dialog-centered preview-dialog add-product-category-modal'
      backdrop='static'
    >
      <ModalHeader
        toggle={() =>
          setProductCategoryModal({ toggle: false, categoryName: '' })
        }
      >
        Add Category
      </ModalHeader>

      <ModalBody>
        {getProductCategoryLoading ? (
          <div className='d-flex align-items-center justify-content-center loader'>
            <Spinner />
          </div>
        ) : (
          <>
            <Form
              key={productCategoryModal.toggle}
              className='auth-login-form'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              <Row className='mt-1'>
                <Col md='12' sm='12' lg='12'>
                  <FormField
                    name='name'
                    label='Name'
                    placeholder='Enter name'
                    type='text'
                    errors={errors}
                    control={control}
                  />
                </Col>
              </Row>
            </Form>
            <UILoader
              blocking={getProductCategoryLoading || deleteCategoryLoading}
            >
              <div className='p__category__modal'>
                <ItemTable
                  showPagination={false}
                  showSearch={false}
                  columns={productCategoryColumns({
                    handleDelete,
                    setCurrentCategoryDetail,
                  })}
                  data={productCategories}
                  addItemLink={false}
                  hideButton={true}
                  hideExport={true}
                  itemsPerPage={5}
                />
              </div>
            </UILoader>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        {currentCategoryDetail._id ? (
          <Button
            onClick={() => {
              reset({});
              setCurrentCategoryDetail({});
            }}
          >
            Add New
          </Button>
        ) : (
          <Button
            color='danger'
            onClick={() =>
              setProductCategoryModal({ toggle: false, categoryName: '' })
            }
          >
            Cancel
          </Button>
        )}
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <SaveButton
            width='171px'
            type='submit'
            name={currentCategoryDetail._id ? 'Update' : 'Save'}
            loading={
              createCategoryLoading ||
              updateCategoryLoading ||
              checkIsExistLoading
            }
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};
export default AddProductCategoryModal;
