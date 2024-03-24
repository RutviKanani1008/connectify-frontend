// ==================== Packages =======================
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
// ====================================================
import { getCurrentUser } from '../../../../../helper/user.helper';
import {
  useCreateProduct,
  useGetProduct,
  useGetProducts,
  useUpdateProduct,
} from '../hooks/productApis';
import AddProductForm from './AddProductForm';
import { required } from '../../../../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SaveButton } from '@components/save-button';
import AddProductCategoryModal from './AddProductCategoryModal';
import { useGetCategories } from '../hooks/productCategoryApis';
import { useRemoveAttachment } from '../../../../../api/auth';

const productSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
  description: yup.string().required(required('Description')),
});

const AddOrEditProductModal = ({
  modal,
  setModal,
  getRecords,
  productType = 'one-time',
}) => {
  const user = getCurrentUser();

  // ========================== states ================================
  const [initialValue, setInitialValue] = useState({});
  const [imageUploading, setImageUploading] = useState(false);
  const [productCategoryModal, setProductCategoryModal] = useState({
    categoryName: '',
    toggle: false,
  });
  const { removeAttachment } = useRemoveAttachment();
  const [removeAttachments, setRemoveAttachments] = useState([]);

  // ========================== Hooks =================================
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(productSchema),
    defaultValues: initialValue,
  });

  // ========================== Custom Hooks ==========================
  const { getProduct, isLoading: getProductLoading } = useGetProduct();
  const { createProduct, isLoading: createProductLoading } = useCreateProduct();
  const { updateProduct, isLoading: updateProductLoading } = useUpdateProduct();
  const { getProducts } = useGetProducts();
  const {
    getCategories,
    productCategories,
    isLoading: pCategoryLoading,
  } = useGetCategories();

  useEffect(() => {
    getCategories({ select: 'name' });
  }, []);

  useEffect(async () => {
    if (modal.id) {
      getProductDetails();
    }
  }, [modal.id]);

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  const getProductDetails = async () => {
    const { data, error } = await getProduct(modal.id);
    if (!error) {
      const productDetail = data;
      if (productDetail.category) {
        productDetail.category = {
          label: productDetail?.category.name,
          value: productDetail?.category._id,
        };
      }
      setInitialValue(productDetail);
    }
  };

  const onSubmit = async (data) => {
    if (initialValue?.name && initialValue.name !== data.name) {
      const isExists = await getProducts({
        productId: data?.name?.replace(/ /g, '-').toLowerCase(),
      });
      if (isExists && isExists.data.length) {
        setError(
          `name`,
          { type: 'focus', message: `Product name is already exist.` },
          { shouldFocus: true }
        );
        return;
      }
    }
    const rawData = JSON.parse(JSON.stringify(data));
    rawData.company = user.company._id;
    rawData.type = productType;
    if (rawData?.category?.value) {
      rawData.category = rawData.category.value;
    } else {
      delete rawData.category;
    }
    if (modal.id) {
      const { error } = await updateProduct(
        modal.id,
        rawData,
        'Update Product...'
      );
      if (!error) {
        setModal({ toggle: false, id: '' });
        getRecords();
      }
    } else {
      const { error } = await createProduct(rawData, 'Save Product...');
      if (!error) {
        if (!error) {
          setModal({ toggle: false, id: '' });
          getRecords();
        }
      }
    }
  };

  const handleCloseModal = async () => {
    setModal({ toggle: false, id: '' });
    const currentImage = getValues('image');
    if (removeAttachments.length || (currentImage && modal.id !== null)) {
      const attachments = [
        ...removeAttachments,
        ...(currentImage && modal.id !== null ? [currentImage] : []),
      ];
      await removeAttachment({ attachmentUrl: attachments });
      setRemoveAttachments([]);
    }
  };

  return (
    <>
      <Modal
        isOpen={modal.toggle}
        toggle={() => {
          handleCloseModal();
        }}
        className='modal-dialog-centered preview-dialog add-product-modal'
        backdrop='static'
      >
        <ModalHeader toggle={() => handleCloseModal()}>Add Product</ModalHeader>

        <ModalBody>
          {getProductLoading ? (
            <div className='d-flex align-items-center justify-content-center loader'>
              <Spinner />
            </div>
          ) : (
            <Form
              key={modal.toggle}
              className='auth-login-form'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              <AddProductForm
                productCategories={productCategories}
                pCategoryLoading={pCategoryLoading}
                productCategoryModal={productCategoryModal}
                setProductCategoryModal={setProductCategoryModal}
                key={modal.toggle}
                control={control}
                errors={errors}
                setValue={setValue}
                clearErrors={clearErrors}
                modal={modal}
                imageUploading={imageUploading}
                setImageUploading={setImageUploading}
                removeAttachments={removeAttachments}
                setRemoveAttachments={setRemoveAttachments}
              />
            </Form>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color='danger' onClick={() => handleCloseModal()}>
            Close
          </Button>
          <Form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <SaveButton
              disabled={imageUploading}
              width='171px'
              type='submit'
              name={modal.id ? 'Update Product' : 'Create Product'}
              loading={createProductLoading || updateProductLoading}
            ></SaveButton>
          </Form>
        </ModalFooter>
      </Modal>
      {/* add product category modal */}
      {productCategoryModal.toggle ? (
        <AddProductCategoryModal
          getValues={getValues}
          reset={reset}
          getCategories={getCategories}
          setProductCategoryModal={setProductCategoryModal}
          productCategoryModal={productCategoryModal}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default AddOrEditProductModal;
