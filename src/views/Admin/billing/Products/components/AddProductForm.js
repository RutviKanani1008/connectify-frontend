// ==================== Packages =======================
import { Col, Label, Row, UncontrolledTooltip } from 'reactstrap';
// ====================================================
import { FormField } from '@components/form-fields';
import ImageUpload from '../../../../../@core/components/form-fields/ImageUpload';
import { getCurrentUser } from '../../../../../helper/user.helper';
import { uploadFile } from '../../../../../api/auth';
import { useWatch } from 'react-hook-form';
import noImage from '../../../../../assets/images/blank/no-image.png';
import { Eye } from 'react-feather';

const AddProductForm = ({
  productCategoryModal,
  setProductCategoryModal,
  errors,
  control,
  setValue,
  clearErrors,
  modal,
  setImageUploading,
  imageUploading,
  productCategories,
  pCategoryLoading,
  removeAttachments,
  setRemoveAttachments,
}) => {
  const user = getCurrentUser();
  const image = useWatch({ control, name: 'image' });

  const productImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `${user.company._id}/products`);
    formData.append('image', file);
    if (modal.id !== 'add') {
      formData.append('model', 'products');
      formData.append('field', 'image');
      formData.append('id', modal.id);
    }
    if (image) {
      formData.append('removeAttachments', [image]);
    }
    setImageUploading(true);
    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
      } else {
        if (res?.data?.data) {
          setValue('image', res?.data?.data);
          clearErrors('image');
        }
        setImageUploading(false);
      }
    });
  };

  const handleCategory = (values) => {
    values.__isNew__ &&
      setProductCategoryModal({ categoryName: values.value, toggle: true });
  };

  const PRODUCT_CATEGORY = productCategories.map((obj) => ({
    label: obj.name,
    value: obj._id,
  }));

  return (
    <div>
      <Row>
        <Col md='12' sm='12' lg='12'>
          <ImageUpload
            key={image}
            url={
              image && image !== 'false'
                ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${image}`
                : noImage
            }
            size={100}
            supportedFileTypes={['jpg', 'jpeg', 'svg', 'png', 'heic']}
            handleUploadImage={productImageUpload}
            handleImageReset={() => {
              setRemoveAttachments([...removeAttachments, image]);
              setValue('image', '');
            }}
            loading={imageUploading}
          />
          {errors?.image && errors?.image?.type === 'required' && (
            <span
              className='text-danger block'
              style={{ fontSize: '0.857rem' }}
            >
              {errors?.image?.message}
            </span>
          )}
        </Col>
      </Row>
      <Row className='mt-1'>
        <Col md='12' sm='12' lg='12'>
          <div className='d-flex'>
            <Label className='form-label'>Category</Label>
            <Eye
              color='#a3db59'
              size={15}
              className='cursor-pointer ms-1'
              onClick={() => {
                setProductCategoryModal({ categoryName: '', toggle: true });
              }}
              id='view-p-category'
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target='view-p-category'
            >
              View Categories
            </UncontrolledTooltip>
          </div>

          <FormField
            key={productCategoryModal.toggle ? 0 : 1}
            loading={pCategoryLoading}
            name='category'
            placeholder='Select Category'
            type='creatableselect'
            errors={errors}
            control={control}
            options={PRODUCT_CATEGORY}
            onChange={handleCategory}
          />
        </Col>
      </Row>
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
      <Row className='mt-1'>
        <Col md='12' sm='12' lg='12'>
          <FormField
            name='price'
            label='Price'
            placeholder='Enter price'
            type='number'
            onChange={(e) => {
              setValue('price', Math.abs(e.target.value));
            }}
            errors={errors}
            control={control}
          />
        </Col>
      </Row>
      <Row className='mt-1'>
        <Col md='12' sm='12' lg='12'>
          <FormField
            label='Description'
            name='description'
            placeholder='Please enter description here...'
            type='textarea'
            errors={errors}
            control={control}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AddProductForm;
