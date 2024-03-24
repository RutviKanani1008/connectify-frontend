import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import { FormField } from '../../../../@core/components/form-fields';
import NewTaskManagerFileDropZone from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import { userData } from '../../../../redux/user';
import { useSelector } from 'react-redux';
// import { SaveButton } from '../../../../@core/components/save-button';
import { useParams, useHistory } from 'react-router-dom';
import { required } from '../../../../configs/validationConstant';
import { uploadFile } from '../../../../api/auth';
import ImageUpload from '../../../../@core/components/form-fields/ImageUpload';
import noImage from '../../../../assets/images/blank/no-image.png';
import GenerateBarcode from './GenerateBarcode';
import moment from 'moment';
import {
  useCreateProduct,
  useGetProduct,
  useUpdateProduct,
} from '../hooks/InventoryProductApi';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import Barcode from 'react-barcode';
import {
  useGetCategories,
  useGetProductWooSettings,
} from '../hooks/InventoryProductCategoryApi';
import _ from 'lodash';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { useGetCriteriaAll } from '../hooks/InventoryProductCriteriaApi';
import queryString from 'query-string';
import PrintBarcodeModal from './PrintBarcodeModal';
import { SaveButton } from '../../../../@core/components/save-button';
import { useGetWooConnection } from '../hooks/InventoryWooConnectionApi';
import { AVAILABLE_FILE_UPLOAD_SIZE } from '../../../../constant';

const productSchema = yup.object().shape({
  title: yup.string().required(required('Product Name')),
  barcode: yup
    .string()
    .when('$manufactureBarcode', (manufactureBarcode, schema) =>
      manufactureBarcode ? schema : schema.required()
    )
    .nullable(),
  quantity: yup.string().required(required('Quantity')),
  price: yup
    .string()
    .when('$inventoryRole', (inventoryRole, schema) =>
      inventoryRole === 'productDetailUser' || inventoryRole === 'adminUser'
        ? schema.required().nullable()
        : schema.nullable()
    ),
  salePrice: yup.number().when('price', {
    is: null,
    then: yup.number().nullable(),
    otherwise: yup
      .number()
      .transform((value) =>
        isNaN(value) || value === null || value === undefined ? 0 : value
      )
      .lessThan(yup.ref('price'), 'Sale price must be less than Price')
      .nullable(),
  }),
});

const AVAILABLE_PRODUCTS_LOCATION = {
  website: 'Website',
  store: 'Store',
  junk: 'Junk',
  auction: 'Auction',
};

const DISCOUNT_TYPES = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fixed', value: 'fixed' },
];

const PRODUCT_LOCATION_QUESTION_OPTION = [
  {
    label: 'Yes',
    value: 'yes',
  },
  {
    label: 'No',
    value: 'no',
  },
];

const PRODUCT_LOCATION_CONDITION_QUESTION_OPTIONS = [
  {
    label: 'New/No damage',
    value: 'new_no_damage',
  },
  {
    label: 'Used',
    value: 'used',
  },
];

const DEFAULT_PRODUCT_LOCATION = [
  {
    location: 'Website',
    isSelected: false,
    criteria: null,
  },
  {
    location: 'Store',
    isSelected: false,
    criteria: null,
  },
  {
    location: 'Junk',
    isSelected: false,
    criteria: null,
  },
  {
    location: 'Auction',
    isSelected: false,
    criteria: null,
  },
];
const AddProductDetailForm = () => {
  const user = useSelector(userData);
  const params = useParams();
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();

  const [fileUploading, setFileUploading] = useState(false);
  const [productCriteria, setProductCriteria] = useState([]);
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [initialValue, setInitialValue] = useState({
    productLocations: DEFAULT_PRODUCT_LOCATION,
    productLocationQuestion: {
      condition_of_item: null,
      does_the_product_work: null,
      is_factory_sealed: null,
      is_broken_or_use: null,
      is_item_in_new_condition: null,
    },
  });
  const [manufactureBarcode, setManufactureBarcode] = useState();
  const [inventoryRole, setInventoryRole] = useState();
  const [instructions, setInstructions] = useState();
  const [showCustomErrors, setShowCustomErrors] = useState({
    selectQuestion: false,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(productSchema),
    defaultValues: initialValue,
    context: { manufactureBarcode, inventoryRole, params },
  });

  const { getProduct, isLoading: getProductLoading } = useGetProduct();
  const { createProduct, isLoading: createProductLoading } = useCreateProduct();
  const { updateProduct, isLoading: updateProductLoading } = useUpdateProduct();
  const { getWooConnection } = useGetWooConnection();
  const { getCategories, productCategories } = useGetCategories();
  const { getProductDefaultSettings, productDefaultSettings } =
    useGetProductWooSettings();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const { getCriteria } = useGetCriteriaAll();
  const PRODUCT_CATEGORY = productCategories.map((obj) => ({
    label: obj.name,
    value: obj._id,
  }));
  const image = useWatch({ control, name: 'image' });
  const discountType = useWatch({ control, name: 'discountType' });
  const productLocationQuestion = useWatch({
    control,
    name: 'productLocationQuestion',
  });
  const productLocations = useWatch({
    control,
    name: 'productLocations',
  });

  const getProductsCriteria = async () => {
    const { data } = await getCriteria();
    setProductCriteria(data?.sort(({ order: a }, { order: b }) => a - b));
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const manufacturerBarcode = queryParams.get('manufacturerBarcode');
    if (manufacturerBarcode) {
      setManufactureBarcode(manufacturerBarcode);
      clearErrors('barcode');
    }
    setInventoryRole(user.inventoryRole);
    getRecords();
    getProductsCriteria();
    getInventoryRoleInstructions();
  }, []);

  const getRecords = async () => {
    await getProductDefaultSettings();
    await getCategories();
  };

  const getInventoryRoleInstructions = async () => {
    const { data } = await getWooConnection();
    if (data && data.instructions) {
      const instruction = data.instructions[user.inventoryRole];
      setInstructions(instruction);
    }
  };

  useEffect(async () => {
    if (params.id !== 'add') {
      getProductDetails();
    }
  }, [params.id]);

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  const getProductDetails = async () => {
    const { data, error } = await getProduct(params.id);
    if (!error) {
      const productDetail = data;
      if (productDetail.category) {
        productDetail.category = {
          label: productDetail?.category.name,
          value: productDetail?.category._id,
        };
      }
      if (productDetail.warehouse) {
        productDetail.warehouse = {
          label: productDetail?.warehouse.name,
          value: productDetail?.warehouse._id,
        };
      }
      if (productDetail.discountType && productDetail.discountType.value) {
        setValue('discountType', productDetail.discountType.value);
      }
      console.log(productDetail);
      setAttachmentFileUrl(productDetail?.galleryImages);
      setInitialValue(productDetail);
      setManufactureBarcode(productDetail.manufacturerBarcode);
      const isModalOpen = queryString.parse(window.location.search);
      if (isModalOpen?.printModal === 'true') {
        setShowPrintModal(true);
        const queryParams = new URLSearchParams(location.search);

        if (queryParams.has('printModal')) {
          queryParams.delete('printModal');
          history.replace({
            search: queryParams.toString(),
          });
        }
      }
    }
  };

  const handleWooCheckboxValue = async () => {
    if (initialValue.syncToWooCommerce && !getValues('syncToWooCommerce')) {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you want to Unchecked it`s delete Product from wooCommerce Store?',
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Yes',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
        },
        buttonsStyling: false,
      });

      if (result.isConfirmed) {
        setValue('syncToWooCommerce', false);
      } else {
        setValue('syncToWooCommerce', true);
        const obj = {
          syncToWooCommerce: true,
        };
        reset(...initialValue, ...obj);
      }
    }
  };

  const onSubmit = async (values) => {
    if (values.productLocations?.length) {
      const isProductLocationAvailable = values.productLocations.find(
        (location) => location.isSelected === true
      );
      if (!isProductLocationAvailable) {
        setShowCustomErrors({
          ...showCustomErrors,
          selectQuestion: 'Please select one or more locations',
        });
        return;
      }
    }
    if (values !== null) {
      const rawData = JSON.parse(JSON.stringify(values));
      values.salePrice = values.salePrice?.toString();
      rawData.company = user.company?._id;
      rawData.category = rawData.category?.value;
      rawData.warehouse = rawData.warehouse?.value;
      rawData.history = initialValue?.history;
      rawData.totalHistoryUpdateCount += 1;
      if (params.id !== 'add') {
        const updatedData = checkUpdatedData(values);
        if (updatedData && Object.keys(updatedData).length > 0) {
          updatedData.updatedBy = user._id;
          updatedData.updatedTime = moment().format('DD-MM-YYYY hh:mm');
          rawData.history.unshift(updatedData);
        }

        await updateProduct(params.id, rawData, 'Update Product...').then(
          (res) => {
            if (!res.error) {
              if (history?.location?.status?.from) {
                history.push(history?.location?.status?.from);
              } else {
                history.push(`${basicRoute}/product/all`);
              }
            }
          }
        );
      } else {
        rawData.manufacturerBarcode = manufactureBarcode;
        rawData.createdBy = user._id;
        await createProduct(rawData, 'Save Product...').then((res) => {
          if (!res.error) {
            if (history?.location?.status?.from) {
              history.push(history?.location?.status?.from);
            } else {
              history.push(
                `${basicRoute}/product/${res?.data?._id}?printModal=true`
              );
            }
          }
        });
      }
    }
  };

  const checkUpdatedData = (updateData) => {
    const allKeys = _.union(_.keys(updateData), _.keys(initialValue));
    const difference = _.reduce(
      allKeys,
      function (result, key) {
        if (key !== 'barcode') {
          if (!_.isEqual(updateData[key], initialValue[key])) {
            result[key] = {
              updateData: updateData[key],
              initialValue: initialValue[key],
            };
          }
        }
        return result;
      },
      {}
    );
    return difference;
  };
  const attachmentUpload = (files) => {
    const formData = new FormData();
    formData.append(
      'filePath',
      `${user?.company?._id}/inventory/product-galleryImages`
    );
    files?.forEach((file) => {
      if (!file?.url) {
        uploadDocumentFileAPI;
        formData.append('galleryImages', file);
      }
    });

    if (files.length && files.filter((file) => !file?.url)?.length) {
      setFileUploading(true);
      uploadDocumentFileAPI(formData)
        .then((res) => {
          if (res.error) {
            setFileUploading(false);
          } else {
            if (res?.data?.data) {
              const fileObj = [];
              const latestUpdate = files.filter((f) => f.lastModified);
              res?.data?.data.map((data, index) => {
                const obj = {};
                obj.fileUrl = data;
                obj.fileName = latestUpdate[index].name;
                fileObj.push(obj);
              });
              setValue('galleryImages', [...attachmentFileUrl, ...fileObj]);
              setAttachmentFileUrl([...attachmentFileUrl, ...fileObj]);
            }
          }
          setFileUploading(false);
        })
        .catch(() => {
          setFileUploading(false);
        });
    }
  };
  const removeAttachmentFile = (removeIndex) => {
    setValue(
      'galleryImages',
      removeIndex > -1
        ? attachmentFileUrl.filter((url, index) => index !== removeIndex)
        : []
    );
    setAttachmentFileUrl(
      removeIndex > -1
        ? attachmentFileUrl.filter((url, index) => index !== removeIndex)
        : []
    );
  };
  const changeUploadFileName = (fileObj) => {
    setValue(
      'galleryImages',
      attachmentFileUrl.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
    setAttachmentFileUrl(
      attachmentFileUrl.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
  };
  const productImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `${user.company._id}/inventory/product-image`);
    formData.append('image', file);
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

  const setBarcodeData = (value) => {
    setValue('sku', value);
    setValue('barcode', value);
    clearErrors('barcode');
  };

  const handleChangeDiscount = () => {
    const discountPrice = getValues('discount');
    // const discountType = getValues('discountType');
    const priceValue = getValues('price');

    if (
      discountPrice !== null &&
      priceValue !== null &&
      discountType !== null
    ) {
      if (discountType === 'percentage') {
        const salePrice = priceValue - (priceValue * discountPrice) / 100;
        setValue('salePrice', salePrice);
      } else {
        const salePrice = priceValue - discountPrice;
        setValue('salePrice', salePrice);
      }
    }
  };

  const handleResetProductLocation = (type) => {
    const currentProductLocation = JSON.parse(JSON.stringify(productLocations));
    if (currentProductLocation.length > 0) {
      currentProductLocation.map((currentLocation) => {
        if (currentLocation.location === type) {
          currentLocation.isSelected = true;
        } else {
          currentLocation.isSelected = false;
          currentLocation.criteria = null;
        }
        currentLocation.productQuestions =
          productCriteria?.map((individualCriteria) => {
            return {
              label: individualCriteria?.label,
              options: individualCriteria?.options,
              placeholder: individualCriteria?.placeholder,
              type: individualCriteria?.type,
              fieldId: individualCriteria?.nameId,
              criteria: individualCriteria?._id,
            };
          }) || [];

        currentLocation?.productQuestions?.push({
          label: 'Comments',
          options: [],
          placeholder: 'Enter Comments',
          type: {
            label: 'Textarea',
            value: 'textarea',
          },
          fieldId: 'comments',
          criteria: null,
        });
      });
    }
    setValue('productLocations', currentProductLocation);
  };

  const handleRemoveError = () => {
    setShowCustomErrors({
      ...showCustomErrors,
      selectQuestion: false,
    });
  };
  return (
    <>
      {getProductLoading && inventoryRole ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <>
          {instructions && (
            <div className='user-instruction'>
              <label className='form-label'>Actions to be taken</label>
              <div className='instructions'>{instructions}</div>
            </div>
          )}
          <Form
            className=''
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
          >
            <Card className='add-product-details-card product-details'>
              <CardHeader>
                <h3 className='title'>Product Details</h3>
              </CardHeader>
              <CardBody className=''>
                <Row className='main-all-fields-wrapper'>
                  <Col className='mb-1' md={4} xs={12}>
                    <FormField
                      name='title'
                      label='Name'
                      placeholder='Enter Product Name'
                      type='text'
                      errors={errors}
                      control={control}
                      disabled={inventoryRole === 'storageUser' && true}
                    />
                  </Col>

                  <Col className='mb-1' md={4} xs={12}>
                    <FormField
                      name='quantity'
                      label='Quantity'
                      placeholder='Enter Product Quantity'
                      type='number'
                      errors={errors}
                      control={control}
                      disabled={
                        (inventoryRole === 'storageUser' ||
                          inventoryRole === 'productDetailUser') &&
                        true
                      }
                    />
                  </Col>
                  <Col className='mb-1' md={6} xs={12}>
                    <FormField
                      name='description'
                      label='Description'
                      placeholder='Enter Product Description'
                      type='textarea'
                      errors={errors}
                      control={control}
                      disabled={inventoryRole === 'storageUser' && true}
                    />
                  </Col>
                  {(inventoryRole === 'productDetailUser' ||
                    inventoryRole === 'adminUser') && (
                    <Col className='mb-1' md={4} xs={12}>
                      <FormField
                        name='category'
                        label='Category'
                        placeholder='Enter Product Category'
                        type='select'
                        options={PRODUCT_CATEGORY}
                        errors={errors}
                        control={control}
                      />
                    </Col>
                  )}
                </Row>
                {(inventoryRole === 'inputUser' ||
                  inventoryRole === 'productDetailUser' ||
                  inventoryRole === 'adminUser') && (
                  <Row className='mt-1 dimentions-weight-row'>
                    <Col className='dimentions-col' md={6} xs={12}>
                      <label className='form-label form-label'>
                        Dimentions{' '}
                      </label>
                      <Row>
                        <Col className='mb-1' md={4} xs={12}>
                          <InputGroup className='input-group-merge product-dimention-input-group'>
                            <FormField
                              name='length'
                              label=''
                              placeholder='Length'
                              type='number'
                              errors={errors}
                              control={control}
                            />
                            <InputGroupText>
                              {productDefaultSettings.dimensionUnit}
                            </InputGroupText>
                          </InputGroup>
                        </Col>
                        <Col className='mb-1' md={4} xs={12}>
                          <InputGroup className='input-group-merge product-dimention-input-group'>
                            <FormField
                              name='width'
                              label=''
                              placeholder='Width'
                              type='number'
                              errors={errors}
                              control={control}
                            />
                            <InputGroupText>
                              {productDefaultSettings.dimensionUnit}
                            </InputGroupText>
                          </InputGroup>
                        </Col>
                        <Col className='mb-1' md={4} xs={12}>
                          <InputGroup className='input-group-merge product-dimention-input-group'>
                            <FormField
                              name='height'
                              label=''
                              placeholder='Height'
                              type='number'
                              errors={errors}
                              control={control}
                            />
                            <InputGroupText>
                              {productDefaultSettings.dimensionUnit}
                            </InputGroupText>
                          </InputGroup>
                        </Col>
                      </Row>
                    </Col>
                    <Col className='weight-col' md={6} xs={12}>
                      <label className='form-label form-label'>Weight </label>
                      <InputGroup className='input-group-merge product-dimention-input-group'>
                        <FormField
                          name='weight'
                          label=''
                          placeholder='Enter Product Weight'
                          type='number'
                          errors={errors}
                          control={control}
                        />
                        <InputGroupText>
                          {productDefaultSettings.weightUnit}
                        </InputGroupText>
                      </InputGroup>
                    </Col>
                  </Row>
                )}
                {(inventoryRole === 'productDetailUser' ||
                  inventoryRole === 'adminUser') && (
                  <>
                    <Row>
                      <Col className='mb-1' md={4} xs={12}>
                        <FormField
                          name='price'
                          label='Price ($)'
                          placeholder='Enter Product Price'
                          type='number'
                          errors={errors}
                          control={control}
                          onChange={handleChangeDiscount}
                        />
                      </Col>
                      <Col className='discount-type-col' md={8} xs={12}>
                        <Row className='discount-type'>
                          <Col
                            className='toggle-btns-wrapper mb-1'
                            md={2}
                            xs={12}
                          >
                            <FormField
                              name='discountType'
                              label='Discount Type'
                              placeholder='Select Type'
                              type='radio'
                              options={DISCOUNT_TYPES}
                              errors={errors}
                              control={control}
                              key={getValues('discountType')}
                              defaultValue={
                                getValues('discountType')
                                  ? getValues('discountType')
                                  : ''
                              }
                              onChange={() => {
                                setValue('discount', 0);
                                clearErrors('discount');
                              }}
                            />
                          </Col>
                          {discountType && (
                            <Col
                              className='discount-type-field mb-1'
                              md={4}
                              xs={12}
                            >
                              <FormField
                                name='discount'
                                label='Discount'
                                placeholder='Enter Discount'
                                type='number'
                                onChange={(e) => {
                                  if (
                                    discountType === 'percentage' &&
                                    e.target.value > 100
                                  ) {
                                    setValue('discount', 100);
                                    setError(
                                      'discount',
                                      {
                                        message: `Percentage must be less than 100`,
                                      },
                                      { shouldFocus: true }
                                    );
                                  }
                                  if (
                                    Number(getValues('price')) &&
                                    discountType === 'fixed' &&
                                    e.target.value > Number(getValues('price'))
                                  ) {
                                    setValue(
                                      'discount',
                                      Number(getValues('price'))
                                    );
                                    setError(
                                      'discount',
                                      {
                                        message: `Discount must be less than price`,
                                      },
                                      { shouldFocus: true }
                                    );
                                  }
                                  handleChangeDiscount();
                                }}
                                errors={errors}
                                control={control}
                              />
                              <span className='sign'>
                                {discountType === 'percentage' ? '(%)' : '($)'}
                              </span>
                            </Col>
                          )}
                        </Row>
                      </Col>
                    </Row>
                    <Col className='mb-1' md={4} xs={12}>
                      <FormField
                        name='salePrice'
                        label='Sale Price ($)'
                        placeholder='Enter Product Sale Price'
                        type='number'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Row className='description-img-wrapper'>
                      <Col className='ca-col attachments-col' xs={6}>
                        <label className='form-label form-label'>
                          Featured Image
                        </label>
                        <ImageUpload
                          url={
                            image && image !== 'false'
                              ? image.startsWith('http')
                                ? image
                                : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${image}`
                              : noImage
                          }
                          size={1000}
                          handleUploadImage={productImageUpload}
                          handleImageReset={() => setValue('image', '')}
                          loading={imageUploading}
                          uploadTitle='Upload Featured Product Image'
                          uploadSubtitle='The Product Image must be uploaded in JPG, GIF or PNG.'
                          setError={true}
                        />
                        {errors?.image &&
                          errors?.image?.type === 'required' && (
                            <span
                              className='text-danger block'
                              style={{ fontSize: '0.857rem' }}
                            >
                              {errors?.image?.message}
                            </span>
                          )}
                      </Col>
                    </Row>
                    <div className='inventory-add-attachment-wrapper'>
                      <NewTaskManagerFileDropZone
                        multiple={true}
                        filesUpload={attachmentUpload}
                        removeFile={removeAttachmentFile}
                        fileURLArray={attachmentFileUrl}
                        accept='.jpg, .jpeg, .png, .svg'
                        // accept='.jpg,.jpeg,image/png,application/pdf,.doc,.docx,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,.HEIC'
                        fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                        fieldName='galleryImages'
                        loading={fileUploading}
                        changeUploadFileName={changeUploadFileName}
                        fileRowSize={2}
                        labelName='Add Gallery Images'
                      />
                      {errors?.galleryImages &&
                        errors?.galleryImages?.type === 'fileSize' && (
                          <span
                            className='text-danger block'
                            style={{ fontSize: '0.857rem' }}
                          >
                            {`File upload max upto ${5} mb`}
                          </span>
                        )}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
            {inventoryRole !== 'productDetailUser' && (
              <Card className='add-product-details-card product-location'>
                <CardHeader>
                  <h3 className='title'>Product Location</h3>
                </CardHeader>
                <CardBody className=''>
                  <div className='quetion-rr-row'>
                    <div className='quetion-rr-col'>
                      <Row className='mb-1'>
                        <Label>Is the box/item factory sealed ?</Label>
                        <FormField
                          type='radio'
                          control={control}
                          errors={errors}
                          key={getValues(
                            'productLocationQuestion.is_factory_sealed'
                          )}
                          defaultValue={getValues(
                            'productLocationQuestion.is_factory_sealed'
                          )}
                          name='productLocationQuestion.is_factory_sealed'
                          options={PRODUCT_LOCATION_QUESTION_OPTION}
                          onChange={(e) => {
                            if (e.target.value === 'no') {
                              setValue(
                                'productLocationQuestion.is_item_in_new_condition',
                                null
                              );
                              setValue(
                                'productLocationQuestion.is_broken_or_use',
                                null
                              );
                            }
                            if (e.target.value === 'yes') {
                              setValue(
                                'productLocationQuestion.condition_of_item',
                                null
                              );
                              setValue(
                                'productLocationQuestion.does_the_product_work',
                                null
                              );
                            }
                            handleRemoveError();
                          }}
                          disabled={inventoryRole === 'storageUser' && true}
                        />
                      </Row>
                    </div>
                    {productLocationQuestion?.is_factory_sealed === 'yes' && (
                      <div className='quetion-rr-col'>
                        <Row className='mb-1'>
                          <Label>Is the item in new condition?</Label>
                          <FormField
                            type='radio'
                            control={control}
                            errors={errors}
                            key={getValues(
                              'productLocationQuestion.is_item_in_new_condition'
                            )}
                            defaultValue={getValues(
                              'productLocationQuestion.is_item_in_new_condition'
                            )}
                            disabled={inventoryRole === 'storageUser' && true}
                            name='productLocationQuestion.is_item_in_new_condition'
                            options={PRODUCT_LOCATION_QUESTION_OPTION}
                            onChange={(e) => {
                              if (e.target.value === 'yes') {
                                setValue(
                                  'productLocationQuestion.is_broken_or_use',
                                  null
                                );
                                handleResetProductLocation(
                                  AVAILABLE_PRODUCTS_LOCATION.website
                                );
                                // setValue('productLocations[0].isSelected', true);
                              }
                              handleRemoveError();
                              // if(e.target.value === '')
                            }}
                          />
                        </Row>
                      </div>
                    )}
                    {productLocationQuestion?.is_item_in_new_condition ===
                      'no' && (
                      <div className='quetion-rr-col'>
                        <Row className='mb-1'>
                          <Label>Broken/Beyond repair/or use</Label>
                          <FormField
                            type='radio'
                            control={control}
                            errors={errors}
                            name='productLocationQuestion.is_broken_or_use'
                            defaultValue={getValues(
                              'productLocationQuestion.is_broken_or_use'
                            )}
                            key={getValues(
                              'productLocationQuestion.is_broken_or_use'
                            )}
                            options={PRODUCT_LOCATION_QUESTION_OPTION}
                            onChange={(e) => {
                              if (e.target.value === 'yes') {
                                handleResetProductLocation(
                                  AVAILABLE_PRODUCTS_LOCATION.junk
                                );
                              }
                              if (e.target.value === 'no') {
                                handleResetProductLocation(
                                  AVAILABLE_PRODUCTS_LOCATION.store
                                );
                              }
                              handleRemoveError();
                            }}
                            disabled={inventoryRole === 'storageUser' && true}
                          />
                        </Row>
                      </div>
                    )}
                    {productLocationQuestion?.is_factory_sealed === 'no' && (
                      <div className='quetion-rr-col'>
                        <Row className='mb-1'>
                          <Label>What’s the condition of the item ?</Label>
                          <FormField
                            type='radio'
                            control={control}
                            errors={errors}
                            name='productLocationQuestion.condition_of_item'
                            key={getValues(
                              'productLocationQuestion.condition_of_item'
                            )}
                            defaultValue={getValues(
                              'productLocationQuestion.condition_of_item'
                            )}
                            options={
                              PRODUCT_LOCATION_CONDITION_QUESTION_OPTIONS
                            }
                            onChange={(e) => {
                              if (e.target.value === 'new_no_damage') {
                                setValue(
                                  'productLocationQuestion.does_the_product_work',
                                  null
                                );
                                handleResetProductLocation(
                                  AVAILABLE_PRODUCTS_LOCATION.store
                                );
                                // setValue('productLocations[1].isSelected', true);
                              }
                              handleRemoveError();
                            }}
                            disabled={inventoryRole === 'storageUser' && true}
                          />
                        </Row>
                      </div>
                    )}

                    {productLocationQuestion?.condition_of_item === 'used' && (
                      <div className='quetion-rr-col'>
                        <Row className='mb-1'>
                          <Label>Does the product work?</Label>
                          <FormField
                            type='radio'
                            control={control}
                            errors={errors}
                            name='productLocationQuestion.does_the_product_work'
                            key={getValues(
                              'productLocationQuestion.does_the_product_work'
                            )}
                            defaultValue={getValues(
                              'productLocationQuestion.does_the_product_work'
                            )}
                            options={PRODUCT_LOCATION_QUESTION_OPTION}
                            onChange={(e) => {
                              if (e.target.value === 'yes') {
                                handleResetProductLocation(
                                  AVAILABLE_PRODUCTS_LOCATION.store
                                );
                                // setValue('productLocations[1].isSelected', true);
                              }
                              if (e.target.value === 'no') {
                                handleResetProductLocation(
                                  AVAILABLE_PRODUCTS_LOCATION.junk
                                );
                                // setValue('productLocations[2].isSelected', true);
                              }
                              handleRemoveError();
                            }}
                            disabled={inventoryRole === 'storageUser' && true}
                          />
                        </Row>
                      </div>
                    )}
                  </div>

                  <Row className='question-box'>
                    {(productLocationQuestion?.is_broken_or_use !== null ||
                      productLocationQuestion?.is_item_in_new_condition ===
                        'yes' ||
                      productLocationQuestion?.condition_of_item ===
                        'new_no_damage' ||
                      productLocationQuestion?.does_the_product_work !==
                        null) &&
                      productLocations?.length > 0 &&
                      productLocations.map(
                        (individualProductLocation, index) => {
                          return (
                            <>
                              <Col
                                className={`question-col ${
                                  individualProductLocation.isSelected
                                    ? 'active'
                                    : ''
                                }`}
                              >
                                <div className='inner-wrapper'>
                                  <div className='header-wrapper'>
                                    <h4 className='title'>
                                      {individualProductLocation.location}
                                    </h4>
                                    <div className='custom-toggle-btn'>
                                      <FormField
                                        key={getValues(
                                          `productLocations[${index}].isSelected`
                                        )}
                                        defaultValue={getValues(
                                          `productLocations[${index}].isSelected`
                                        )}
                                        type='checkbox'
                                        disabled={
                                          inventoryRole === 'storageUser' &&
                                          true
                                        }
                                        control={control}
                                        errors={errors}
                                        name={`productLocations[${index}].isSelected`}
                                        onChange={() => {
                                          handleRemoveError();
                                        }}
                                      />
                                      <span className='label'></span>
                                    </div>
                                  </div>
                                  {(inventoryRole === 'storageUser' ||
                                    inventoryRole === 'adminUser') && (
                                    <div className='body-wrapper'>
                                      {individualProductLocation.isSelected &&
                                        individualProductLocation
                                          ?.productQuestions?.length > 0 && (
                                          <div>
                                            {individualProductLocation?.productQuestions.map(
                                              (individualProductCriteria) => {
                                                return (
                                                  <>
                                                    {(individualProductCriteria
                                                      ?.type?.value ===
                                                      'text' ||
                                                      individualProductCriteria
                                                        ?.type?.value ===
                                                        'select' ||
                                                      individualProductCriteria
                                                        ?.type?.value ===
                                                        'textarea') && (
                                                      <div className='field-wrapper'>
                                                        <Label>
                                                          {
                                                            individualProductCriteria?.label
                                                          }
                                                        </Label>
                                                        <FormField
                                                          placeholder={
                                                            individualProductCriteria.placeholder
                                                          }
                                                          type={
                                                            individualProductCriteria
                                                              ?.type?.value
                                                          }
                                                          options={
                                                            individualProductCriteria?.options ||
                                                            []
                                                          }
                                                          errors={errors}
                                                          control={control}
                                                          name={`productLocations[${index}].criteria.${individualProductCriteria?.label}`}
                                                        />
                                                      </div>
                                                    )}
                                                  </>
                                                );
                                              }
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              </Col>
                            </>
                          );
                        }
                      )}

                    {showCustomErrors.selectQuestion && (
                      <>
                        <span className='text-danger'>
                          {showCustomErrors.selectQuestion}
                        </span>
                      </>
                    )}
                  </Row>
                </CardBody>
              </Card>
            )}
            {(inventoryRole === 'inputUser' ||
              inventoryRole === 'adminUser') && (
              <div className='generate-barcode-wrapper'>
                <h3 className='step-title step-1'>Generate Barcode</h3>
                {params.id !== 'add' && initialValue.barcode ? (
                  <div className='barcode-details'>
                    <h3 className='title'>System Barcode</h3>
                    <Barcode
                      value={initialValue.barcode}
                      format='CODE128'
                      width='3'
                    />
                  </div>
                ) : (
                  <>
                    <GenerateBarcode
                      setBarcodeValue={(value) => {
                        setBarcodeData(value);
                      }}
                    />
                    {errors?.barcode &&
                      errors?.barcode?.type === 'required' && (
                        <div
                          className='text-danger block'
                          style={{ fontSize: '0.857rem' }}
                        >
                          {errors?.barcode?.message}
                        </div>
                      )}
                  </>
                )}
                {manufactureBarcode && (
                  <div className='barcode-details'>
                    <h3 className='title'>Manufacture Barcode</h3>
                    <Barcode
                      value={manufactureBarcode}
                      format='CODE128'
                      width='3'
                    />
                  </div>
                )}
                {false && (
                  <Col className='mb-1 syncToWooCommerce-col' md={6} xs={12}>
                    <div className='sygn-wrapper'>
                      <FormField
                        className='form-control'
                        name='syncToWooCommerce'
                        type='checkbox'
                        errors={errors}
                        control={control}
                        defaultValue={getValues('syncToWooCommerce')}
                        key={getValues('syncToWooCommerce')}
                        onChange={params.id !== 'add' && handleWooCheckboxValue}
                      />
                      <img src='/images/wooCommerce-Logo.png' />
                    </div>
                  </Col>
                )}
              </div>
            )}
            <div className='d-flex align-items-center justify-content-center fixed-button-wrapper'>
              <SaveButton
                width='230px'
                className='mt-2 align-items-center justify-content-center'
                type='submit'
                loading={createProductLoading || updateProductLoading}
                name={params.id !== 'add' ? 'Update Product' : 'Add Product'}
              ></SaveButton>
            </div>
          </Form>
        </>
      )}
      {showPrintModal ? (
        <>
          <PrintBarcodeModal
            setBarcodeModal={setShowPrintModal}
            product={initialValue}
            barcodeModal={showPrintModal}
          />
        </>
      ) : null}
    </>
  );
};
export default AddProductDetailForm;
