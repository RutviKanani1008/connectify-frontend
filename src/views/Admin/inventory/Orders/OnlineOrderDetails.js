import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {  Card, CardBody, CardHeader, CardTitle, Input, Label, Spinner, UncontrolledTooltip } from "reactstrap"
import { useGetOnlineOrder, useUpdateOnlineOrder } from "../hooks/InventoryOnlineOrderApi";
import { useSelector } from "react-redux";
import { userData } from "../../../../redux/user";
import { useGetWooConnection } from "../hooks/InventoryWooConnectionApi";
import { SaveButton } from "../../../../@core/components/save-button";

const ORDER_STATUS = [
  {
    value: 'processing',
    label: 'Processing',
  },
  {
    value: 'ready-for-pickup',
    label: 'Ready For Pickup',
  },
  {
    value: 'on-hold',
    label: 'On hold',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'refunded',
    label: 'Refunded',
  },
  {
    value: 'failed',
    label: 'Failed',
  },
  {
    value: 'checkout-draft',
    label: 'Draft',
  },
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'ready-for-ship',
    label: 'Ready For shipping',
  },
  {
    value: 'waiting-for-pick',
    label: 'Waiting For Pickup',
  }
]
const OnlineOrderDetails = () => {
  const history = useHistory();
  const params = useParams();
  const user = useSelector(userData);
  const [orderDetail, setOrderDetail] = useState({});
  const { getOrder, isLoading: getOrderLoading } = useGetOnlineOrder();
  const [statusButton, setStatusButton] = useState({ label: 'Hold the order', value: 'on-hold' })
  const [instructions, setInstructions] = useState()
  const [actions] = useState([
    { label: 'Yes', value: "true" },
    { label: 'No', value: "false" },
  ]);
  const { updateOnlineOrder, isLoading: updateStatusLoading } = useUpdateOnlineOrder();
  const { getWooConnection } = useGetWooConnection();

  useEffect(() => {
    getOrderDetails()
    getInventoryRoleInstructions()
  }, [params.id]);

  const getInventoryRoleInstructions = async () => {
    const { data } = await getWooConnection();
    if (data && data.instructions) {
      const instruction = data.instructions[user.inventoryRole];
      setInstructions(instruction);
    }
  }

  useEffect(() => {
    if (orderDetail && orderDetail.orderDetails) {
      const isFinalPacking = orderDetail.orderDetails.filter((item => item.pickerAction === 'true'));
      const isFinalShipping = orderDetail.orderDetails.filter((item => item.shipperAction === 'true'));

      if (isFinalPacking.length === orderDetail.orderDetails.length && (user.inventoryRole === 'pickerUser' || user.inventoryRole === 'adminUser')) {
        setStatusButton({ label: 'Finished picking', value: 'ready-for-ship' })
      } else if (isFinalShipping.length === orderDetail.orderDetails.length && (user.inventoryRole === 'shippingUser' || user.inventoryRole === 'adminUser')) {
        setStatusButton({label:'Start Shipping', value:'waiting-for-pick'})
      } else {
        setStatusButton({ label: 'Hold the order', value: 'on-hold' })
      }
    }
  }, [orderDetail])

  const getOrderDetails = async () => {
    const { data, error } = await getOrder(params.id);
    if (!error) {
      const orderDetails = data; 
      setOrderDetail(orderDetails);  
    }
  };

  const setPickerAction = (product, value) => {
    orderDetail.orderDetails.forEach((item) => {
      if (item.id === product.id) {
       item.pickerAction = value
      }
    });
   const isFinalPacking = orderDetail.orderDetails.filter((item => item.pickerAction === 'true'));
      if (isFinalPacking.length === orderDetail.orderDetails.length) {
        setStatusButton({label:'Finished picking', value:'ready-for-ship'})
      } else {
        setStatusButton({label:'Hold the order', value:'on-hold'})
      }
    setOrderDetail({
      ...orderDetail,
       orderDetails: orderDetail.orderDetails,
      status: isFinalPacking.length === orderDetail.orderDetails.length ? 'ready-for-ship' : 'on-hold'
    })
  }
  
  const setPickerComment = (product, value) => {
     const orderItems = orderDetail.orderDetails.map((item) => {
      if (item.id === product.id) {
        return { ...item, pickerComment: value}
      }
    });
    setOrderDetail({ ...orderDetail, orderDetails: orderItems })
  }

  const setShipperAction = (product, value) => {
    orderDetail.orderDetails.forEach((item) => {
      if (item.id === product.id) {
       item.shipperAction = value
      }
    });
   const isFinalPacking = orderDetail.orderDetails.filter((item => item.shipperAction === 'true'));
      if (isFinalPacking.length === orderDetail.orderDetails.length) {
        setStatusButton({label:'Start Shipping', value:'waiting-for-pick'})
      } else {
        setStatusButton({label:'Hold the order', value:'on-hold'})
      }
    setOrderDetail({
      ...orderDetail,
       orderDetails: orderDetail.orderDetails,
      status: isFinalPacking.length === orderDetail.orderDetails.length ? 'waiting-for-pick' : 'on-hold'
    })
  }
  
  const setShipperComment = (product, value) => {
     const orderItems = orderDetail.orderDetails.map((item) => {
      if (item.id === product.id) {
        return { ...item, shipperComment: value}
      }
    });
    setOrderDetail({ ...orderDetail, orderDetails: orderItems })
  }
  const getStatusName = (name, type) => {
     const statusName = ORDER_STATUS.filter((item => item.value === name));
     if (statusName && statusName.length > 0) {
       const data = type === 'label' ? statusName[0]['label'] : statusName[0]['value']
       return data
     }
  }

  const submitOrderStatus = async () => {
    orderDetail.status = statusButton.value;
    await updateOnlineOrder(orderDetail._id, orderDetail, 'Update Order...'); 
  }

  return (
    <>
      {getOrderLoading ? (
          <div className='d-flex align-items-center justify-content-center loader'>
            <Spinner />
          </div>
      ) : (
        <>
          {instructions && (user.inventoryRole === 'pickerUser' || user.inventoryRole === 'shippingUser') && (
                <div className='user-instruction'>
                  <label className='form-label'>Actions to be taken</label>
                  <div className='instructions'>{instructions}</div>
                </div>
          )}
          <Card className="offline-order-details">
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
                    OnlineOrder Details
                  </h4>
                </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="row mt-5">
                <div className="mb-4 col-sm-12 col-md-3 col-lg-3">
                  <h5 className="font-weight-bold">Customer Info</h5>
                  <div>{ orderDetail.customerDetails ? orderDetail.customerDetails[0].name : ''}</div>
                  <div>{ orderDetail.customerDetails ? orderDetail.customerDetails[0].email : ''}</div>
                 
                </div>
                <div className="mb-4 col-sm-12 col-md-3 col-lg-3">
                  <h5 className="font-weight-bold">Shipping Info</h5>
                  <div>{orderDetail.shipping?.first_name} {orderDetail.shipping?.last_name }</div>
                  <div>{orderDetail.shipping?.address_1}</div>
                  <div>{orderDetail.shipping?.address_2}</div>
                  <div>{orderDetail.shipping?.city } {orderDetail.shipping?.state} {orderDetail.shipping?.postcode}</div>
                  <div>{orderDetail.shipping?.country }</div>
                </div>
                 <div className="mb-4 col-sm-12 col-md-3 col-lg-3">
                  <h5 className="font-weight-bold">Billing Info</h5>
                  <div>{orderDetail.billing?.first_name} {orderDetail.billing?.last_name }</div>
                  <div>{orderDetail.billing?.address_1}</div>
                  <div>{orderDetail.billing?.address_2}</div>
                  <div>{orderDetail.billing?.city } {orderDetail.billing?.state}  {orderDetail.billing?.postcode}</div>
                  <div>{orderDetail.shipping?.country }</div>
                </div>
                <div className="mb-4 col-sm-12 col-md-3 col-lg-3">
                  <h5 className="font-weight-bold">Order Info</h5>
                  <div>Order Number : {orderDetail.number}</div>
                  <div  className="my-1">
                      Status : <span className={ `online-order-status ${getStatusName(orderDetail.status, 'value')}`}>{getStatusName(orderDetail.status, 'label')}</span></div>
                   <div>
                    Payment Status : <span>{orderDetail.payment_method}</span>
                  </div>
                </div>
              </div>
                <h5>Order items </h5>
                <div className="table-responsive order-items">
                  <table className="table">
                    <thead className="bg-gray-300">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Product</th>
                        <th scope="col">Qty</th>
                      {(user.inventoryRole === 'pickerUser' || user.inventoryRole === 'shippingUser'  || user.inventoryRole === 'adminUser') &&
                        <th>Product Locations</th>
                      }
                      {(user.inventoryRole === 'pickerUser' || user.inventoryRole === 'adminUser') &&
                        <th>Picker Action</th>
                      }
                       {(user.inventoryRole === 'shippingUser'  || user.inventoryRole === 'adminUser') &&
                        <th>Shipper Action</th>
                      }
                      {(user.inventoryRole !== 'pickerUser' &&  user.inventoryRole !== 'shippingUser') &&
                        <>
                        <th scope="col">Net Unit Cost</th>          
                        <th scope="col">Tax</th>
                        <th scope="col">Subtotal</th>
                        <th scope="col" className="text-center"></th>
                        </>
                      }
                      </tr>
                    </thead>
                  <tbody>
                    {orderDetail.orderDetails && orderDetail.orderDetails.length > 0 && 
                       orderDetail.orderDetails.map((item, index) => (       
                          <tr key = {index}>
                            <td>{ index + 1}</td>
                          <td>
                              <span>{item.name}</span>
                           </td>
                          <td>
                            <div className="product-qty">
                            {item.quantity}
                            </div>
                           </td>
                           {(user.inventoryRole === 'pickerUser' || user.inventoryRole === 'shippingUser' || user.inventoryRole === 'adminUser') &&
                             <td>
                               {item.productLocations.map((item, index) => {
                                 if (item.isSelected) {
                                   return (
                                     <>
                                       <ol key={index} className='criteria-details'>
                                         <li>
                                           <div className='inner-wrapper'>
                                             <span className='label'>{item.location}</span>
                                             {item.criteria && Object.keys(item.criteria).map((k, index) => (
                                               <div className='value' key={index}>
                                                 {typeof item.criteria[k] !== 'object' ?
                                                   <>
                                                     <span>{k}</span> : <span>{item.criteria[k]}</span>
                                                   </>
                                                   :
                                                   <>
                                                     <span>{k}</span> : <span>{item.criteria[k]?.value}</span>
                                                   </>
                                                 }
                                               </div>
                                             ))}
                                           </div>
                                         </li>
                                       </ol>
                                     </>
                                   )
                                 }
                               })}
                             </td>
                           }
                            {(user.inventoryRole === 'pickerUser' || user.inventoryRole === 'adminUser') &&
                             <td>
                              <label className="form-label">Did you find Product ?</label>
                              {actions.map(({ label, value }, index) => (
                                <div className='form-check me-2' key={index}>
                                  <Input
                                    type='radio'
                                    id={`${label}`}
                                    value={value}
                                    checked={item.pickerAction === value}
                                    name={`${item.name} picker`}
                                    onChange={(e) => {
                                      setPickerAction(item, e.target.value);
                                    }}
                                  />
                                  <Label
                                    className='d-flex form-check-label'
                                    for={`${label}`}
                                  >
                                    {label}
                                  </Label>
                                </div>
                              ))}
                               {item.pickerAction === 'false' &&
                                <div>
                                   <label className="form-label">Comment</label>
                                   <input type="text" className="form-control" placeholder="Enter Comment" value={item.pickerComment}
                                  onChange={(e) => {
                                  setPickerComment(item, e.target.value);
                                  }} />
                                </div>
                               }
                              </td>
                            }
                            {(user.inventoryRole === 'shippingUser'  || user.inventoryRole === 'adminUser') &&
                             <td>
                              <label className="form-label">Did you find Product ?</label>
                              {actions.map(({ label, value }, index) => (
                                <div className='form-check me-2' key={index}>
                                  <Input
                                    type='radio'
                                    id={`${label}`}
                                    value={value}
                                    checked={item.shipperAction === value}
                                    name={`${item.name} shipper`}
                                    onChange={(e) => {
                                      setShipperAction(item, e.target.value);
                                    }}
                                  />
                                  <Label
                                    className='d-flex form-check-label'
                                    for={`${label}`}
                                  >
                                    {label}
                                  </Label>
                                </div>
                              ))}
                               {item.shipperAction === 'false' &&
                                <div>
                                   <label className="form-label">Comment</label>
                                   <input type="text" className="form-control" placeholder="Enter Comment" value={item.shipperComment}
                                  onChange={(e) => {
                                  setShipperComment(item, e.target.value);
                                  }} />
                                </div>
                               }
                              </td>
                            }
                           {(user.inventoryRole !== 'pickerUser' && user.inventoryRole !== 'shippingUser') &&
                             <>
                             <td>$ {item.price}</td>
                             <td>{`$ ${item.subtotal_tax ? item.subtotal_tax : 0}`}</td>
                             <td>{`$ ${item.subtotal ? item.subtotal : 0}`}</td>
                             </>
                           }
                        </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              {(user.inventoryRole !== 'pickerUser' && user.inventoryRole !== 'shippingUser') &&
                <div className="offset-md-9 col-md-3 mt-4">
                  <table className="table table-striped table-sm">
                    <tbody>
                      <tr><td className="bold">Tax</td><td>$ {orderDetail.total_tax}</td></tr>
                      <tr><td><span className="font-weight-bold">Grand Total</span></td><td><span className="font-weight-bold">{`$ ${orderDetail.total ? orderDetail.total : 0}`}</span></td></tr>
                    </tbody>
                  </table>
                </div>
              }
              <div className="online-order-status-button">
                {(user.inventoryRole === 'pickerUser' || user.inventoryRole === 'adminUser' || user.inventoryRole === 'shippingUser') &&
                    <SaveButton
                      width='auto'
                      loading={updateStatusLoading}
                      name={statusButton.label}
                      className='mt-2 text-align-center'
                      onClick={() => { submitOrderStatus() }}
                    >
                  </SaveButton>
                }
              </div>
            </CardBody>
          </Card>
        </>
        )}
   </>
  )
}

export default OnlineOrderDetails