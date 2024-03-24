// ==================== Packages =======================
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
// ====================================================
import AddInvoiceForm from './components/AddInvoiceForm';
import { required } from '../../../../configs/validationConstant';
import { getCurrentUser } from '../../../../helper/user.helper';
import {
  useCreateInvoice,
  useGetInvoice,
  useGetLatestInvoiceId,
  useSendInvoice,
  useUpdateInvoice,
} from './hooks/invoiceApis';
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
import queryString from 'query-string';

import {
  useAddTermsTemplates,
  useUpdateTermsTemplates,
  useGetTermsTemplates,
} from '../Templates/hooks/billingTemplateApis';
import { useGetQuote } from '../Quote/hooks/quoteApis';

// ** styles
import '@src/assets/scss/invoice-quote.scss';
import { getGroupDetails } from '../../../../api/groups';
import { scrollToTop } from '../../../../helper/common.helper';

export const pipelineActions = {
  KEEP_SAME: 'keepSame',
  NEW: 'new',
  UPDATED: 'updated',
  DELETED: 'deleted',
};

const invoiceSchema = yup.object().shape({
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
        price: yup.string().required(required('Price')).nullable(),
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
  invoiceDate: yup.date().required(required('Date')).nullable(),
  dueDate: yup.date().required(required('Due Date')).nullable(),
});

const AddInvoice = () => {
  // ========================== states ================================
  const minDate = new Date();
  const [initialValue, setInitialValue] = useState({
    invoiceId: null,
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
      },
    ],
    invoiceStatusActions: [
      {
        status: 'paid',
        newGroupInfo: {
          group: null,
          status: null,
          category: null,
          tags: [],
          pipelineDetails: [
            { pipeline: null, status: null, action: pipelineActions.NEW },
          ],
        },
      },
    ],
    paymentOption: 'Online',
    invoiceDate: minDate,
    dueDate: minDate,
    status: 'Draft',
    // sendInvoiceBefore: { label: '1 Day', value: 1 },
  });

  const [initialInvoiceActions, setInitialInvoiceActions] = useState([]);

  const [date, setDate] = useState({
    invoiceDate: minDate,
    dueDate: minDate,
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
    resolver: yupResolver(invoiceSchema),
    defaultValues: initialValue,
  });

  // ========================== Custom Hooks ==========================
  const user = getCurrentUser();
  const { getInvoice, isLoading: getInvoiceLoading } = useGetInvoice();
  const { getLatestInvoiceId } = useGetLatestInvoiceId();
  const { createInvoice, isLoading: createInvoiceLoading } = useCreateInvoice();
  const { updateInvoice, isLoading: updateInvoiceLoading } = useUpdateInvoice();
  const { getCustomers, isLoading: getCustomersLoading } = useGetCustomers();
  const { getProducts, isLoading: getProductsLoading } = useGetProducts();
  const { getTermsTemplates } = useGetTermsTemplates();
  const { addTermsTemplate } = useAddTermsTemplates();
  const { updateTermsTemplate } = useUpdateTermsTemplates();

  const { basicRoute } = useGetBasicRoute();
  const { isLoading: sendInvoiceLoading } = useSendInvoice();
  const isDisabled = params.id === 'add' ? false : true;

  const customerId = watch('customer');

  const currentCustomer = useMemo(
    () => customers?.find((c) => c._id === customerId?.value),
    [customerId]
  );

  useEffect(async () => {
    if (params.id !== 'add') {
      getInvoiceDetails();
    } else {
      const isQuote = queryString.parse(window.location.search);
      if (isQuote?.quote) {
        getQuoteDetails(isQuote?.quote);
        const queryParams = new URLSearchParams(location.search);

        if (queryParams.has('quote')) {
          queryParams.delete('quote');
          history.replace({
            search: queryParams.toString(),
          });
        }
      } else {
        loadCustomers();
        loadProducts();
        loadLatestInvoiceId();
      }
    }
    loadTermsTemplate();
  }, [params.id]);

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (params.id === 'add') {
      loadInvoiceActionValues();
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
        price: product.price,
        description: product.description,
      }));
      setProductOptions(products);
    }
    return data;
  };

  const loadLatestInvoiceId = async () => {
    const { data, error } = await getLatestInvoiceId();

    if (!error) {
      const invoiceId = data.latestInvoiceId;
      if (invoiceId) setInitialValue((prev) => ({ ...prev, invoiceId }));
    }
  };
  const { getQuote } = useGetQuote();

  const getQuoteDetails = async (id) => {
    setLoading(false);

    const { data } = await getQuote(id);

    if (data) {
      const customerData = await loadCustomers();
      const productData = await loadProducts();

      const customersOpts = customerData.map((customer) => ({
        label: `${customer.firstName}${customer.lastName}`,
        value: customer._id,
      }));
      const invoiceDetail = { ...data };

      if (invoiceDetail.customer) {
        const selectedOpt = customersOpts.find(
          (c) => c.value === invoiceDetail?.customer?._id
        );
        invoiceDetail.customer = selectedOpt;
      }

      if (invoiceDetail.status) {
        invoiceDetail.status = {
          label: invoiceDetail.status,
          value: invoiceDetail.status,
        };
      }
      if (invoiceDetail.sendInvoiceBefore) {
        invoiceDetail.sendInvoiceBefore = SEND_INVOICE_AFTER.find(
          (i) => i.value === invoiceDetail.sendInvoiceBefore
        );
      }

      if (invoiceDetail.productDetails) {
        const productOptions = productData.map((product) => ({
          label: `${product.name}`,
          value: product._id,
          type: product.type,
          image: product.image,
        }));

        const invoiceProducts = [];
        invoiceDetail.productDetails.forEach((p) => {
          const existOption = productOptions.find((opt) => {
            return opt.value === p?.product?._id;
          });

          const schedule = BILLING_RECURRING_SCHEDULE.find(
            (sc) => sc.value === p?.reccuringDetails?.schedule
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

          invoiceProducts.push({
            _id: p?._id,
            description: p?.description,
            product: existOption,
            price: p?.price,
            quantity: p?.quantity,
            productType: p?.productType,
            paymentOption: p?.paymentOption,
            paymentMode: p?.paymentMode,
            paymentType: p?.paymentType,
            installmentChargesType: p?.installmentChargesType,
            totalInstallments: p?.totalInstallments,
            installmentCharge: p?.installmentCharge,
            installments: p?.installments,
            schedule,
            endType,
            startDate: p?.reccuringDetails?.startDate || minDate,
            untilDate: p?.reccuringDetails?.endDate || minDate,
            yearDate: p?.reccuringDetails?.selectedYear || minDate,
            monthDay,
            selectedDays: p?.reccuringDetails?.selectedWeekDay,
          });
        });

        invoiceDetail.productDetails = invoiceProducts;
      }

      const invoiceStatusActions = [];
      const customerObj = customerData.find(
        (c) => c._id === invoiceDetail.customer.value
      );

      for (const q of invoiceDetail.quoteStatusActions) {
        const qAction = q.newGroupInfo;

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

        invoiceStatusActions.push({
          status: 'paid',
          newGroupInfo: qAction,
        });
      }

      setInitialInvoiceActions(invoiceStatusActions);
      invoiceDetail.invoiceStatusActions = invoiceStatusActions;

      if (!invoiceDetail?.invoiceStatusActions?.length) {
        const invoiceActions = loadInvoiceActionValues();
        invoiceDetail.invoiceStatusActions = invoiceActions;
      }

      invoiceDetail.invoiceDate = minDate;
      invoiceDetail.dueDate = minDate;

      setDate({
        dueDate: minDate,
        invoiceDate: minDate,
      });
      setInitialValue(invoiceDetail);
      loadLatestInvoiceId();
    } else {
      loadCustomers();
      loadProducts();
      loadLatestInvoiceId();
    }
    setLoading(false);
  };

  const loadTermsTemplate = async () => {
    const { data, error } = await getTermsTemplates();

    if (!error && data?.length) {
      setTermsTemplate(data);
    }
  };

  const getInvoiceDetails = async () => {
    setLoading(true);

    const { data, error } = await getInvoice(params.id);
    const customerData = await loadCustomers();
    const productData = await loadProducts();

    const customersOpts = customerData.map((customer) => ({
      label: `${customer.firstName}${customer.lastName}`,
      value: customer._id,
    }));

    if (!error) {
      const invoiceDetail = { ...data };

      if (invoiceDetail.customer) {
        const selectedOpt = customersOpts.find(
          (c) => c.value === invoiceDetail.customer._id
        );
        invoiceDetail.customer = selectedOpt;
      }

      if (invoiceDetail.status) {
        invoiceDetail.status = {
          label: invoiceDetail.status,
          value: invoiceDetail.status,
        };
      }
      if (invoiceDetail.sendInvoiceBefore) {
        invoiceDetail.sendInvoiceBefore = SEND_INVOICE_AFTER.find(
          (i) => i.value === invoiceDetail.sendInvoiceBefore
        );
      }

      if (invoiceDetail.productDetails) {
        const productOptions = productData.map((product) => ({
          label: `${product.name}`,
          value: product._id,
          type: product.type,
          image: product.image,
        }));

        const invoiceProducts = [];
        invoiceDetail.productDetails.forEach((p) => {
          const existOption = productOptions.find((opt) => {
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

          invoiceProducts.push({
            _id: p?._id,
            description: p?.description,
            product: existOption,
            price: p?.price,
            quantity: p?.quantity,
            productType: p?.productType,
            paymentOption: p?.paymentOption,
            paymentMode: p?.paymentMode,
            paymentType: p?.paymentType,
            charges: p.charges,
            chargesType: p?.chargesType
              ? PRODUCT_CHARGES_TYPE.find((c) => c.value === p.chargesType)
              : {},
            installmentChargesType: p?.installmentChargesType,
            totalInstallments: p?.totalInstallments,
            installmentCharge: p?.installmentCharge,
            installments: p?.installments,
            schedule,
            endType,
            startDate: p?.reccuringDetails?.startDate || minDate,
            untilDate: p?.reccuringDetails?.endDate || minDate,
            yearDate: p?.reccuringDetails?.selectedYear || minDate,
            monthDay,
            selectedDays: p?.reccuringDetails?.selectedWeekDay,
          });
        });

        invoiceDetail.productDetails = invoiceProducts;
      }

      const invoiceStatusActions = [];
      const customerObj = customerData.find(
        (c) => c._id === invoiceDetail.customer.value
      );

      for (const q of invoiceDetail.invoiceStatusActions) {
        const qStatus = q.status;
        const qAction = q.newGroupInfo;

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

        invoiceStatusActions.push({
          status: qStatus,
          newGroupInfo: qAction,
        });
      }

      setInitialInvoiceActions(invoiceStatusActions);
      invoiceDetail.invoiceStatusActions = invoiceStatusActions;

      setDate({
        dueDate: invoiceDetail.dueDate,
        invoiceDate: invoiceDetail.invoiceDate,
      });
      setInitialValue(invoiceDetail);
      setLoading(false);
    }
  };

  const loadInvoiceActionValues = () => {
    const updatedInitialInvoiceActions = initialValue.invoiceStatusActions.map(
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

        setValue(`invoiceStatusActions[${Idx}].newGroupInfo.group`, groupVal);
        setValue(`invoiceStatusActions[${Idx}].newGroupInfo.status`, statusVal);
        setValue(
          `invoiceStatusActions[${Idx}].newGroupInfo.category`,
          categoryVal
        );
        setValue(`invoiceStatusActions[${Idx}].newGroupInfo.tags`, tagsVal);
        setValue(
          `invoiceStatusActions[${Idx}].newGroupInfo.pipelineDetails`,
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

    setInitialInvoiceActions(updatedInitialInvoiceActions);
    return updatedInitialInvoiceActions;
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
      rawData.productDetails = rawData.productDetails.map((product) => ({
        ...(product._id && {
          _id: product?._id,
        }),
        selectedDays:
          product.productType === 'recurring' ? product.selectedDays : null,
        startDate:
          product.productType === 'recurring' ? product.startDate : null,
        untilDate:
          product.productType === 'recurring' ? product.untilDate : null,
        yearDate: product.productType === 'recurring' ? product.yearDate : null,
        productType: product?.productType,
        product: product?.product?.value,
        paymentOption: product?.paymentOption,
        paymentMode: product?.paymentMode,
        paymentType: product?.paymentType,
        installmentChargesType: product?.installmentChargesType,
        totalInstallments: product?.totalInstallments,
        installmentCharge: product?.installmentCharge,
        charges: product?.charges,
        chargesType: product?.chargesType?.value,
        description: product?.description,
        price: +product?.price,
        quantity: +product?.quantity || 1,
        installments: product?.installments,
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
    }

    let updatedInvoiceStatusActions = [];

    if (getValues('enableStatusAction')) {
      updatedInvoiceStatusActions = rawData.invoiceStatusActions
        .filter((q) => !!q?.newGroupInfo?.group)
        .map((q) => {
          const pipelines = q.newGroupInfo.pipelineDetails.filter(
            (p) => p.pipeline && p.status
          );
          if (!pipelines.length) q.newGroupInfo.pipelineDetails = [];
          return q;
        });
    }

    rawData.invoiceStatusActions = updatedInvoiceStatusActions;

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
      const { error } = await updateInvoice(
        params.id,
        rawData,
        'Update Invoice...'
      );
      if (!error) {
        scrollToTop();
      }
    } else {
      const { error, data } = await createInvoice(rawData, 'Save Invoice...');
      if (!error) {
        history.push(`${basicRoute}/invoice/${data?._id}`);
      }
    }
  };

  return (
    <div className='invoice-add-wrapper'>
      <UILoader
        blocking={
          getInvoiceLoading ||
          loading ||
          getProductsLoading ||
          getCustomersLoading
        }
      >
        <Row className='invoice-add'>
          <Col xl={12} md={12} sm={12}>
            <AddInvoiceForm
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
              initialInvoiceActions={initialInvoiceActions}
              termsTemplates={termsTemplates}
              termsSaveType={termsSaveType}
              setTermsSaveType={setTermsSaveType}
              saveInvoice={handleSubmit(onSubmit)}
              isDisabled={isDisabled}
              sendInvoiceLoading={sendInvoiceLoading}
              saveLoading={createInvoiceLoading || updateInvoiceLoading}
            />
          </Col>
        </Row>
      </UILoader>
    </div>
  );
};
export default AddInvoice;
