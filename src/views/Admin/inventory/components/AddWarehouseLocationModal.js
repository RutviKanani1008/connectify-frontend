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

import { getCurrentUser } from '../../../../helper/user.helper';
import {
  useCheckLocationIsExist,
  useCreateLocation,
  useUpdateLocation,
} from '../hooks/InventoryWarehouseLocationApi';

const STORE_TYPES = [
  { label: 'Retail Store', value: 'retail' },
  { label: 'Warehouse', value: 'warehouse' },
];

const AddWarehouseLocationModal = ({
  setLocationModal,
  locationModal,
  getLocations: getLocationOptions,
  getValues: getLocationFormValues,
  reset: resetLocationForm,
  currentLocationDetail,
  formField,
}) => {
  const user = getCurrentUser();
  const { control, handleSubmit, reset, setError, errors } =
    formField;
  const { createLocation, isLoading: createLocationLoading } =
    useCreateLocation();
  const { updateLocation, isLoading: updateLocationLoading } =
    useUpdateLocation();
  const { checkLocationIsExist, isLoading: checkIsExistLoading } =
    useCheckLocationIsExist();

  useEffect(() => {
    reset(currentLocationDetail);
  }, [currentLocationDetail]);

  const onSubmit = async (locationData) => {
    const { error } = await checkLocationIsExist({
      name: locationData?.name?.replace(/ /g, '-').toLowerCase(),
      type: locationData?.type,
    });
    if (error === 'Location already exists.') {
      setError(
        `name`,
        { type: 'focus', message: `Location name is already exist.` },
        { shouldFocus: true }
      );
      return;
    }

    const rawData = JSON.parse(JSON.stringify(locationData));
    rawData.company = user.company._id;
    if (rawData?.category?.value) {
      rawData.name = rawData.category.value;
    } else {
      delete rawData.category;
    }
    if (currentLocationDetail._id) {
      const { error } = await updateLocation(
        currentLocationDetail._id,
        rawData,
        'Update Location...'
      );
      if (!error) {
        setLocationModal({ toggle: false, currentLocationDetail: {} });
        getLocationOptions();
      }
    } else {
      const { error, data } = await createLocation(rawData, 'Save Location...');
      if (!error) {
        resetLocationForm({
          ...getLocationFormValues(),
          category: {
            label: data.name,
            value: data._id,
          },
        });
        setLocationModal({ toggle: false, currentLocationDetail: {} });
        getLocationOptions();
      }
    }
  };

  return (
    <Modal
      isOpen={locationModal.toggle}
      toggle={() => {
        setLocationModal({ toggle: false, currentLocationDetail: {} });
      }}
      className='modal-dialog-centered preview-dialog add-product-category-modal'
      backdrop='static'
    >
      <ModalHeader
        toggle={() =>
          setLocationModal({ toggle: false, currentLocationDetail: {}, id: '' })
        }
      >
        {currentLocationDetail?._id ? 'Update Location' : 'Add Location'}
      </ModalHeader>

      <ModalBody>
        <>
          <Form
            key={locationModal.toggle}
            className='auth-login-form'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <Row className='mt-1'>
              <Col md='12' sm='12' lg='12' className='mb-2'>
                <FormField
                  name='name'
                  label='Name'
                  placeholder='Enter name'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </Col>
              <Col md='12' sm='12' lg='12' className='mb-2'>
                <FormField
                  name='type'
                  key='type'
                  label='Store Type'
                  placeholder='Select Store Type'
                  type='select'
                  errors={errors}
                  control={control}
                  options={STORE_TYPES}
                />
              </Col>
              <Col md='12' sm='12' lg='12' className='mb-2'>
                <FormField
                  name='address'
                  label='Address'
                  placeholder='Enter address'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </Col>
              <Col md='12' sm='12' lg='12' className='mb-2'>
                <FormField
                  name='city'
                  label='City'
                  placeholder='Enter City'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </Col>
              <Col md='12' sm='12' lg='12' className='mb-2'>
                <FormField
                  name='state'
                  label='State'
                  placeholder='Enter State'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </Col>
              <Col md='12' sm='12' lg='12' className='mb-2'>
                <FormField
                  name='country'
                  label='Country'
                  placeholder='Enter Country'
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
          onClick={() => setLocationModal({ toggle: false, categoryName: '' })}
        >
          Cancel
        </Button>
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <SaveButton
            width='171px'
            type='submit'
            name={currentLocationDetail._id ? 'Update' : 'Save'}
            loading={
              createLocationLoading ||
              updateLocationLoading ||
              checkIsExistLoading
            }
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};
export default AddWarehouseLocationModal;
