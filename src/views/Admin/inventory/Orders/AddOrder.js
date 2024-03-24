import React, { useRef, useState, useEffect} from 'react';
import AddOrderForm from '../components/AddOrderForm';
import Wizard from '@components/wizard';
import AddCustomerForm from '../components/AddCustomerForm';
import AddCustomerShippingDetails from '../components/AddCustomerShippingDetails';
import AddPaymentForm from '../components/AddPaymentForm';
import { useCreateOfflineOrder, useGetOfflineOrder, useUpdateOfflineOrder } from '../hooks/InventoryOfflineOrderApi';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, Spinner, UncontrolledTooltip } from 'reactstrap';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';


const AddOrder = () => {
  const [stepper, setStepper] = useState(null);
  const history = useHistory();
  const params = useParams();
  const [order, setOrder] = useState({})

  const { basicRoute } = useGetBasicRoute();
  const [formData, setFormData] = useState({
    _id: null,
    customerDetails: null,
    orderDetails: null,
    shippingDetails: null,
    paymentDetails: null,
    isCompleted: false,
  });
  const { createOfflineOrder } = useCreateOfflineOrder();
  const { updateOfflineOrder } = useUpdateOfflineOrder();
  const { getOrder, isLoading: getOrderLoading } = useGetOfflineOrder();

  const ref = useRef(null);

  const onSubmit = async() => {
    const rawData = formData;
    if (params.id !== 'add') {
      rawData.totalAmount = formData.orderDetails.totalAmount;
      rawData.company = order.company;
      rawData.createdBy = order.createdBy;
      const { error } = await updateOfflineOrder(params.id, rawData, 'Update Order...'); 
      if (!error) {
        history.push(`${basicRoute}/orders`);
      }
    } else {
      rawData.totalAmount = formData.orderDetails.totalAmount;
      const { error } = await createOfflineOrder(rawData, 'Save Order...'); 
      if (!error) {
        history.push(`${basicRoute}/orders`);
      }
    }
    
  }

  useEffect(() => {
    if (
     
      formData &&
      formData.isCompleted && 
      formData.customerDetails !== null &&
      formData.orderDetails !== null &&
      formData.shippingDetails !== null && 
      formData.paymentDetails !== null
    ) {
      onSubmit();
    }
  }, [formData]);

  useEffect(() => {
    if (params.id !== 'add') {
      getOrderDetails();
    }
  }, [params.id])

  const getOrderDetails = async() => {
     const { data, error } = await getOrder(params.id);
    if (!error) {
      const orderDetails = data;
      setOrder(orderDetails);
      setFormData({
        _id: orderDetails._id,
        customerDetails: { ...orderDetails.customerDetails },
        orderDetails: { ...orderDetails.orderDetails },
        shippingDetails: { ...orderDetails.shippingDetails },
        paymentDetails: { ...orderDetails.paymentDetails },
        isCompleted: false,
      });
    }  
  }

  const steps = [
    {
      id: 'customer-details',
      title: 'Customer Details',
      subtitle: 'Enter Your Customer Details.',
      content: (
        <AddCustomerForm
          stepper={stepper}
          setFormData={setFormData}
          formData={formData}
        />
      ),
    },
    {
      id: 'order-details',
      title: 'Order Details',
      subtitle: 'Add Order details',
      content: (
        <AddOrderForm
          stepper={stepper}
          setFormData={setFormData}
          formData={formData}
        />
      ),
    },
    {
      id: 'shipping-details',
      title: 'Shipping Details',
      subtitle: 'Add Shipping details',
      content: (
        <AddCustomerShippingDetails
          stepper={stepper}
          setFormData={setFormData}
          formData={formData}
        />
      ),
    },
    {
      id: 'payment-details',
      title: 'Payment Details',
      subtitle: 'Add Payment details',
      content: (
        <AddPaymentForm 
          stepper={stepper}
          setFormData={setFormData}
          formData={formData}
        />
      ),
    },
  ];
  return (
    <>
      {getOrderLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <Card className='inventory-order-add-update-card'>
          <CardHeader>
            <CardTitle className='d-flex align-items-center'>
              <div
                className='back-arrow'
                onClick={() => history.goBack()}
                id={'goback'}
              >
                <UncontrolledTooltip placement='top' target={`goback`}>
                  Go Back
                </UncontrolledTooltip>
              </div>
              <h4 className={`title card-title`}>
                OfflineOrder Details
              </h4>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Wizard instance={(el) => setStepper(el)} ref={ref} steps={steps} />
          </CardBody>
        </Card>
      )
      }
    </>
  )
     
};

export default AddOrder;
