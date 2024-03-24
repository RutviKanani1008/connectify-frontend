// ==================== Packages =======================
import { Fragment, useEffect, useState } from 'react';
import { Plus, Hash } from 'react-feather';
import { useFieldArray } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import '@styles/base/pages/app-invoice.scss';
import '@styles/base/pages/app-ecommerce.scss';
import {
  Row,
  Col,
  Card,
  Input,
  Label,
  Button,
  CardBody,
  InputGroup,
  InputGroupText,
} from 'reactstrap';

// ====================================================
import { FormField } from '@components/form-fields';
import CustomDatePicker from '../../../../../@core/components/form-fields/CustomDatePicker';

import { getCurrentUser } from '../../../../../helper/user.helper';
import InvoiceProductItemCard from './InvoiceProductItemCard';
import { SaveButton } from '@components/save-button';
import { InvoiceAction } from './InvoiceActions';
import {
  paymentStatus,
  PRODUCT_CHARGES_TYPE,
  SEND_INVOICE_AFTER,
} from '../../../../../constant';
import AsyncContactSelect from '../../Quote/components/AsyncContactSelect';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const InvoiceStatus = ['draft', 'pending', 'paid', 'cancelled', 'expired'];
const invoiceStatusOptions = InvoiceStatus.map((q) => ({
  label: paymentStatus[q],
  value: q,
}));
const termsSaveOptions = [
  { label: 'Create new one', value: 'create' },
  { label: 'Update the existing one', value: 'update' },
  { label: 'No action', value: '' },
];

const AddInvoiceForm = ({
  errors,
  control,
  watch,
  getValues,
  clearErrors,
  setValue,
  currentCustomer,
  productOptions,
  initialInvoiceActions,
  termsTemplates,
  termsSaveType,
  setTermsSaveType,
  setDate,
  date,
  saveInvoice,
  saveLoading,
  sendInvoiceLoading,
}) => {
  const params = useParams();
  const user = getCurrentUser();
  const { fields, append, remove } = useFieldArray({
    control,
    shouldUnregister: true,
    name: 'productDetails',
  });

  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    if (
      (date?.dueDate &&
        params.id !== 'add' &&
        moment(date?.dueDate, 'DD.MM.YYYY').diff(moment(), 'day') < 0) ||
      isNaN(moment(date?.dueDate, 'DD.MM.YYYY').diff(moment(), 'day'))
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [date?.dueDate]);

  const termsTemplatesOptions = termsTemplates.map((t) => ({
    label: t.name,
    value: t._id,
  }));

  const showTerms = watch('showTerms');
  const termsAndCondition = watch(`termsAndCondition`);

  useEffect(() => {
    const currentTemp = termsTemplates.find(
      (t) => t.content === termsAndCondition
    );

    if (currentTemp) {
      setValue(
        `termsTemplate`,
        termsTemplatesOptions.find((t) => currentTemp._id === t.value)
      );
    }
  }, [termsAndCondition]);

  return (
    <Fragment>
      <Card className='invoice-preview-card invoice-form-wrapper'>
        {/* Header */}
        <CardBody className='invoice-padding pb-0'>
          <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
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
              <p className='card-text mb-25'>{user.company.address1}</p>
              <p className='card-text mb-25'>{user.company.address2}</p>
              <p className='card-text mb-0'>{user.company.phone}</p>
            </div>
            <div className='invoice-number-date mt-md-0 mt-2'>
              <div className='d-flex align-items-center justify-content-md-end mb-1'>
                <h4 className='invoice-title'>Invoice</h4>
                <InputGroup className='input-group-merge invoice-edit-input-group disabled'>
                  <InputGroupText>
                    <Hash size={15} />
                  </InputGroupText>
                  <Input
                    type='string'
                    className='invoice-edit-input'
                    value={getValues('invoiceId') || ''}
                    placeholder={getValues('invoiceId')}
                    disabled
                  />
                </InputGroup>
              </div>
              <div className='d-flex align-items-center mb-1'>
                <span className='title'>Date:</span>
                <CustomDatePicker
                  options={{
                    static: false,
                  }}
                  value={date.invoiceDate}
                  errors={errors}
                  className='form-control invoice-edit-input due-date-picker'
                  name='invoiceDate'
                  dateFormat='m-d-Y'
                  enableTime={false}
                  onChange={(invoiceDate) => {
                    setDate({ ...date, invoiceDate: invoiceDate[0] });
                    clearErrors('invoiceDate');
                    setValue('invoiceDate', invoiceDate[0]);
                  }}
                />
              </div>
              <div className='d-flex align-items-center mb-1'>
                <span className='title'>Due Date:</span>
                <CustomDatePicker
                  options={{
                    static: false,
                    minDate: date.invoiceDate,
                  }}
                  value={date.dueDate}
                  className='form-control invoice-edit-input due-date-picker'
                  errors={errors}
                  name='dueDate'
                  dateFormat='m-d-Y'
                  enableTime={false}
                  onChange={(dueDate) => {
                    setDate({ ...date, dueDate: dueDate[0] });
                    clearErrors('dueDate');
                    setValue('dueDate', dueDate[0]);
                  }}
                />
              </div>
              {params.id !== 'add' && (
                <div className='d-flex align-items-center invoice__header__form__field__wp'>
                  <span className='title'>Invoice Status:</span>
                  <FormField
                    name='status'
                    type='select'
                    errors={errors}
                    control={control}
                    options={invoiceStatusOptions}
                  />
                </div>
              )}
            </div>
          </div>
        </CardBody>
        {/* /Header */}
        <hr className='invoice-spacing' />
        {/* Address and Contact */}
        <CardBody className='invoice-padding pt-0 pb-0'>
          <Row className='row-bill-to invoice-spacing bill__invoice__to__info'>
            <Col
              sm='12'
              md='6'
              xl='4'
              className='bill__invoice__to__info__parent'
            >
              <div className='bill__invoice__to__info__child'>
                <h6 className=''>Quote To:</h6>
                <AsyncContactSelect
                  name='customer'
                  placeholder='Select Contact'
                  value={getValues('customer')}
                  onChange={(e) => setValue('customer', e)}
                />

                {errors['customer'] ? (
                  <div className='text-danger'>
                    {errors['customer'].value?.message}
                  </div>
                ) : null}

                {getValues('customer')?.isEnableBilling === false && (
                  <div className='text-warning'>
                    Billing profile will be enabled for this contact on
                    submitting the quote
                  </div>
                )}

                {/* <h6 className=''>Invoice To:</h6>
                <FormField
                  name='customer'
                  placeholder='Select Contact'
                  type='select'
                  errors={errors}
                  control={control}
                  options={customerOptions}
                  disabled={isDisabled}
                />
                {errors['customer'] ? (
                  <div className='text-danger'>
                    {errors['customer'].value?.message}
                  </div>
                ) : null}
                {getValues('customer')?.isEnableBilling === false && (
                  <div className='text-warning'>
                    Billing profile will be enabled for this contact on
                    submitting the invoice
                  </div>
                )} */}
              </div>
            </Col>

            <Col className='mt-1 mt-xl-0 mt-md-0' sm='12' md='6' xl='5'>
              <Label for='note' className='form-label fw-bold'>
                How many days before the due date should the customer receive
                the invoice ?
              </Label>
              <FormField
                name='sendInvoiceBefore'
                placeholder='Select days'
                type='select'
                errors={errors}
                control={control}
                options={SEND_INVOICE_AFTER}
                disabled={isDisabled}
              />
            </Col>
            <Col className='mt-1' sm='12' md='6' xl='3'>
              <FormField
                type='checkbox'
                errors={errors}
                control={control}
                name='sendInvoiceOnDueDate'
                defaultValue={getValues('sendInvoiceOnDueDate')}
                key={getValues('sendInvoiceOnDueDate')}
                disabled={isDisabled}
              />
              <Label for='note' className='form-label fw-bold ms-1'>
                Send invoice on due date?
              </Label>
            </Col>
          </Row>
        </CardBody>
        {/* /Address and Contact */}

        {/* Product Details */}
        <CardBody className='invoice-padding pt-0'>
          <div className='ecommerce-application'>
            <div className='list-view product-checkout'>
              <div className='checkout-items'>
                <InvoiceProductItemCard
                  clearErrors={clearErrors}
                  remove={remove}
                  productOptions={productOptions}
                  products={fields}
                  getValues={getValues}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>

          {!isDisabled && (
            <Button
              color='primary'
              size='sm'
              className='btn-add-new'
              disabled={isDisabled}
              onClick={() => {
                const date = new Date();
                append({
                  chargesType: PRODUCT_CHARGES_TYPE[0],
                  product: '',
                  price: 1,
                  quantity: 1,
                  productType: 'one-time',
                  paymentOption: 'Online',
                  paymentMode: 'Manual',
                  startDate: date,
                  untilDate: date,
                  yearDate: date,
                  selectedDays: [Number(moment(new Date()).format('d'))],
                });
              }}
            >
              <Plus size={14} className='me-25'></Plus>{' '}
              <span className='align-middle'>Add Item</span>
            </Button>
          )}
        </CardBody>

        <hr className='invoice-spacing' />

        <>
          <CardBody className='invoice-padding py-0'>
            <Row>
              <Col>
                <InvoiceAction
                  control={control}
                  getValues={getValues}
                  setValue={setValue}
                  watch={watch}
                  currentCustomer={currentCustomer}
                  initialInvoiceActions={initialInvoiceActions}
                />
              </Col>
            </Row>
          </CardBody>
          <hr className='invoice-spacing' />
        </>

        <CardBody className='invoice-padding py-0'>
          <Row>
            <Col>
              <div className='mb-2'>
                <Label for='note' className='form-label fw-bold'>
                  Other comments for this invoice:
                </Label>
                <FormField
                  name='description'
                  placeholder='Please enter your comments here...'
                  type='textarea'
                  errors={errors}
                  control={control}
                />
              </div>
            </Col>
          </Row>
        </CardBody>

        <hr className='invoice-spacing' />

        <CardBody className='invoice-padding py-0'>
          <Row>
            <Col>
              <FormField
                key={getValues('showTerms')}
                type='checkbox'
                errors={errors}
                control={control}
                name='showTerms'
                defaultValue={getValues('showTerms')}
                defaultChecked={!!getValues('showTerms')}
                onChange={(e) => setValue('showTerms', e.target.checked)}
              />
              <Label className='mx-1'>Show Terms & Condition ?</Label>
            </Col>
          </Row>
          {showTerms && (
            <>
              <Row className='mt-1'>
                <Col md='4'>
                  <FormField
                    label='Select Template'
                    placeholder='Select Terms and Condition template'
                    name='termsTemplate'
                    classNamePrefix='group-select-border'
                    control={control}
                    type='select'
                    onChange={(e) => {
                      const selectedTemplate = termsTemplates.find(
                        (t) => t._id === e?.value
                      );
                      setValue('termsAndCondition', selectedTemplate.content, {
                        shouldValidate: true,
                      });
                    }}
                    options={termsTemplatesOptions}
                  />
                </Col>
              </Row>

              <Row className='my-1'>
                <Col>
                  {/* REVIEW - STYLE */}
                  <SyncfusionRichTextEditor
                    key={`add_invoice`}
                    onChange={(e) => {
                      setValue('termsAndCondition', e.value, {
                        shouldValidate: true,
                      });
                    }}
                    value={getValues('termsAndCondition') || ''}
                  />
                  {/* wrapperClassName='template-editor-wrapper'
                    editorClassName='editor-class'          
                    editorStyle={{ border: '1px solid', minHeight: '175px' }} */}
                </Col>
              </Row>

              <Row>
                <div className='d-flex'>
                  {getValues(`termsTemplate`) &&
                    termsSaveOptions.map(({ label, value }, index) => (
                      <div className='form-check me-2' key={index}>
                        <Input
                          key={value}
                          id={`terms-${value}`}
                          name='term-save-type'
                          type='radio'
                          value={value}
                          onChange={(e) => setTermsSaveType(e.target.value)}
                          defaultChecked={value === termsSaveType}
                        />
                        <Label
                          className='form-check-label'
                          for={`terms-${value}`}
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                </div>
              </Row>
            </>
          )}
        </CardBody>

        <div className='d-flex align-items-center justify-content-center mb-2'>
          <SaveButton
            width='160px'
            onClick={saveInvoice}
            disabled={sendInvoiceLoading || saveLoading}
            loading={saveLoading}
            type='submit'
            name={params.id === 'add' ? 'Save Invoice' : 'Update Invoice'}
          />
        </div>
      </Card>
    </Fragment>
  );
};

export default AddInvoiceForm;
