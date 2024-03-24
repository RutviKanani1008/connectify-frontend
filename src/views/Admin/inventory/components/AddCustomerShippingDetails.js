import { ArrowLeft, ArrowRight } from 'react-feather';
import { useForm } from 'react-hook-form';
import { Button, Form } from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../../configs/validationConstant';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '../../../../@core/components/form-fields';
import { useEffect, useState } from 'react';

const shippingSchema = yup.object().shape({
  address1: yup.string().required(required('Address Line 1')),
  city: yup.string().required(required('City')),
  state: yup.string().required(required('State')),
});

const AddCustomerShippingDetails = ({ stepper, setFormData, formData }) => {
  const [isSameBilling, setIsBilling] = useState(true);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(shippingSchema),
    defaultValues: formData?.shippingDetails,
  });

  useEffect(() => {
    reset(formData?.shippingDetails);
  }, [formData?.shippingDetails]);

  const onSubmit = (data) => {
    setFormData({ ...formData, shippingDetails: data, isCompleted: false });
    stepper.next();
  };
  const handleBillingAddress = () => {
    setIsBilling(getValues('isSameBillingAddress'));
  };

  return (
    <Form
      className='auth-login-form mt-2'
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
    >
      <div className='mb-1 col-md-6'>
        <label className='form-label'>Shipping Address</label>
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          label='Address Line 1'
          name='address1'
          placeholder='Enter Address Line 1'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          name='address2'
          label='Address Line 2'
          placeholder='Enter Address Line 2'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          name='city'
          label='City'
          placeholder='Enter City'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          name='state'
          label='State'
          placeholder='Enter State'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          name='country'
          label='Country'
          placeholder='Enter Country'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1'>
        <label className='form-label'>Billing Address is Same ?</label>
        <FormField
          name='isSameBillingAddress'
          type='checkbox'
          defaultValue='true'
          errors={errors}
          control={control}
          onChange={handleBillingAddress}
        />
        {!isSameBilling && (
          <>
            <div className='mb-1 col-md-6'>
              <label className='form-label'>Billing Address</label>
            </div>
            <div className='mb-1 col-md-6'>
              <FormField
                label='Address Line 1'
                name='billingAddress1'
                placeholder='Enter Address Line 1'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div className='mb-1 col-md-6'>
              <FormField
                name='billingAddress2'
                label='Address Line 2'
                placeholder='Enter Address Line 2'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div className='mb-1 col-md-6'>
              <FormField
                name='billingCity'
                label='City'
                placeholder='Enter City'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div className='mb-1 col-md-6'>
              <FormField
                name='billingState'
                label='State'
                placeholder='Enter State'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div className='mb-1 col-md-6'>
              <FormField
                name='billingCountry'
                label='Country'
                placeholder='Enter Country'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </>
        )}
      </div>
      <div className='d-flex justify-content-between mt-2'>
        <Button
          type='button'
          color='primary'
          className='btn-prev'
          onClick={() => stepper.previous()}
        >
          <ArrowLeft
            size={14}
            className='align-middle me-sm-25 me-0'
          ></ArrowLeft>
          <span className='align-middle d-sm-inline-block d-none'>
            Previous
          </span>
        </Button>
        <Button type='submit' color='primary' className='btn-next'>
          <span className='align-middle d-sm-inline-block'>Next</span>
          <ArrowRight size={14} className='align-middle ms-25'></ArrowRight>
        </Button>
      </div>
    </Form>
  );
};

export default AddCustomerShippingDetails;
