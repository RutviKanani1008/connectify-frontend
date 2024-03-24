/* eslint-disable no-unreachable */
// ==================== Packages =======================
import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
// ====================================================
import '@src/assets/scss/payment-card.scss';
import PaymentCard from './components/PaymentCard';
import {
  useGetPaymentMethodsByContactId,
  useMakeDefaultPaymentMethod,
  useRemovePaymentMethods,
} from './service/paymentMethod.services';
import { SaveButton } from '../../../../@core/components/save-button';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { ArrowLeft } from 'react-feather';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import UILoader from '@components/ui-loader';

const PaymentMethods = () => {
  // ========================== Hooks =================================
  const params = useParams();
  const history = useHistory();
  const user = useSelector(userData);

  // ========================== states ================================
  const [removedIds, setRemovedIds] = useState([]);

  // ========================== Custom Hooks ==========================
  // ** Custom Hooks **
  const { makeDefaultPaymentMethod, isLoading: makingPaymentMethodDefault } =
    useMakeDefaultPaymentMethod();
  const {
    getPaymentMethodsByContactId,
    setPaymentMethods,
    paymentMethods,
    isLoading,
  } = useGetPaymentMethodsByContactId();
  const { removePaymentMethodsService, isLoading: removeLoading } =
    useRemovePaymentMethods();
  const { basicRoute } = useGetBasicRoute();

  useEffect(() => {
    if (params.id) {
      getPaymentMethodsByContactId(params.id);
    }
  }, [params.id]);

  const removeCard = (id) => {
    setRemovedIds([...removedIds, id]);
    setPaymentMethods(
      paymentMethods.filter((obj) => obj.paymentMethodId !== id)
    );
  };

  const removePaymentMethods = async () => {
    const { error } = await removePaymentMethodsService(removedIds);
    if (!error) {
      history.push(`${basicRoute}/billing-profiles`);
    }
  };

  return (
    <UILoader blocking={isLoading || makingPaymentMethodDefault}>
      <Card>
        <div className='payment-methods-wp'>
          <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start'>
            <div className='d-flex  align-items-center'>
              <CardTitle tag='h4' className='text-primary item-table-title'>
                <div className='d-flex'>
                  <>
                    <div className='pe-1'>
                      <UncontrolledTooltip placement='top' target={`goback`}>
                        Go Back
                      </UncontrolledTooltip>
                      <ArrowLeft
                        color='#a3db59'
                        onClick={() => {
                          if (user.role === 'superadmin') {
                            history.push('/company/billing-profiles');
                          } else {
                            history.push(`${basicRoute}/billing-profiles`);
                          }
                        }}
                        className='cursor-pointer'
                        id={'goback'}
                      />
                    </div>
                  </>
                  Payment Methods
                </div>
              </CardTitle>
            </div>
            <div className='d-flex mt-md-0 mt-1'>
              <div>
                <>
                  {((paymentMethods && paymentMethods.length > 0) ||
                    removedIds.length > 0) && (
                    <SaveButton
                      className='ms-2'
                      width='150px'
                      onClick={() => removePaymentMethods()}
                      disabled={removeLoading}
                      loading={removeLoading}
                      type='submit'
                      name='Save Changes'
                    />
                  )}
                </>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {paymentMethods.length ? (
              <Row>
                {paymentMethods.map((paymentMethod, index) => (
                  <Col className='mb-2' sm='6' xl='3' md='4' key={index}>
                    <PaymentCard
                      makeDefaultPaymentMethod={makeDefaultPaymentMethod}
                      paymentMethod={paymentMethod}
                      removeCard={removeCard}
                      setPaymentMethods={setPaymentMethods}
                      paymentMethods={paymentMethods}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              !isLoading && (
                <Row className='d-flex justify-content-center'>
                  <h4 className='text-center'>No Cards Found!</h4>
                </Row>
              )
            )}
          </CardBody>
        </div>
      </Card>
    </UILoader>
  );
};

export default PaymentMethods;
