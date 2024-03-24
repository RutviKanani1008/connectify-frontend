// ==================== Packages =======================
import { useEffect } from 'react';
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { SaveButton } from '@components/save-button';

import { FormField } from '@components/form-fields';
import {
  useCheckCategoryIsExist,
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/productCategoryApis';
import { getCurrentUser } from '../../../../../helper/user.helper';

const AddCategoryModal = ({
  setProductCategoryModal,
  productCategoryModal,
  getCategories: getCategoryOptions,
  getValues: getProductFormValues,
  reset: resetProductForm,
  currentCategoryDetail,
  formField,
}) => {
  const user = getCurrentUser();
  const { control, handleSubmit, reset, setError, getValues, errors } =
    formField;
  const { createCategory, isLoading: createCategoryLoading } =
    useCreateCategory();
  const { updateCategory, isLoading: updateCategoryLoading } =
    useUpdateCategory();
  const { checkCategoryIsExist, isLoading: checkIsExistLoading } =
    useCheckCategoryIsExist();

  useEffect(() => {
    if (currentCategoryDetail.categoryName) {
      reset({ name: currentCategoryDetail.categoryName });
    }
  }, [currentCategoryDetail]);

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
        {currentCategoryDetail?._id ? 'Update Category' : 'Add Category'}
      </ModalHeader>

      <ModalBody>
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
        </>
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() =>
            setProductCategoryModal({ toggle: false, categoryName: '' })
          }
        >
          Cancel
        </Button>
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
export default AddCategoryModal;
