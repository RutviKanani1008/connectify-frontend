import { Button, Col, Form, Row } from "reactstrap"
import { FormField } from "../../../../@core/components/form-fields"
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Trash } from "react-feather";
import _ from 'lodash';
import { useGetProductsByName } from "../hooks/InventoryProductApi";
import { useState, useEffect } from "react";
import * as yup from 'yup';
import { required } from "../../../../configs/validationConstant";
import { yupResolver } from "@hookform/resolvers/yup";
import noProductImage from '../../../../assets/images/pages/no-product-image.png';

const ORDER_STATUS = [
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "ready-for-pickup",
    label: "Ready For Pickup",
  },
  {
    value: "on-hold",
    label: "On hold",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "checkout-draft",
    label: "Draft",
  }
];

const orderFormSchema = yup.object().shape({
  orderStatus: yup.object().required(required('Order Status')).nullable(),
});

const AddOrderForm = ({ stepper, setFormData, formData }) => {
  const { getProductsByName } = useGetProductsByName();
  const [searchProducts, setSearchProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0)

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(orderFormSchema),
  });

  useEffect(() => {
    setValue('orderStatus', formData?.orderDetails?.orderStatus)
    if (formData?.orderDetails?.orderItems) {
      setOrderItems(formData?.orderDetails?.orderItems)
      let total = 0;
        formData?.orderDetails?.orderItems.length > 0 && formData?.orderDetails?.orderItems.map((item) => {
          if (item.purchaseTotal) {
            total += item.purchaseTotal
          }
        })
      setTotalAmount(total);
    }
  
  }, [formData?.orderDetails])

  const onSubmit = (submitData) => {
    if (orderItems && orderItems.length > 0) {
    const data = {};
    data.orderItems = orderItems;
    data.totalAmount = totalAmount;
    data.orderStatus = submitData.orderStatus
    setFormData({ ...formData, orderDetails: data });
    stepper.next()
    } else {
      setError('searchProduct',  { message: `Please Select one Item to proceed`});
    }
   
  };

  const handleSearchProduct = _.debounce((e) => {
    if (e.target.value !== null && e.target.value !== '') {
      getProducts(e.target.value)
    } else {
      clearErrors('searchProduct');
      setSearchProducts([])
    }
  }, 500)
  
  const getProducts = async (name) => {
    const { data } = await getProductsByName({ title: name });
    setSearchProducts(data)
  }

  const addOrderItems = (product) => {
    clearErrors('searchProduct')
    product.purchaseQty = 1; 
    const discountPrice = (Number(product.price) - Number(product.salePrice || 0))
    product.purchaseTotal =  Number(product.price - discountPrice) * Number(product.purchaseQty) 
    const isExist = orderItems && orderItems.length > 0 && orderItems.filter((item) => (item._id === product._id))
    if (isExist && isExist.length > 0) {
      setError('searchProduct',  { message: `Product Already Exist!`});
       setSearchProducts([]);
    } else {  
      const orderData = [...orderItems, product];
      setOrderItems(orderData);
      setSearchProducts([]);
      setValue('searchProduct', null);
      let total = 0;
      orderData.length > 0 && orderData.map((item) => {
        if (item.purchaseTotal) {
          total += item.purchaseTotal
        }
      })
    setTotalAmount(total);
    }
   
  }

  const removeProduct = (product) => {
    const productItems = [...orderItems];
    const newProducts = productItems.filter((item) => (item._id !== product._id));
    setOrderItems(newProducts);
    let total = 0;
    newProducts.length > 0 && newProducts.map((item) => {
      if (item.purchaseTotal) {
        total += item.purchaseTotal
      }
    })
    setTotalAmount(total);
  }

  const handleQuantity = (product, e, index) => {
     
    if (e && e.target.value) {
      if (!(Number(e.target.value) <= Number(product.quantity))) {
      product.purchaseQty = product.quantity; 
      setValue(`quantity-${index}`, Number(product.quantity))
    } else if (Number(e.target.value) <= 1) {
       product.purchaseQty = 1; 
      setValue(`quantity-${index}`, 1)
    } else { 
      product.purchaseQty = e.target.value; 
      setValue(`quantity-${index}`, e.target.value)
    }
      const discountPrice = (Number(product.price) - Number(product.salePrice || 0))
      product.purchaseTotal = Number(product.price - discountPrice) * Number(product.purchaseQty) 
    }
   
    const newProducts = [...orderItems];
    newProducts[index] = product;
    setOrderItems(newProducts);
    manageTotalAmount(); 
  }

  const manageQuantity = (product, index, type) => {
    if (type === 'increment') {
      if (product.quantity >= product.purchaseQty) {
        product.purchaseQty = Number(product.purchaseQty) + 1;
        setValue(`quantity-${index}`, product.purchaseQty)
        const discountPrice = (Number(product.price) - Number(product.salePrice || 0))
        product.purchaseTotal =  Number(product.price - discountPrice) * Number(product.purchaseQty) 
      } 
    } else {
      if (product.purchaseQty > 1) {
        product.purchaseQty -= 1;
        setValue(`quantity-${index}`,  product.purchaseQty)
        const discountPrice = (Number(product.price) - Number(product.salePrice || 0))
        product.purchaseTotal =  Number(product.price - discountPrice) * Number(product.purchaseQty) 
      }
    
    }
    const newProducts = [...orderItems];
    newProducts[index] = product;
    setOrderItems(newProducts);
    manageTotalAmount();
  }

  const manageTotalAmount = () => {
    let total = 0;
    orderItems.map((item) => {
      if (item.purchaseTotal) {
        total += item.purchaseTotal
      }
    })
    setTotalAmount(total);
  }

  return (
    <>
      <Form
        className='auth-login-form mt-2'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
      <Row className="step1-row">
        <Col className='mb-1' md={12} xs={12}>
          <div className="order-details">
            <Row>
              <Col className='mb-1' md={6} xs={12}>
                <FormField
                  name='searchProduct'
                  label='Product'
                  placeholder='Search Product by Name'
                  type='text'
                  control={control}
                  onChange={(e) => { handleSearchProduct(e) }}
                  />
                  {errors.searchProduct && 
                    <div className='mt-1 text-danger'>{errors.searchProduct.message}</div>
                  }
                  {searchProducts && searchProducts.length > 0 &&
                    <ul className="product-list">
                      {searchProducts.map((item, i) => (
                        <li key={i} onClick={() => { addOrderItems(item) }}>
                          <img
                            src={item.image ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${item.image}` : noProductImage} />
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  }
              </Col>
            </Row>
          </div>
        </Col>
          <h5>Order items </h5>
          <div className="table-responsive order-items">
            <table className="table">
              <thead className="bg-gray-300">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Product</th>
                  <th scope="col">Net Unit Cost</th>
                  <th scope="col">Current Stock</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Discount</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col" className="text-center"></th>
                </tr>
              </thead>
              <tbody>
                {orderItems && orderItems.length > 0 && 
                  orderItems.map((item, index) => (
                     <tr key = {index}>
                      <td>{ index + 1}</td>
                      <td>
                        <img style={{ width: '30px', height: '30px', marginRight: '10px' }}
                          src={item.image ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${item.image}` : noProductImage} />
                        <span>{ item.title}</span>
                    </td>
                      <td>$ { item.price}</td>
                      <td>{ item.quantity}</td>
                    <td>
                      <div className="product-qty">
                        <Button
                          type="button"
                          onClick ={() => manageQuantity(item, index, 'decrement')}
                          className='qt-inc p-0 me-1'
                          color='primary'
                          disabled={item.purchaseQty <= 1}
                        >
                          -
                        </Button>
                        <div className='qt-input me-1'>
                          <FormField
                            name={`quantity-${index}`}
                            type='number'
                            onChange ={(e) => handleQuantity(item, e, index)}
                            control={control}  
                            defaultValue={item.purchaseQty}  
                          />
                        </div>
                        <Button
                          className='qt-inc p-0'
                          color='primary'
                          type="button"
                          onClick={() => manageQuantity(item, index, 'increment')}
                          disabled={item.purchaseQty >= item.quantity}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>{ `$ ${item.salePrice ? (item.price - item.salePrice) : 0}`}</td>
                    <td>{`$ ${item.purchaseTotal ? item.purchaseTotal : 0}`}</td>
                    <td><Trash color="red" onClick={() => removeProduct(item)}/></td>
                  </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="offset-md-9 col-md-3 mt-4">
            <table className="table table-striped table-sm">
              <tbody>
                <tr><td className="bold">Shipping</td><td>$ 0</td></tr>
                <tr><td><span className="font-weight-bold">Grand Total</span></td><td><span className="font-weight-bold">{ `$ ${totalAmount ? totalAmount : 0}`}</span></td></tr>
              </tbody>
            </table>
          </div>
        </Row>
        <Row>
          <Col md={6} xs={12}>
            <FormField
              label='Order Status'
              type='select'
              name='orderStatus'
              options={ORDER_STATUS}
              control={control}
              errors={errors}
              placeholder='Select Order Status'
            />
          </Col>
        </Row>
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
          <span className='align-middle d-sm-inline-block d-none '>Next</span>
            <ArrowRight
            size={14}
            className='align-middle me-sm-25 me-0'
          ></ArrowRight>
        </Button>
      </div>
      </Form>
    </>
  )
  
}
export default AddOrderForm