import { ArrowLeft } from "react-feather";
import { useForm, useWatch } from "react-hook-form";
import { Button, Form } from "reactstrap";
import * as yup from 'yup';
import { required } from "../../../../configs/validationConstant";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormField } from "../../../../@core/components/form-fields";
import { useEffect } from "react";

const paymentSchema = yup.object().shape({
  paymentMethod: yup.object().required(required('Payment Method')).nullable(),
  paymentStatus: yup.object().required(required('Payment Status')).nullable(),
});

const AddPaymentForm = ({ stepper, setFormData, formData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(paymentSchema),
    defaultValues: formData?.paymentDetails
  });
  const PAYMENT_METHOD = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'Cheque', value: 'cheque' }
  ];
  const PAYMENT_STATUS = [
    { label: 'Paid', value: 'paid' },
    { label: 'Unpaid', value: 'unpaid' },
    { label:'Partial', value:'partial'}    
  ]

  const fieldType = useWatch({
    control,
    name: `paymentMethod`,
  });
  const onSubmit = (data) => {
    setFormData({ ...formData, paymentDetails: data, isCompleted: true });
    stepper.next();
  };

  useEffect(() => {
    reset(formData?.paymentDetails);
  }, [formData?.paymentDetails]);


  return (
    <Form
      className='auth-login-form mt-2'
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
    >
    <div className='mb-1 col-md-6'>
      <FormField
        label='Payment Method'
        name='paymentMethod'
        placeholder='Select Payment Method'
        type='select'
        options={PAYMENT_METHOD}
        errors={errors}
        control={control}
      />
      </div>
    <div className='mb-1 col-md-6'>
        {(fieldType?.value === 'card' || fieldType?.value === 'cheque')  &&
          <FormField
            label='Reference Number'
            name='refNumber'
            placeholder='Enter Reference Number'
            type='text'
            errors={errors}
            control={control}
          />}
    </div>
    <div className='mb-1 col-md-6'>
      <FormField
        label='Payment Status'
        name='paymentStatus'
        placeholder='Select Payment status'
        type='select'
        options={PAYMENT_STATUS}
        errors={errors}
        control={control}
      />
      </div>
    <div className='mb-1 col-md-6'>
      <FormField
        label='Remarks'
        name='paymentRemarks'
        placeholder='Enter Remarks'
        type='text'
        errors={errors}
        control={control}
      />
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
        <span className='align-middle d-sm-inline-block d-none '>Submit</span>
      </Button>
    </div>
    </Form>
  )
}

export default AddPaymentForm