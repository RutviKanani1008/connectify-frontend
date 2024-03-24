// ==================== Packages =======================
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
// ====================================================
import AddQuoteForm from './components/AddQuoteForm';
import { required } from '../../../../configs/validationConstant';
import { getCurrentUser } from '../../../../helper/user.helper';
import {
  useCreateQuote,
  useGetQuote,
  useGetLatestQuoteId,
  useUpdateQuote,
} from './hooks/quoteApis';
import { useGetCustomers } from '../BillingProfiles/hooks/customerApis';
import { useGetProducts } from '../Products/hooks/productApis';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import UILoader from '@components/ui-loader';
import {
  BILLING_END_TYPE,
  BILLING_RECURRING_SCHEDULE,
  PRODUCT_CHARGES_TYPE,
  SEND_INVOICE_AFTER,
} from '../../../../constant';
import {
  useAddTermsTemplates,
  useGetTermsTemplates,
  useUpdateTermsTemplates,
} from '../Templates/hooks/billingTemplateApis';
import { getGroupDetails } from '../../../../api/groups';

// ** styles
import '@src/assets/scss/invoice-quote.scss';
import { scrollToTop } from '../../../../helper/common.helper';

export const pipelineActions = {
  KEEP_SAME: 'keepSame',
  NEW: 'new',
  UPDATED: 'updated',
  DELETED: 'deleted',
};

const quoteSchema = yup.object().shape({
  customer: yup
    .object()
    .shape({
      label: yup.string().required('Customer Required'),
      value: yup.string().required('Customer Required'),
    })
    .required(required('Customer'))
    .nullable(),
  productDetails: yup
    .array()
    .of(
      yup.object().shape({
        product: yup
          .object()
          .shape({
            label: yup.string().required('Required'),
            value: yup.string().required('Required'),
          })
          .required(required('Product'))
          .nullable(),
        quantity: yup.string().required('Required').nullable(),
        price: yup
          .string()
          .test(
            'Is positive?',
            'Price must be greater than 0!',
            (value) => value > 0
          )
          .required(required('Price '))
          .nullable(true),
        totalInstallments: yup.string().when('paymentType', {
          is: (paymentType) => paymentType === 'installment',
          then: yup
            .string()
            .test(
              'Is positive?',
              'TotalInstallments must be greater than 0!',
              (value) => value > 0
            )
            .required(required('TotalInstallments'))
            .nullable(true),
        }),
        installments: yup.array().of(
          yup.object().shape({
            percentage: yup
              .string()
              .test(
                'Is positive?',
                'Percentage must be positive!',
                (value) => value >= 0
              )
              .required(required('Percentage '))
              .nullable(true),
            amount: yup.string().required(required('Amount')).nullable(),
            dueDate: yup.date().required(required('Due Date')).nullable(),
          })
        ),
      })
    )
    .required('Must have fields')
    .min(1, 'Minimum of 1 field'),
  quoteDate: yup.date().required(required('Date')).nullable(),
  expiryDate: yup.date().required(required('ExpireDate Date')).nullable(),
});

const AddQuote = () => {
  // ========================== states ================================
  const minDate = new Date();
  const [initialValue, setInitialValue] = useState({
    quoteId: null,
    description: '',
    productDetails: [
      {
        chargesType: PRODUCT_CHARGES_TYPE[0],
        product: '',
        price: 1,
        quantity: 1,
        productType: 'one-time',
        paymentOption: 'Online',
        paymentMode: 'Manual',
        startDate: minDate,
        untilDate: minDate,
        yearDate: minDate,
        selectedDays: [Number(moment(new Date()).format('d'))],
        installments: [],
        paymentType: 'fullPayment',
      },
    ],
    quoteStatusActions: [
      {
        status: 'Approved',
        newGroupInfo: {
          group: null,
          status: null,
          category: null,
          tags: [],
          pipelineDetails: [
            { pipeline: null, status: null, action: pipelineActions.NEW },
          ],
        },
        convertToInvoice: false,
      },
    ],
    quoteDate: minDate,
    expiryDate: minDate,
    status: null,
    sendInvoiceBefore: { label: '1 Day', value: 1 },
  });

  const [initialQuoteActions, setInitialQuoteActions] = useState([]);

  const [date, setDate] = useState({
    quoteDate: minDate,
    expiryDate: minDate,
  });
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [termsTemplates, setTermsTemplate] = useState([]);
  const [termsSaveType, setTermsSaveType] = useState('');

  // ========================== Hooks =================================
  const params = useParams();
  const history = useHistory();
  const {
    control,
    watch,
    reset,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(quoteSchema),
    defaultValues: initialValue,
  });
  // const isDisabled = params.id === 'add' ? false : true;
  const isDisabled = false;

  // ========================== Custom Hooks ==========================
  const user = getCurrentUser();
  const { getQuote, isLoading: getQuoteLoading } = useGetQuote();
  const { getLatestQuoteId } = useGetLatestQuoteId();
  const { createQuote, isLoading: createQuoteLoading } = useCreateQuote();
  const { updateQuote, isLoading: updateQuoteLoading } = useUpdateQuote();
  const { getCustomers, isLoading: customerLoading } = useGetCustomers();
  const { getProducts, isLoading: productLoading } = useGetProducts();
  const { getTermsTemplates } = useGetTermsTemplates();
  const { addTermsTemplate } = useAddTermsTemplates();
  const { updateTermsTemplate } = useUpdateTermsTemplates();

  const { basicRoute } = useGetBasicRoute();

  const customerId = watch('customer');

  const currentCustomer = useMemo(
    () => customers?.find((c) => c._id === customerId?.value),
    [customerId]
  );

  useEffect(async () => {
    if (params.id !== 'add') {
      getQuoteDetails();
    } else {
      loadCustomers();
      loadProducts();
      loadLatestQuoteId();
    }
    loadTermsTemplate();
  }, [params.id]);

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (params.id === 'add') {
      loadQuoteActionValues();
    }
  }, [currentCustomer]);

  const loadCustomers = async () => {
    const { data, error } = await getCustomers({
      select: 'firstName,lastName,enableBilling',
    });

    if (!error) {
      setCustomers([...data]);
      const customers = data.map((customer) => ({
        label: `${customer.firstName}${customer.lastName}`,
        value: customer._id,
        isEnableBilling: customer?.enableBilling || false,
      }));

      setCustomerOptions(customers);
    }
    return data;
  };

  const loadProducts = async () => {
    const { data, error } = await getProducts({
      select: 'name,productId,type,image,price,description',
    });

    if (!error) {
      const products = data.map((product) => ({
        label: `${product.name}`,
        value: product._id,
        type: product.type,
        image: product.image,
        description: product.description,
        price: product.price,
      }));
      setProductOptions(products);
    }
    return data;
  };

  const loadLatestQuoteId = async () => {
    const { data, error } = await getLatestQuoteId();
    if (!error) {
      const quoteId = data.latestQuoteId;
      if (quoteId) setInitialValue((prev) => ({ ...prev, quoteId }));
    }
  };

  const loadTermsTemplate = async () => {
    const { data, error } = await getTermsTemplates();

    if (!error && data?.length) {
      setTermsTemplate(data);
    }
  };

  const getQuoteDetails = async () => {
    setLoading(true);

    const { data, error } = await getQuote(params.id);
    const customerData = await loadCustomers();
    const productData = await loadProducts();

    const customersOpts = customerData.map((customer) => ({
      label: `${customer.firstName}${customer.lastName}`,
      value: customer._id,
    }));

    if (!error) {
      const quoteDetail = { ...data };

      if (quoteDetail.customer) {
        const selectedOpt = customersOpts.find(
          (c) => c.value === quoteDetail.customer?._id
        );
        quoteDetail.customer = selectedOpt;
      }

      if (quoteDetail.status) {
        quoteDetail.status = {
          label: quoteDetail.status,
          value: quoteDetail.status,
        };
      }

      if (quoteDetail.sendInvoiceBefore) {
        quoteDetail.sendInvoiceBefore = SEND_INVOICE_AFTER.find(
          (i) => i.value === quoteDetail.sendInvoiceBefore
        );
      }

      if (quoteDetail.productDetails) {
        const productOptions = productData.map((product) => ({
          label: `${product.name}`,
          value: product._id,
          type: product.type,
          image: product.image,
          description: product.description,
        }));

        const quoteProducts = [];
        quoteDetail.productDetails.forEach((p) => {
          const product = productOptions.find((opt) => {
            return opt.value === p.product?._id;
          });
          const schedule = BILLING_RECURRING_SCHEDULE.find(
            (sc) => sc.value === p.reccuringDetails?.schedule
          );
          const endType = BILLING_END_TYPE.find((b) => {
            return p.reccuringDetails?.neverEnd === true && b.value === 'never';
          });
          const monthDay = [...Array(moment().daysInMonth())]
            .map((_, index) => ({
              value: index + 1,
              label: index + 1,
            }))
            .find((m) => m.value === p.reccuringDetails?.selectedMonthDay);

          // ========================================
          // if (_.isArray(p.installments)) {
          //   p.installments = p.installments.map((installment) => {
          //     if (new Date(installment.dueDate)<) {
          //     }
          //   });
          // }
          // ========================================

          quoteProducts.push({
            productType: p?.productType,
            product,
            paymentOption: p?.paymentOption,
            paymentMode: p?.paymentMode,
            paymentType: p?.paymentType,
            installmentChargesType: p?.installmentChargesType,
            totalInstallments: p?.totalInstallments,
            installmentCharge: p?.installmentCharge,
            description: p.description,
            price: p.price,
            quantity: p.quantity,
            installments: p.installments,
            charges: p.charges,
            chargesType: p?.chargesType
              ? PRODUCT_CHARGES_TYPE.find((c) => c.value === p.chargesType)
              : {},
            schedule,
            endType,
            startDate: p.reccuringDetails?.startDate || minDate,
            untilDate: p.reccuringDetails?.endDate || minDate,
            yearDate: p.reccuringDetails?.selectedYear || minDate,
            monthDay,
            selectedDays: p.reccuringDetails?.selectedWeekDay,
          });
        });

        quoteDetail.productDetails = quoteProducts;
      }

      const quoteStatusActions = [];
      const customerObj = customerData.find(
        (c) => c._id === quoteDetail.customer.value
      );

      for (const q of quoteDetail.quoteStatusActions) {
        const qStatus = q.status;
        const qAction = q.newGroupInfo;
        const qConvert = q.convertToInvoice;

        if (qAction?._id) delete qAction._id;

        const latestGroupDetails = await getGroupDetails(
          customerObj?.group?.id?._id
        );
        const groupValues = latestGroupDetails?.data?.data;

        /* Group */
        if (
          qAction?.group?.keepSame ||
          customerObj?.group?.id?._id === qAction?.group?.id?._id
        ) {
          const obj = {};
          obj.id = null;
          obj.value = null;
          obj.label = 'Keep the Same';
          obj.keepSame = true;
          qAction.group = obj;
        } else if (qAction?.group?.id?._id) {
          const obj = {};
          obj.id = qAction?.group?.id?._id;
          obj.value = qAction?.group?.id?.groupCode;
          obj.label = qAction?.group?.id?.groupName;
          delete qAction?.group?.id;
          qAction.group = obj;
        }

        /* Status */
        if (
          qAction?.status?.keepSame ||
          customerObj?.status?.id?._id === qAction?.status?.id?._id
        ) {
          const obj = {};
          obj.id = null;
          obj.value = null;
          obj.keepSame = true;
          obj.label = 'Keep the Same';

          const notSelected =
            qAction?.status?.keepSame && !customerObj?.status?.id?._id;

          qAction.status = !notSelected ? obj : null;
        } else if (qAction?.status) {
          let isExist = false;
          if (groupValues?.status?.length) {
            isExist = groupValues.status.some(
              (c) => c._id === qAction?.status?.id?._id
            );
          }

          const obj = {};
          obj.id = qAction?.status?.id?._id;
          obj.value = qAction?.status?.id?.statusCode;
          obj.label = qAction?.status?.id?.statusName;
          qAction.status = isExist ? obj : null;
        }

        /* Category */
        if (
          qAction?.category?.keepSame ||
          customerObj?.category?.id?._id === qAction?.category?.id?._id
        ) {
          const obj = {};
          obj.id = null;
          obj.value = null;
          obj.keepSame = true;
          obj.label = 'Keep the Same';

          const notSelected =
            qAction?.category?.keepSame && !customerObj?.category?.id?._id;
          qAction.category = !notSelected ? obj : null;
        } else if (qAction?.category) {
          let isExist = false;
          if (groupValues?.category?.length) {
            isExist = groupValues.category.some(
              (c) => c._id === qAction?.category?.id?._id
            );
          }

          const obj = {};
          obj.id = qAction?.category?.id?._id;
          obj.value = qAction?.category?.id?.categoryId;
          obj.label = qAction?.category?.id?.categoryName;

          delete qAction?.category?.id;
          qAction.category = isExist ? obj : null;
        }

        /* Tags */
        if (qAction?.tags && qAction?.tags?.length > 0) {
          let isExist = false;

          if (groupValues?.tags?.length) {
            isExist = qAction.tags.every((t) => {
              return groupValues.tags.map((t) => t?._id).includes(t?.id?._id);
            });
          }
          const tags = JSON.parse(JSON.stringify(qAction?.tags));
          qAction.tags = isExist
            ? tags.map((tag) => ({
                id: tag?.id?._id,
                value: tag?.id?.tagId,
                label: tag?.id?.tagName,
              }))
            : [];
        }

        let isExist = false;
        const newPipelineDetails = [];

        if (groupValues?.pipeline?.length) {
          isExist = (qAction.pipelineDetails || [])?.every((pObj) => {
            return groupValues.pipeline
              .map((p) => p?._id)
              .includes(pObj?.pipeline?.id?._id);
          });
        }

        (qAction?.pipelineDetails || []).forEach((pObj) => {
          const isCurrent = customerObj.pipelineDetails.find((p) => {
            return p?.pipeline?.id?._id === pObj?.pipeline?.id?._id;
          });

          const pipeline = {
            id: pObj?.pipeline?.id?._id,
            value: pObj?.pipeline?.id?.pipelineCode,
            label: pObj?.pipeline?.id?.pipelineName,
          };

          const statusObj = pObj?.pipeline?.id?.stages?.find(
            (stage) => stage._id === pObj?.status?.id
          );

          const status = {
            id: statusObj?._id,
            label: statusObj?.title,
            value: statusObj?.code,
          };

          newPipelineDetails.push({
            pipeline,
            status,
            action: isCurrent === null ? pipelineActions.NEW : pObj.action,
          });
        });

        qAction.pipelineDetails = isExist
          ? newPipelineDetails
          : [{ pipeline: null, status: null, action: pipelineActions.NEW }];

        quoteStatusActions.push({
          status: qStatus,
          newGroupInfo: qAction,
          convertToInvoice: qConvert,
        });
      }

      setInitialQuoteActions(quoteStatusActions);
      quoteDetail.quoteStatusActions = quoteStatusActions;

      if (!quoteDetail?.quoteStatusActions?.length) {
        const updatedInitialQuoteActions = loadQuoteActionValues();
        quoteDetail.quoteStatusActions = updatedInitialQuoteActions;
      }

      setDate({
        expiryDate: quoteDetail.expiryDate,
        quoteDate: quoteDetail.quoteDate,
      });
      setInitialValue(quoteDetail);
      setLoading(false);
    }
  };

  const loadQuoteActionValues = () => {
    const updatedInitialQuoteActions = initialValue.quoteStatusActions.map(
      (qA, Idx) => {
        const group = currentCustomer?.group?.id;
        const status = currentCustomer?.status?.id;
        const category = currentCustomer?.category?.id;
        const tags = currentCustomer?.tags;
        const pipelineDetails = currentCustomer?.pipelineDetails;

        let groupVal = null;
        if (group) {
          groupVal = {
            id: null,
            label: 'Keep the Same',
            value: null,
            keepSame: true,
          };
        }
        let statusVal = null;
        if (status) {
          statusVal = {
            id: null,
            label: 'Keep the Same',
            value: null,
            keepSame: true,
          };
        }
        let categoryVal = null;
        if (category) {
          categoryVal = {
            id: null,
            label: 'Keep the Same',
            value: null,
            keepSame: true,
          };
        }

        let tagsVal = [];

        if (tags && tags?.length > 0) {
          const newTags = JSON.parse(JSON.stringify(tags));
          tagsVal = newTags.map((tag) => ({
            id: tag?._id,
            value: tag?.tagId,
            label: tag?.tagName,
          }));
        }

        const newPipelineDetails = [];
        (pipelineDetails || [])?.forEach((pObj) => {
          const pipeline = {
            id: pObj?.pipeline?.id?._id,
            value: pObj?.pipeline?.id?.pipelineCode,
            label: pObj?.pipeline?.id?.pipelineName,
          };

          const statusObj = pObj?.pipeline?.id?.stages?.find(
            (stage) => stage._id === pObj?.status?.id
          );
          const status = {
            id: statusObj?._id,
            label: statusObj?.title,
            value: statusObj?.code,
          };
          newPipelineDetails.push({
            pipeline,
            status,
            action: pipelineActions.KEEP_SAME,
          });
        });

        setValue(`quoteStatusActions[${Idx}].newGroupInfo.group`, groupVal);
        setValue(`quoteStatusActions[${Idx}].newGroupInfo.status`, statusVal);
        setValue(
          `quoteStatusActions[${Idx}].newGroupInfo.category`,
          categoryVal
        );
        setValue(`quoteStatusActions[${Idx}].newGroupInfo.tags`, tagsVal);
        setValue(
          `quoteStatusActions[${Idx}].newGroupInfo.pipelineDetails`,
          newPipelineDetails
        );

        return {
          ...qA,
          newGroupInfo: {
            group: groupVal,
            status: statusVal,
            category: categoryVal,
            tags: tagsVal,
            pipelineDetails: newPipelineDetails,
          },
        };
      }
    );

    setInitialQuoteActions(updatedInitialQuoteActions);
    return updatedInitialQuoteActions;
    // setValue(`quoteStatusActions`, updatedInitialQuoteActions);
  };

  const onSubmit = async (data) => {
    const rawData = JSON.parse(JSON.stringify(data));

    rawData.company = user.company._id;
    if (rawData.customer) rawData.customer = rawData.customer.value;
    if (rawData.status) rawData.status = rawData.status.value;
    if (rawData.sendInvoiceBefore)
      rawData.sendInvoiceBefore = rawData?.sendInvoiceBefore?.value;

    if (rawData.productDetails) {
      const productDetails = rawData.productDetails.map((product) => ({
        productType: product?.productType,
        product: product?.product?.value,
        paymentOption: product?.paymentOption,
        paymentMode: product?.paymentMode,
        paymentType: product?.paymentType,
        installmentChargesType: product?.installmentChargesType,
        totalInstallments: product?.totalInstallments,
        installmentCharge: product?.installmentCharge,
        description: product?.description,
        price: +product?.price,
        quantity: +product?.quantity || 1,
        installments: product?.installments,
        charges: product?.charges,
        chargesType: product?.chargesType?.value,
        reccuringDetails:
          product.productType === 'recurring'
            ? {
                schedule: product.schedule?.value,
                startDate: product.startDate,
                ...(product.endType?.value !== 'never' && {
                  endDate: product.untilDate || null,
                }),
                neverEnd: product.endType?.value === 'never',
                ...(product.schedule?.value === 'weekly' && {
                  selectedWeekDay: product.selectedDays,
                }),
                ...(product.schedule?.value === 'monthly' && {
                  selectedMonthDay: product.monthDay?.value,
                }),
                ...(product.schedule?.value === 'yearly' && {
                  selectedYear: product.yearDate,
                }),
              }
            : null,
      }));
      rawData.productDetails = productDetails;
    }

    let updatedQuoteStatusActions = [];

    if (getValues('enableStatusAction')) {
      updatedQuoteStatusActions = rawData.quoteStatusActions
        .filter((q) => !!q?.newGroupInfo?.group)
        .map((q) => {
          const pipelines = q.newGroupInfo.pipelineDetails.filter(
            (p) => p.pipeline && p.status
          );
          if (!pipelines.length) q.newGroupInfo.pipelineDetails = [];
          return q;
        });
    }

    rawData.quoteStatusActions = updatedQuoteStatusActions;

    // if (rawData) return;

    const templateId = rawData.termsTemplate?.value;
    const name = rawData.termsTemplate?.label;
    const content = rawData.termsAndCondition;

    if (termsSaveType === 'create') {
      const createName = `Copy of ${name}`;
      await addTermsTemplate({ name: createName, content });
    } else if (termsSaveType === 'update') {
      if (templateId && name && content) {
        await updateTermsTemplate(templateId, { name, content });
      }
    }

    if (params.id !== 'add') {
      const { error } = await updateQuote(
        params.id,
        rawData,
        'Update Quote...'
      );
      if (!error) {
        scrollToTop();
      }
    } else if (params.id === 'add') {
      const { error, data } = await createQuote(rawData, 'Save Quote...');
      if (!error) {
        history.push(`${basicRoute}/quote/${data?._id}`);
      }
    }
  };

  return (
    <div className='quote-add-wrapper'>
      <UILoader
        blocking={
          getQuoteLoading || loading || customerLoading || productLoading
        }
      >
        <Row className='invoice-add'>
          <Col xl={12} md={12} sm={12}>
            <AddQuoteForm
              setDate={setDate}
              date={date}
              errors={errors}
              watch={watch}
              control={control}
              getValues={getValues}
              clearErrors={clearErrors}
              setValue={setValue}
              customers={customers}
              currentCustomer={currentCustomer}
              customerOptions={customerOptions}
              productOptions={productOptions}
              initialQuoteActions={initialQuoteActions}
              termsTemplates={termsTemplates}
              termsSaveType={termsSaveType}
              setTermsSaveType={setTermsSaveType}
              saveQuote={handleSubmit(onSubmit)}
              saveLoading={createQuoteLoading || updateQuoteLoading}
              isDisabled={isDisabled}
            />
          </Col>
        </Row>
      </UILoader>
    </div>
  );
};

export default AddQuote;
