// ==================== Packages =======================
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import * as yup from 'yup';
// ====================================================
import { useAddPaymentMethod } from '../service/paymentMethod.services';
import { SaveButton } from '../../../../../@core/components/save-button';
import CardForm from './CardForm';
import { FormField } from '@components/form-fields';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../../configs/validationConstant';
import { useState } from 'react';

const customerSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
});

const AddPaymentMethodModal = ({ isOpen, setIsOpen }) => {
  // ** Hooks **
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(customerSchema),
    defaultValues: { name: '' },
  });
  // ** states **
  const [stripeError, setStripeError] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  // ** Custom Hooks **
  const { addPaymentMethod, isLoading } = useAddPaymentMethod();

  const stripe = useStripe();
  const elements = useElements();

  const onSubmit = async (values) => {
    try {
      if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        return;
      }
      setStripeLoading(true);
      const payload = await stripe.createPaymentMethod({
        type: 'card',
        billing_details: {
          name: values.name,
          address: values.address || '',
        },
        card: elements.getElement(CardElement),
      });
      setStripeLoading(false);
      if (payload?.error?.message) {
        setStripeError(payload.error.message);
        return;
      } else {
        setStripeError('');
      }
      if (payload?.paymentMethod?.card) {
        const card = payload?.paymentMethod.card;
        const { error } = await addPaymentMethod({
          billingCustomerId: isOpen.billingCustomerId,
          name: values.name,
          brand: card.brand,
          paymentMethodId: payload.paymentMethod.id,
          contact: isOpen.id,
          cardLast4DigitNo: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
          address: values.address || '',
        });
        if (!error) {
          setIsOpen({ toggle: false, id: '' });
        }
      }
    } catch (error) {
      setStripeLoading(false);
      console.log('error', error.message ? error.message : error);
    }
  };

  return (
    <Modal
      isOpen={isOpen.toggle}
      toggle={() => {
        setIsOpen({ toggle: false, id: '' });
      }}
      backdrop='static'
      className='modal-dialog-centered add__payment__modal_wp'
    >
      <ModalHeader
        toggle={() => {
          setIsOpen({ toggle: false, id: '' });
        }}
      >
        Add Payment Method
      </ModalHeader>
      <ModalBody className=''>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <div>
            <FormField
              name='name'
              label='Cardholder Name'
              placeholder='Enter name ...'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
          <div className='mt-1'>
            <FormField
              name='address'
              label='Billing address'
              placeholder='Enter address ...'
              type='textarea'
              errors={errors}
              control={control}
            />
          </div>
        </Form>
        <CardForm />
        {stripeError && <span className='c-error'>{stripeError}</span>}
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            setIsOpen({ toggle: false, id: '' });
          }}
        >
          Cancel
        </Button>
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <SaveButton
            loading={isLoading || stripeLoading}
            disabled={isLoading || stripeLoading}
            width='100px'
            color='primary'
            name={'Add'}
            type='submit'
            className='align-items-center justify-content-center'
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};
export default AddPaymentMethodModal;
