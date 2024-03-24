import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, CardTitle, Spinner, UncontrolledTooltip } from "reactstrap"
import { useGetOfflineOrder } from "../hooks/InventoryOfflineOrderApi";

const OfflineOrderDetails = () => {
  const history = useHistory();
  const params = useParams();
  const [orderDetail, setOrderDetail] = useState({});
  const { getOrder, isLoading: getOrderLoading } = useGetOfflineOrder();

  useEffect(async () => {
    getOrderDetails();
  }, [params.id]);


  const getOrderDetails = async () => {
    const { data, error } = await getOrder(params.id);
    if (!error) {
      const orderDetails = data;
      setOrderDetail(orderDetails);  
    }
  };


  return (
    <>
      {getOrderLoading ? (
          <div className='d-flex align-items-center justify-content-center loader'>
            <Spinner />
          </div>
        ) : (
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
                    OfflineOrder Details
                  </h4>
                </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="row mt-5">
                <div className="mb-4 col-sm-12 col-md-4 col-lg-4">
                  <h5 className="font-weight-bold">Customer Info</h5>
                  <div>{ orderDetail.customerDetails?.name}</div>
                  <div>{ orderDetail.customerDetails?.email}</div>
                  <div>{ orderDetail.customerDetails?.phone}</div>
                </div>
                <div className="mb-4 col-sm-12 col-md-4 col-lg-4">
                  <h5 className="font-weight-bold">Shipping Info</h5>
                  <div>{orderDetail.shippingDetails?.address1},</div>
                  <div>{orderDetail.shippingDetails?.address2}</div>
                  <div>{orderDetail.shippingDetails?.city },{orderDetail.shippingDetails?.state}</div>
                  <div>{orderDetail.shippingDetails?.country }</div>
                </div>
                <div className="mb-4 col-sm-12 col-md-4 col-lg-4">
                  <h5 className="font-weight-bold">Order Info</h5>
                  <div>Order Number : {orderDetail.orderNumber}</div>
                  <div>
                    Status : <span>{orderDetail.orderDetails?.orderStatus?.label}</span></div>
                   <div>
                    Payment Status : <span>{orderDetail.paymentDetails?.paymentStatus?.label}</span>
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
                        <th scope="col">Net Unit Cost</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Discount</th>
                        <th scope="col">Subtotal</th>
                        <th scope="col" className="text-center"></th>
                      </tr>
                    </thead>
                  <tbody>
                    {orderDetail.orderDetails && orderDetail.orderDetails.orderItems.length > 0 && 
                       orderDetail.orderDetails.orderItems.map((item, index) => (       
                          <tr key = {index}>
                            <td>{ index + 1}</td>
                          <td>
                              <span>{item.title}</span>
                          </td>
                          <td>$ {item.price}</td>
                          <td>
                            <div className="product-qty">
                            {item.purchaseQty}
                            </div>
                          </td>
                          <td>{ `$ ${item.salePrice ? (item.price - item.salePrice) : 0}`}</td>
                          <td>{`$ ${item.purchaseTotal ? item.purchaseTotal : 0}`}</td>
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
                      <tr><td><span className="font-weight-bold">Grand Total</span></td><td><span className="font-weight-bold">{ `$ ${orderDetail.totalAmount ? orderDetail.totalAmount : 0}`}</span></td></tr>
                    </tbody>
                  </table>
                </div>
            </CardBody>
          </Card>
        )}
   </>
  )
}

export default OfflineOrderDetails