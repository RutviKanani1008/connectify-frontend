// ** React Imports
import { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';

// ** Reactstrap Imports
import { Col, Row, Spinner, Table } from 'reactstrap';

// ** Components
import DateFormat from '../../../../../components/DateFormate';

// ** hooks **
import { useGetInvoice } from '../hooks/invoiceApis';

// ** Styles
import '@styles/base/pages/app-invoice-print.scss';

// **others
import { logger } from '../../../../../utility/Utils';
import {
  calculateInvoiceGrandTotal,
  calculateInvoiceProductPriceTotal,
} from '../../Quote/helper';
import { getCurrentUser } from '../../../../../helper/user.helper';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const InvoicePrint = () => {
  const user = getCurrentUser();
  // ** HooksVars
  const { id } = useParams();

  // ** States
  const [data, setData] = useState(null);

  // ** custom Hooks **
  const { getInvoice, isLoading: getInvoiceLoading } = useGetInvoice();

  useEffect(() => {
    getInvoiceDetail();
  }, []);

  const getInvoiceDetail = async () => {
    try {
      const { data, error } = await getInvoice(id);
      if (!error) {
        setData(data);
      }
    } catch (error) {
      logger(error);
    }
  };

  useEffect(() => {
    if (data) {
      setTimeout(() => window.print(), 1000);
    }
  }, [data]);

  return getInvoiceLoading ? (
    <div className='blank-layout-spinner'>
      <Spinner />
    </div>
  ) : (
    <div className='invoice-print p-3 invoice-preview-card-wp'>
      {data && (
        <>
          {/* Header */}
          <div className='d-flex justify-content-between flex-md-row flex-column pb-2'>
            <div>
              <div className='logo-wrapper'>
                <img
                  className='company-logo'
                  src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${user.company.companyLogo}`}
                />
                <h3 className='text-primary invoice-logo'>
                  {user.company.name}
                </h3>
              </div>
              <p className='mb-25'>{user.company.address1}</p>
              <p className='mb-25'>{user.company.address2}</p>
              <p className='mb-0'>{user.company.phone}</p>
            </div>
            <div className='mt-md-0 mt-2'>
              <h4 className='invoice-title'>
                Invoice{' '}
                <span className='invoice-number'>#{data.invoiceId}</span>
              </h4>
              <div className='invoice-date-wrapper'>
                <p className='invoice-date-title'>Date:</p>
                <p className='invoice-date'>
                  <DateFormat date={data.invoiceDate} format='DD MMM YYYY' />
                </p>
              </div>
              <div className='invoice-date-wrapper'>
                <p className='invoice-date-title'>Expiry Date:</p>
                <p className='invoice-date'>
                  <DateFormat date={data.expiryDate} format='DD MMM YYYY' />
                </p>
              </div>
            </div>
          </div>
          {/* /Header */}

          <hr className='my-2' />

          {/* Address and Contact */}
          <Row className='pb-2'>
            <Col sm='6'>
              <h6 className='mb-1'>Invoice To:</h6>
              <p className='mb-25'>
                {data.customer.firstName || data.customer.lastName
                  ? `${data.customer.firstName} ${data.customer.lastName}`
                  : '-'}
              </p>
              {data.customer.phone && (
                <p className='mb-25'>{data.customer.phone}</p>
              )}
              <p className='mb-0'>{data.customer.customer}</p>
            </Col>
          </Row>
          {/* /Address and Contact */}

          {/* Invoice Description */}
          <Table className='mt-2 mb-0' responsive>
            <thead>
              <tr>
                <th className='py-1 first-col'>Products</th>
                <th className='py-1'>Price</th>
                <th className='py-1'>Qty</th>
                <th className='py-1'>Installment Charges</th>
                <th className='py-1'>Tax</th>
                <th className='py-1'>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.productDetails.map((obj, index1) => {
                const productPrice = `${
                  (Number(obj?.price) ? Number(obj?.price) : 0) *
                  (Number(obj?.quantity) ? Number(obj?.quantity) : 0)
                }`;

                const totalChanges = `${
                  Number(obj?.installmentCharge) &&
                  Number(obj?.price) &&
                  obj?.installmentChargesType
                    ? obj?.installmentChargesType === 'percentage'
                      ? Number?.(
                          (Number(obj?.price) *
                            Number(obj?.installmentCharge)) /
                            100
                        )?.toFixed(2)
                      : obj?.installmentChargesType === 'doller'
                      ? Number(obj?.installmentCharge)?.toFixed(2)
                      : 0
                    : 0
                }`;

                const charges = `${
                  obj?.chargesType && obj?.chargesType === 'percentage'
                    ? Number(
                        ((Number(productPrice) + Number(totalChanges)) *
                          Number(obj?.charges)) /
                          100
                      ).toFixed(2)
                    : obj?.chargesType === 'fixed'
                    ? Number(obj?.charges).toFixed(2)
                    : 0
                }`;
                return (
                  <Fragment key={index1}>
                    <tr>
                      <td className='py-1  first-col'>
                        <p className='card-text fw-bold mb-25'>
                          {obj.product.name}
                        </p>
                        <p className='card-text'>{obj.description}</p>
                      </td>
                      <td className='py-1'>
                        <span className='fw-bold'>${obj.price}</span>
                      </td>
                      <td className='py-1'>
                        <span className='fw-bold'>{obj.quantity}</span>
                      </td>
                      <td className='py-1'>
                        <span className='fw-bold'>
                          {obj.installmentCharge
                            ? obj.installmentChargesType === 'doller'
                              ? `$${obj.installmentCharge}`
                              : `${obj.installmentCharge}%`
                            : '-'}
                        </span>
                      </td>
                      <td className='py-1'>
                        <span className='fw-bold'>
                          {Number(charges) ? Number(charges) : '-'}
                        </span>
                      </td>
                      <td className='py-1'>
                        <span className='fw-bold'>
                          ${calculateInvoiceProductPriceTotal(obj)}
                        </span>
                      </td>
                    </tr>
                    {obj.installments.length ? (
                      <tr className='border-bottom'>
                        <td className='py-1 first-col' colSpan={1}>
                          <h4 className='card-text fw-bold mb-25'>
                            Installments
                          </h4>
                        </td>
                        <td className='py-1' colSpan={6}>
                          <table
                            style={{ width: '100%' }}
                            className='inner-table'
                          >
                            <thead>
                              <tr>
                                <th className='py-1'>Percentage</th>
                                <th className='py-1'>Amount</th>
                                <th className='py-1'>Due Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {obj.installments.map((installment, index2) => {
                                return (
                                  <Fragment key={index2}>
                                    <tr>
                                      <td className='py-1'>
                                        <span className='fw-bold'>
                                          {installment.percentage}%
                                        </span>
                                      </td>
                                      <td className='py-1'>
                                        <span className='fw-bold'>
                                          ${installment.amount}
                                        </span>
                                      </td>
                                      <td className='py-1'>
                                        <span className='fw-bold'>
                                          <DateFormat
                                            date={installment.dueDate}
                                            format='DD MMM YYYY'
                                          />
                                        </span>
                                      </td>
                                    </tr>
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ) : (
                      <></>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </Table>

          {/* Total & Sales Person */}
          <Row className='invoice-sales-total-wrapper mt-3 d-flex justify-content-end'>
            <Col
              className='d-flex justify-content-end pe-3'
              md='6'
              order={{ md: 2, lg: 1 }}
            >
              <div className='invoice-total-wrapper'>
                <div className='invoice-total-item'>
                  <p className='invoice-total-title'>Subtotal:</p>
                  <p className='invoice-total-amount'>
                    ${calculateInvoiceGrandTotal(data.productDetails)}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
          {/* /Total & Sales Person */}
          <hr className='my-2' />
          <Row>
            <Col sm='12'>
              <span className='fw-bold'>Note:</span>
              {/* REVIEW - STYLE */}
              {data.termsAndCondition ? (
                <SyncfusionRichTextEditor
                  key={`invoice_tnc`}
                  enabled={false}
                  value={data.termsAndCondition}
                  toolbarSettings={{ enable: false }}
                />
              ) : (
                <></>
              )}
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default InvoicePrint;
