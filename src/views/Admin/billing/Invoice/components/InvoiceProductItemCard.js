// ** Packages
import {
  Button,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Label,
  Row,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import moment from 'moment';

// ** Custom Components
import { FormField } from '@components/form-fields';

// ** constant
import {
  BILLING_END_TYPE,
  BILLING_RECURRING_SCHEDULE,
  INSTALLMENT_CHARGES_TYPE,
  PAYMENT_MODE,
  PAYMENT_OPTION,
  PAYMENT_TYPE,
  PRODUCT_CHARGES_TYPE,
  PRODUCT_TYPE,
} from '../../../../../constant';
import { useWatch } from 'react-hook-form';
import CustomDatePicker from '../../../../../@core/components/form-fields/CustomDatePicker';
import EventDays from '../../../event/components/EventDays';
import noImage from '../../../../../assets/images/blank/no-image.png';
import InvoiceInstallments from './InvoiceInstallments';
import { Info } from 'react-feather';

const InvoiceProductItemCard = ({
  products,
  getValues,
  control,
  errors,
  productOptions,
  remove,
  setValue,
  disabled,
  clearErrors,
}) => {
  // ** Hooks
  const productDetails = useWatch({
    control,
    name: `productDetails`,
  });

  const addQuantity = (index) => {
    let tempProductDetails = JSON.parse(JSON.stringify(productDetails));
    tempProductDetails = tempProductDetails.find(
      (product, productIndex) => productIndex === index
    );
    tempProductDetails.quantity = tempProductDetails.quantity + 1;
    setValue(`productDetails[${index}]`, tempProductDetails);
  };

  const removeQuantity = (index) => {
    let tempProductDetails = JSON.parse(JSON.stringify(productDetails));
    tempProductDetails = tempProductDetails.find(
      (product, productIndex) => productIndex === index
    );
    if (tempProductDetails.quantity > 0) {
      tempProductDetails.quantity = tempProductDetails.quantity - 1;
      setValue(`productDetails[${index}]`, tempProductDetails);
    }
  };

  const setProductDetails = (e, index) => {
    setValue(`productDetails[${index}].description`, e.description);
    setValue(
      `productDetails[${index}].price`,
      Number(e.price) ? e.price : undefined
    );
    setValue(`productDetails[${index}].totalInstallments`, 0);
  };

  return products.map((item, index) => {
    const productPrice = `${
      (Number(productDetails?.[index]?.price)
        ? Number(productDetails?.[index]?.price)
        : 0) *
      (Number(productDetails?.[index]?.quantity)
        ? Number(productDetails?.[index]?.quantity)
        : 0)
    }`;

    const totalChanges = `${
      Number(productDetails?.[index]?.installmentCharge) &&
      Number(productDetails?.[index]?.price) &&
      productDetails?.[index]?.installmentChargesType
        ? productDetails?.[index]?.installmentChargesType === 'percentage'
          ? Number?.(
              (Number(productDetails?.[index]?.price) *
                Number(productDetails?.[index]?.installmentCharge)) /
                100
            )?.toFixed(2)
          : productDetails?.[index]?.installmentChargesType === 'doller'
          ? Number(productDetails?.[index]?.installmentCharge)?.toFixed(2)
          : 0
        : 0
    }`;

    const charges = `${
      productDetails?.[index]?.chargesType?.value &&
      productDetails?.[index]?.chargesType?.value === 'percentage'
        ? Number(
            ((Number(productPrice) + Number(totalChanges)) *
              Number(productDetails?.[index]?.charges)) /
              100
          ).toFixed(2)
        : productDetails?.[index]?.chargesType?.value === 'fixed'
        ? Number(productDetails?.[index]?.charges).toFixed(2)
        : 0
    }`;

    const dueDate = useWatch({
      control,
      name: `dueDate`,
    });
    return (
      <Card key={item.id} className='quote-card-wp'>
        <CardBody>
          <Row>
            <Col sm='12' lg='8' md='8'>
              <Row>
                <Col sm='12' lg='6' md='6' className='d-flex'>
                  <div className='profile-img-container d-flex align-items-center'>
                    <div className='profile-img'>
                      <img
                        className='rounded img-fluid quote-pro-img'
                        src={noImage}
                        alt='Card image'
                      />
                    </div>
                  </div>
                  <div className='w-100 ms-1'>
                    <Label for='note' className='form-label fw-bold'>
                      Product:
                    </Label>
                    <FormField
                      key={`productDetails[${index}].product`}
                      name={`productDetails[${index}].product`}
                      placeholder='Select Product'
                      type='select'
                      errors={errors}
                      control={control}
                      options={productOptions.filter(
                        (p) => p.type === productDetails?.[index]?.productType
                      )}
                      onChange={(e) => {
                        setProductDetails(e, index);
                      }}
                      disabled={disabled}
                    />
                    {errors['productDetails']?.[index]?.product?.message ? (
                      <div className='text-danger'>
                        {errors['productDetails'][index].product.message}
                      </div>
                    ) : null}
                  </div>
                </Col>
                <Col sm='12' lg='6' md='6'>
                  <Label for='note' className='form-label fw-bold'>
                    Product Type:
                  </Label>
                  <FormField
                    name={`productDetails[${index}].productType`}
                    key={`productDetails[${index}].productType`}
                    options={PRODUCT_TYPE}
                    type='radio'
                    errors={errors}
                    control={control}
                    isMulti={'true'}
                    onChange={() => {
                      setValue(`productDetails[${index}].product`, '');
                    }}
                    defaultValue={
                      getValues(`productDetails[${index}].productType`) ||
                      'OneTime'
                    }
                    disabled={disabled}
                  />
                </Col>
              </Row>
              {getValues(`productDetails[${index}].product`) && (
                <>
                  <Row>
                    <Col sm='12' lg='6' md='6'>
                      <div className='item-name mt-1'>
                        <Label for='note' className='form-label fw-bold'>
                          Payment Options:
                        </Label>
                        <FormField
                          name={`productDetails[${index}].paymentOption`}
                          key={`productDetails[${index}].paymentOption`}
                          options={PAYMENT_OPTION}
                          type='radio'
                          errors={errors}
                          control={control}
                          isMulti={'true'}
                          defaultValue={
                            getValues(
                              `productDetails[${index}].paymentOption`
                            ) || 'Online'
                          }
                          disabled={disabled}
                        />
                      </div>
                    </Col>
                    {productDetails?.[index]?.['productType'] === 'one-time' &&
                      productDetails?.[index]?.['paymentOption'] ===
                        'Online' && (
                        <Col sm='12' lg='6' md='6'>
                          <div className='item-name mt-1'>
                            <Label for='note' className='form-label fw-bold'>
                              Payment Type:
                            </Label>
                            <FormField
                              name={`productDetails[${index}].paymentType`}
                              key={`productDetails[${index}].paymentType`}
                              options={PAYMENT_TYPE}
                              type='radio'
                              errors={errors}
                              control={control}
                              isMulti={'true'}
                              disabled={disabled}
                              defaultValue={
                                getValues(
                                  `productDetails[${index}].paymentType`
                                ) || 'fullPayment'
                              }
                              onChange={(e) => {
                                if (e.target.value === 'fullPayment') {
                                  setValue(
                                    `productDetails[${index}].installmentChargesType`,
                                    'percentage'
                                  );
                                  setValue(
                                    `productDetails[${index}].totalInstallments`,
                                    0
                                  );
                                  setValue(
                                    `productDetails[${index}].installmentCharge`,
                                    0
                                  );
                                } else {
                                  setValue(
                                    `productDetails[${index}].installmentChargesType`,
                                    'percentage'
                                  );
                                }
                              }}
                            />
                          </div>
                        </Col>
                      )}
                  </Row>
                  <Row>
                    {productDetails?.[index]?.['paymentOption'] ===
                      'Online' && (
                      <Col sm='12' lg='6' md='6'>
                        <div className='item-name mt-1'>
                          <Label for='note' className='form-label fw-bold'>
                            Payment Mode:
                          </Label>
                          <FormField
                            name={`productDetails[${index}].paymentMode`}
                            key={`productDetails[${index}].paymentMode`}
                            options={PAYMENT_MODE}
                            type='radio'
                            errors={errors}
                            control={control}
                            isMulti={'true'}
                            defaultValue={
                              getValues(
                                `productDetails[${index}].paymentMode`
                              ) || 'Manual'
                            }
                            disabled={disabled}
                          />
                        </div>
                      </Col>
                    )}
                    {productDetails?.[index]?.['paymentType'] ===
                      'installment' &&
                      productDetails?.[index]?.['productType'] ===
                        'one-time' && (
                        <Col sm='12' lg='6' md='6'>
                          <div className='item-name mt-1'>
                            <Label for='note' className='form-label fw-bold'>
                              Charges in
                            </Label>
                            <FormField
                              name={`productDetails[${index}].installmentChargesType`}
                              key={`productDetails[${index}].installmentChargesType`}
                              options={INSTALLMENT_CHARGES_TYPE}
                              type='radio'
                              errors={errors}
                              control={control}
                              defaultValue={
                                getValues(
                                  `productDetails[${index}].installmentChargesType`
                                ) || 'doller'
                              }
                              disabled={disabled}
                              onChange={(e) => {
                                if (
                                  e.target.value === 'percentage' &&
                                  Number?.(
                                    getValues(
                                      `productDetails[${index}].installmentCharge`
                                    )
                                  ) > 100
                                ) {
                                  setValue(
                                    `productDetails[${index}].installmentCharge`,
                                    1
                                  );
                                }
                              }}
                            />
                          </div>
                        </Col>
                      )}
                  </Row>
                  <Row className='d-flex'>
                    {productDetails?.[index]?.['paymentType'] ===
                      'installment' &&
                      productDetails?.[index]?.['productType'] ===
                        'one-time' && (
                        <>
                          <Col sm='12' lg='6' md='6'>
                            <div className='item-name mt-1'>
                              <Label for='note' className='form-label fw-bold'>
                                Select number of installment (Max limit 12)
                              </Label>
                              <FormField
                                name={`productDetails[${index}].totalInstallments`}
                                key={`productDetails[${index}].totalInstallments`}
                                type='number'
                                errors={errors}
                                control={control}
                                defaultValue={
                                  getValues(
                                    `productDetails[${index}].totalInstallments`
                                  ) || 0
                                }
                                disabled={disabled}
                                onChange={(e) => {
                                  if (0 > Number(e.target.value)) {
                                    setValue(
                                      `productDetails[${index}].totalInstallments`,
                                      '0'
                                    );
                                  } else if (12 < Number(e.target.value)) {
                                    setValue(
                                      `productDetails[${index}].totalInstallments`,
                                      '12'
                                    );
                                  }
                                }}
                              />
                              {errors['productDetails']?.[index]
                                ?.totalInstallments?.message ? (
                                <div className='text-danger'>
                                  {
                                    errors['productDetails'][index]
                                      .totalInstallments.message
                                  }
                                </div>
                              ) : null}
                            </div>
                          </Col>
                          <Col sm='12' lg='6' md='6'>
                            <div className='item-name mt-1'>
                              <Label for='note' className='form-label fw-bold'>
                                Installment Charges
                              </Label>
                              <FormField
                                name={`productDetails[${index}].installmentCharge`}
                                key={`productDetails[${index}].installmentCharge`}
                                type='number'
                                errors={errors}
                                control={control}
                                defaultValue={
                                  getValues(
                                    `productDetails[${index}].installmentCharge`
                                  ) || 0
                                }
                                disabled={disabled}
                                onChange={(e) => {
                                  if (0 > Number(e.target.value)) {
                                    setValue(
                                      `productDetails[${index}].installmentCharge`,
                                      '0'
                                    );
                                  } else if (
                                    Number(e.target.value) > 100 &&
                                    getValues(
                                      `productDetails[${index}].installmentChargesType`
                                    ) === 'percentage'
                                  ) {
                                    setValue(
                                      `productDetails[${index}].installmentCharge`,
                                      100
                                    );
                                  }
                                }}
                              />
                            </div>
                          </Col>
                        </>
                      )}
                  </Row>
                  <div>
                    {productDetails?.[index]?.['paymentType'] ===
                      'installment' && (
                      <InvoiceInstallments
                        clearErrors={clearErrors}
                        installmentCount={
                          productDetails[index]?.totalInstallments > 0
                            ? productDetails[index]?.totalInstallments
                            : '0'
                        }
                        installmentCharge={
                          productDetails[index]?.installmentCharge
                        }
                        installmentChargesType={
                          productDetails[index]?.installmentChargesType
                        }
                        productPrice={
                          Number(productDetails?.[index]?.price)
                            ? Number(productDetails?.[index]?.price)
                            : 0
                        }
                        productQuantity={
                          Number(productDetails?.[index]?.quantity)
                            ? Number(productDetails?.[index]?.quantity)
                            : 0
                        }
                        productCharges={Number(charges)}
                        control={control}
                        nestIndex={index}
                        getValues={getValues}
                        setValue={setValue}
                        errors={errors}
                        disabled={disabled}
                      />
                    )}
                  </div>
                  {productDetails?.[index]?.['productType'] === 'recurring' && (
                    <>
                      <Row>
                        <Col lg='6' md='6' sm='12' className='mt-1'>
                          <Label for='note' className='form-label fw-bold'>
                            Start Date:
                          </Label>
                          <UncontrolledTooltip
                            placement='top'
                            target={`startDate-${index}`}
                          >
                            Start date should be greater than invoice start
                            date.
                          </UncontrolledTooltip>
                          <Info
                            id={`startDate-${index}`}
                            className='ms-1'
                            height={15}
                            width={15}
                          />
                          <CustomDatePicker
                            disabled={disabled}
                            options={{
                              minDate: 'today',
                              static: false,
                              maxDate: dueDate ? new Date(dueDate) : null,
                            }}
                            errors={errors}
                            name={`productDetails[${index}].startDate`}
                            key={`productDetails[${index}].startDate`}
                            value={getValues(
                              `productDetails[${index}].startDate`
                            )}
                            onChange={(date) =>
                              setValue(
                                `productDetails[${index}].startDate`,
                                date[0]
                              )
                            }
                            enableTime={false}
                            dateFormat={'Y-m-d'}
                          />
                        </Col>
                        <Col lg='6' md='6' sm='12' className='mt-1'>
                          <Label for='note' className='form-label fw-bold'>
                            End:
                          </Label>
                          <FormField
                            disabled={disabled}
                            defaultValue={{
                              value: 'until',
                              label: 'Until',
                            }}
                            name={`productDetails[${index}].endType`}
                            key={`productDetails[${index}].endType`}
                            type='select'
                            errors={errors}
                            control={control}
                            options={BILLING_END_TYPE}
                          />
                        </Col>
                        {productDetails?.[index]?.endType?.value ===
                          'until' && (
                          <Col lg='6' md='6' sm='12' className='mt-1'>
                            <Label for='note' className='form-label fw-bold'>
                              Until Date:
                            </Label>
                            <UncontrolledTooltip
                              placement='top'
                              target={`dueDate-${index}`}
                            >
                              End date should be less than invoice end date.
                            </UncontrolledTooltip>
                            <Info
                              id={`dueDate-${index}`}
                              className='ms-1'
                              height={15}
                              width={15}
                            />
                            <CustomDatePicker
                              options={{
                                minDate: 'today',
                                static: false,
                                maxDate: dueDate ? new Date(dueDate) : null,
                              }}
                              disabled={disabled}
                              errors={errors}
                              name={`productDetails[${index}].untilDate`}
                              key={`productDetails[${index}].untilDate`}
                              value={getValues(
                                `productDetails[${index}].untilDate`
                              )}
                              onChange={(date) =>
                                setValue(
                                  `productDetails[${index}].untilDate`,
                                  date[0]
                                )
                              }
                              enableTime={false}
                              dateFormat={'Y-m-d'}
                            />
                          </Col>
                        )}
                        <Col lg='6' md='6' sm='12' className='mt-1'>
                          <Label for='note' className='form-label fw-bold'>
                            Schedule:
                          </Label>
                          <FormField
                            defaultValue={{
                              value: 'monthly',
                              label: 'Monthly',
                            }}
                            name={`productDetails[${index}].schedule`}
                            key={`productDetails[${index}].schedule`}
                            placeholder='Select Schedule'
                            type='select'
                            errors={errors}
                            control={control}
                            options={BILLING_RECURRING_SCHEDULE}
                            disabled={disabled}
                          />
                        </Col>
                        {productDetails?.[index]?.schedule?.value ===
                          'monthly' && (
                          <Col lg='6' md='6' sm='12' className='mt-1'>
                            <Label for='note' className='form-label fw-bold'>
                              Select Day For Month:
                            </Label>
                            <FormField
                              defaultValue={{
                                value: new Date().getDate(),
                                label: new Date().getDate(),
                              }}
                              name={`productDetails[${index}].monthDay`}
                              key={`productDetails[${index}].monthDay`}
                              placeholder='Select Day'
                              type='select'
                              errors={errors}
                              control={control}
                              disabled={disabled}
                              options={[...Array(moment().daysInMonth())].map(
                                (_, index) => ({
                                  value: index + 1,
                                  label: index + 1,
                                })
                              )}
                            />
                          </Col>
                        )}
                        {productDetails?.[index]?.schedule?.value ===
                          'yearly' && (
                          <Col lg='6' md='6' sm='12' className='mt-1'>
                            <Label for='note' className='form-label fw-bold'>
                              Select Date For Year:
                            </Label>
                            <CustomDatePicker
                              options={{ static: false }}
                              errors={errors}
                              name={`productDetails[${index}].yearDate`}
                              key={`productDetails[${index}].yearDate`}
                              value={getValues(
                                `productDetails[${index}].yearDate`
                              )}
                              disabled={disabled}
                              onChange={(date) =>
                                setValue(
                                  `productDetails[${index}].yearDate`,
                                  date[0]
                                )
                              }
                              enableTime={false}
                              dateFormat={'Y-m-d'}
                            />
                          </Col>
                        )}
                      </Row>
                      {productDetails?.[index]?.schedule?.value ===
                        'weekly' && (
                        <Row className='mt-1'>
                          <>
                            <Label for='note' className='form-label fw-bold'>
                              Repeat On:
                            </Label>
                            <EventDays
                              scheduleData={getValues(
                                `productDetails[${index}]`
                              )}
                              setScheduleData={(productDetails) => {
                                setValue(
                                  `productDetails[${index}].selectedDays`,
                                  productDetails.selectedDays
                                );
                              }}
                            />
                          </>
                        </Row>
                      )}
                    </>
                  )}
                </>
              )}
            </Col>
            <Col sm='12' lg='4' md='4'>
              <button
                onClick={() => {
                  remove(index);
                }}
                type='button'
                className={`billing__remove__item__btn btn-close ${
                  getValues(`productDetails`).length > 1
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed pointer-events-none'
                }`}
                aria-label='Close'
                // HELLO-D
                // fdprocessedid='n5chmm'
              ></button>
              <Row>
                <Col sm='6' lg='6' md='6'>
                  <div className='item-cost d-flex align-items-center justify-content-center'>
                    <h5 className='quantity-title me-50 mb-0'>Price</h5>
                    <div className='price-input'>
                      <FormField
                        disabled={disabled}
                        placeholder='price'
                        key={`productDetails[${index}].price`}
                        name={`productDetails[${index}].price`}
                        errors={errors}
                        control={control}
                      />
                    </div>
                    <h4 className='item-price ms-1 mb-0'>x</h4>
                    <h4 className='item-price ms-1 mb-0'>
                      {productDetails?.[index]?.quantity}
                    </h4>
                  </div>
                  {errors['productDetails']?.[index]?.price?.message ? (
                    <div className='text-danger ms-1'>
                      {errors['productDetails'][index].price.message}
                    </div>
                  ) : null}
                </Col>
                <Col sm='6' lg='6' md='6'>
                  <div className='item-quantity d-flex justify-content-center align-items-center'>
                    <h5 className='quantity-title me-50 mb-0'>Qty</h5>
                    <Button
                      className='qt-inc p-0 me-1'
                      color='primary'
                      disabled={disabled}
                      onClick={() => {
                        removeQuantity(index);
                      }}
                    >
                      -
                    </Button>
                    <div className='qt-input me-1'>
                      <FormField
                        key={`productDetails[${index}].quantity`}
                        name={`productDetails[${index}].quantity`}
                        errors={errors}
                        control={control}
                        defaultValue={1}
                        options={productOptions}
                        disabled={disabled}
                      />
                      {errors['productDetails']?.[index]?.quantity?.message ? (
                        <div className='text-danger ms-2'>
                          {errors['productDetails'][index].quantity.message}
                        </div>
                      ) : null}
                    </div>
                    <Button
                      className='qt-inc p-0'
                      color='primary'
                      disabled={disabled}
                      onClick={() => {
                        addQuantity(index);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </Col>
              </Row>

              <div className='item-options text-center'>
                <div className='item-wrapper mt-1'>
                  <div className='d-flex justify-content-between'>
                    <div className='detail-title'>Product Price</div>
                    <div className='detail-amt'>${productPrice}</div>
                  </div>
                  <div className='d-flex justify-content-between'>
                    <div className='detail-title'>Other Charges</div>
                    <div className='detail-amt'>${totalChanges}</div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-between'>
                    <div className='detail-title'>Sub Total</div>
                    <div className='detail-amt'>
                      $
                      {(Number(totalChanges) + Number(productPrice)).toFixed(2)}
                    </div>
                  </div>
                  <div className='d-flex justify-content-between'>
                    <div className='detail-title'>Tax</div>
                    <div className='tax__input__control'>
                      <UncontrolledButtonDropdown className='w-100'>
                        <DropdownToggle
                          className='w-100'
                          color='flat-primary tax__dropdown'
                          caret
                        >
                          {
                            getValues(`productDetails[${index}].chargesType`)
                              ?.label
                          }
                        </DropdownToggle>
                        <DropdownMenu>
                          {PRODUCT_CHARGES_TYPE.map((obj, chargesIndex) => (
                            <DropdownItem
                              className='w-100'
                              key={chargesIndex}
                              onClick={() => {
                                setValue(
                                  `productDetails[${index}].charges`,
                                  Number(0)
                                );
                                setValue(
                                  `productDetails[${index}].chargesType`,
                                  obj
                                );
                              }}
                            >
                              {obj.label}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                      <div className='d-flex align-items-center'>
                        <FormField
                          type='number'
                          placeholder='Tax'
                          key={`productDetails[${index}].charges`}
                          name={`productDetails[${index}].charges`}
                          errors={errors}
                          control={control}
                          disabled={disabled}
                        />
                        <span className='ms-1'>
                          {getValues(`productDetails[${index}].chargesType`)
                            ?.value === 'percentage'
                            ? '(%)'
                            : '($)'}
                        </span>
                      </div>
                    </div>
                    <div className='detail-amt'>${Number(charges)}</div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-between'>
                    <div className='detail-title fw-bolder'>Total Price</div>
                    <div className='detail-amt fw-bolder'>
                      $
                      {(
                        Number(totalChanges) +
                        Number(productPrice) +
                        Number(charges)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <div className='mt-1'>
            <Label for='note' className='form-label fw-bold'>
              Product description :
            </Label>
            <FormField
              disabled={disabled}
              name={`productDetails[${index}].description`}
              placeholder='Enter Description'
              type='textarea'
              errors={errors}
              control={control}
            />
          </div>
        </CardBody>
      </Card>
    );
  });
};

export default InvoiceProductItemCard;
