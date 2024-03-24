// ** Reactstrap Imports
import { Fragment } from 'react';
import { Card, CardBody, CardText, Row, Col, Table } from 'reactstrap';
import DateFormat from '../../../../../components/DateFormate';
import {
  calculateInvoiceGrandTotal,
  calculateInvoiceProductPriceTotal,
} from '../helper';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const QuotePreviewCard = ({ data }) => {
  return (
    <Card className='invoice-preview-card invoice-preview-card-wp'>
      <CardBody className='invoice-padding pb-0'>
        {/* Header */}
        <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
          <div>
            <div className='logo-wrapper'>
              <img
                className='company-logo'
                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data.company.companyLogo}`}
              />
              <h3 className='text-primary invoice-logo'>{data.company.name}</h3>
            </div>
            <CardText className='mb-25'>{data.company.address1}</CardText>
            <CardText className='mb-25'>{data.company.address2}</CardText>
            <CardText className='mb-0'>{data.company.phone}</CardText>
          </div>
          <div className='mt-md-0 mt-2'>
            <h4 className='invoice-title'>
              Quote <span className='invoice-number'>#{data.quoteId}</span>
            </h4>
            <div className='invoice-date-wrapper'>
              <p className='invoice-date-title'>Date:</p>
              <p className='invoice-date'>
                <DateFormat date={data.quoteDate} format='DD MMM YYYY' />
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
      </CardBody>

      <hr className='invoice-spacing' />

      {/* Address and Contact */}
      <CardBody className='invoice-padding pt-0'>
        <Row className='invoice-spacing'>
          <Col className='p-0' xl='8'>
            <h6 className='mb-2'>Invoice To:</h6>
            <h6 className='mb-25'>
              {data.customer.firstName || data.customer.lastName
                ? `${data.customer.firstName} ${data.customer.lastName}`
                : '-'}
            </h6>
            {data.customer.phone && (
              <CardText className='mb-25'>{data.customer.phone}</CardText>
            )}
            <CardText className='mb-0'>{data.customer.customer}</CardText>
          </Col>
        </Row>
      </CardBody>
      {/* /Address and Contact */}

      {/* Invoice Description */}
      <Table responsive className='invoice-data-table-wp'>
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
                      (Number(obj?.price) * Number(obj?.installmentCharge)) /
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
                      $
                      {calculateInvoiceProductPriceTotal(obj) + Number(charges)}
                    </span>
                  </td>
                </tr>
                {obj.installments.length ? (
                  <tr className='border-bottom'>
                    <td className='py-1 first-col' colSpan={1}>
                      <h4 className='card-text fw-bold mb-25'>Installments</h4>
                    </td>
                    <td className='py-1' colSpan={6}>
                      <table style={{ width: '100%' }} className='inner-table'>
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

      {/* /Invoice Description */}

      {/* Total & Sales Person */}
      <CardBody className='invoice-padding pb-0'>
        <Row className='invoice-sales-total-wrapper'>
          <Col
            className='d-flex justify-content-end'
            md='12'
            order={{ md: 2, lg: 1 }}
          >
            <div className='invoice-total-wrapper'>
              <div className='invoice-total-item'>
                <p className='invoice-total-title'>Total:</p>
                <p className='invoice-total-amount'>
                  ${calculateInvoiceGrandTotal(data.productDetails)}
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
      {/* /Total & Sales Person */}

      <hr className='invoice-spacing' />

      {/* Invoice Note */}
      <CardBody className='invoice-padding pt-0'>
        <Row className='mb-1'>
          <Col sm='12'>
            <span className='fw-bold d-block mb-1'>Note: </span>
            <span className='d-block'>{data.description}</span>
          </Col>
        </Row>
        <Row>
          <Col sm='12'>
            <span className='fw-bold'>Terms & Condition: </span>
            {/* REVIEW - STYLE */}
            {data.termsAndCondition ? (
              <SyncfusionRichTextEditor
                key={`preview_quote_tnc`}
                enabled={false}
                value={data.termsAndCondition}
                toolbarSettings={{ enable: false }}
              />
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </CardBody>
      {/* /Invoice Note */}
    </Card>
  );
};

export default QuotePreviewCard;
