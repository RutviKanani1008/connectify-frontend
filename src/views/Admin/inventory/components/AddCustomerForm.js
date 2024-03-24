import { ArrowRight } from 'react-feather';
import { useForm } from 'react-hook-form';
import { Button, Form } from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../../configs/validationConstant';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '../../../../@core/components/form-fields';
import { useEffect } from 'react';

const customerSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
  email: yup.string().email().required(required('Email')),
});

const AddCustomerForm = ({ stepper, setFormData, formData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(customerSchema),
    defaultValues: formData?.customerDetails,
  });

  useEffect(() => {
    reset(formData?.customerDetails);
  }, [formData?.customerDetails]);

  const onSubmit = (data) => {
    setFormData({ ...formData, customerDetails: data, isCompleted: false });
    stepper.next();
  };

  return (
    <Form
      key='customer-form'
      className='auth-login-form mt-2'
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
    >
      <div className='mb-1 col-md-6'>
        <FormField
          label='Name'
          name='name'
          placeholder='Enter Name'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          label='Email'
          name='email'
          placeholder='john@example.com'
          type='text'
          errors={errors}
          control={control}
        />
      </div>
      <div className='mb-1 col-md-6'>
        <FormField
          type='phone'
          label='Phone Number'
          name='phone'
          placeholder='Phone Number'
          errors={errors}
          control={control}
        />
      </div>
      <div className='d-flex justify-content-between mt-2'>
        <div></div>
        <Button type='submit' color='primary' className='btn-next'>
          <span className='align-middle d-sm-inline-block d-none '>Next</span>
          <ArrowRight
            size={14}
            className='align-middle ms-sm-25 ms-0'
          ></ArrowRight>
        </Button>
      </div>
    </Form>
  );
};

export default AddCustomerForm;
