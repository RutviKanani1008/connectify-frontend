// ** React Imports
import { useState } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';

// ** Reactstrap Imports
import { Card, CardBody, Button } from 'reactstrap';

// ** components **
import SendTestQuoteInvoiceModal from './SendTestQuoteInvoiceModal';
import { SaveButton } from '@components/save-button';

// ** apis
import {
  useSendInvoice,
  useSendTestInvoice,
  useUpdateInvoiceStatus,
} from '../../Invoice/hooks/invoiceApis';
import {
  useSendQuote,
  useSendTestQuote,
  useUpdateQuoteStatus,
} from '../hooks/quoteApis';

// ** others **
import { validateEmail } from '../../../../../utility/Utils';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import ChangeBillStatusHistoryModal from './ChangeBillStatusHistoryModal';
import { getCurrentUser } from '../../../../../helper/user.helper';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

const PreviewActions = ({
  isPublicPage,
  statusHistoryData,
  slug,
  id,
  type,
  exportPDFWithComponent,
  status,
  setStatusHistoryData,
  setData,
  notes,
}) => {
  const user = getCurrentUser();
  const { basicRoute } = useGetBasicRoute();

  // ** states **
  const [openModal, setOpenModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [currentEmails, setCurrentEmails] = useState([]);
  const [changeStatusModal, setChangeStatusModal] = useState({
    toggle: false,
    status: '',
  });

  // ** custom hooks **
  const { sendTestQuote, isLoading: sendTestQuoteLoading } = useSendTestQuote();
  const { sendTestInvoice, isLoading: sendTestInvoiceLoading } =
    useSendTestInvoice();
  const { sendInvoice, isLoading: sendInvoiceLoading } = useSendInvoice();
  const { sendQuote, isLoading: sendQuoteLoading } = useSendQuote();
  const { updateQuoteStatus, isLoading: quoteStatusLoading } =
    useUpdateQuoteStatus();
  const { updateInvoiceStatus, isLoading: invoiceStatusLoading } =
    useUpdateInvoiceStatus();

  const handleEmails = (values) => {
    if (showError) setShowError(false);
    if (_.isArray(values)) {
      const validEmails = [];
      values.forEach((value) => {
        if (validateEmail(value.value)) {
          validEmails.push(value);
        }
      });
      setCurrentEmails(validEmails);
    }
  };

  const sendTestInvoiceFunc = async () => {
    const allEmails = currentEmails.map((email) => email.value);
    if (currentEmails.length) {
      const allValid = allEmails.every((email) => validateEmail(email));
      if (allValid) {
        const body = {};
        body.receiverEmails = allEmails;
        const { error } = await sendTestInvoice(slug, body, null);
        if (!error) {
          setOpenModal(false);
          setCurrentEmails([]);
          setShowError(false);
        }
      }
    } else {
      setShowError(true);
    }
  };

  const sendTestQuoteFunc = async () => {
    const allEmails = currentEmails.map((email) => email.value);
    if (currentEmails.length) {
      const allValid = allEmails.every((email) => validateEmail(email));
      if (allValid) {
        const body = {};
        body.receiverEmails = allEmails;
        const { error } = await sendTestQuote(slug, body, null);
        if (!error) {
          setOpenModal(false);
          setCurrentEmails([]);
          setShowError(false);
        }
      }
    } else {
      setShowError(true);
    }
  };

  const handleStatus = async () => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you want to change status?',
    });
    if (result.value) {
      if (type === 'Invoice') {
        const { error, data } = await updateInvoiceStatus(id, {
          status: 'Approve',
          currentUserId: user._id,
          companyId: user.company._id,
        });
        if (!error && data) {
          setData((pre) => ({ ...pre, status: 'Approve' }));
          setStatusHistoryData((prev) => [data, ...prev]);
        }
      } else {
        const { error, data } = await updateQuoteStatus(id, {
          status: 'Approve',
          currentUserId: user._id,
          companyId: user.company._id,
        });
        if (!error && data) {
          setData((pre) => ({ ...pre, status: 'Approve' }));
          setStatusHistoryData((prev) => [data, ...prev]);
        }
      }
    }
  };

  return (
    <>
      <Card className='invoice-action-wrapper'>
        <CardBody>
          <Button
            color='secondary'
            block
            outline
            className='mb-75'
            onClick={() => {
              exportPDFWithComponent();
            }}
          >
            Download
          </Button>
          <Button
            color='secondary'
            tag={Link}
            to={
              type === 'Invoice'
                ? `${basicRoute}/invoice/print/${id}`
                : `${basicRoute}/quote/print/${id}`
            }
            target='_blank'
            block
            outline
            className='mb-75'
          >
            Print
          </Button>
          {!isPublicPage && (
            <>
              <Button
                color='secondary'
                block
                outline
                className='mb-75'
                onClick={() => setOpenModal(true)}
              >
                {type === 'Invoice' ? 'Send Test Invoice' : 'Send Test Quote'}
              </Button>
              <SaveButton
                block
                color='secondary'
                outline
                loading={sendInvoiceLoading || sendQuoteLoading}
                width='150px'
                type='submit'
                name={'Send To Contact'}
                onClick={() => {
                  if (type === 'Invoice') {
                    sendInvoice(slug, 'Sending invoice');
                  } else {
                    sendQuote(slug, 'Sending invoice');
                  }
                }}
                className='mb-75'
              ></SaveButton>
            </>
          )}
          <SaveButton
            block
            color='secondary'
            outline
            disabled={status === 'Approve'}
            loading={quoteStatusLoading || invoiceStatusLoading}
            width='150px'
            type='submit'
            name={'Approve'}
            onClick={() => handleStatus()}
            className='mb-75'
          ></SaveButton>
          <SaveButton
            block
            // disabled={status === 'Deny'}
            color='secondary'
            outline
            width='150px'
            type='submit'
            name={'Deny'}
            onClick={() => {
              setChangeStatusModal({ toggle: true, status: 'Deny' });
            }}
            className='mb-75'
          ></SaveButton>
          <SaveButton
            block
            // disabled={status === 'Discuss'}
            color='secondary'
            outline
            width='150px'
            type='submit'
            name={'Discuss'}
            onClick={() => {
              setChangeStatusModal({ toggle: true, status: 'Discuss' });
            }}
            className='mb-75'
          ></SaveButton>
          <SaveButton
            block
            // disabled={status === 'RequestChanges'}
            color='secondary'
            outline
            width='150px'
            type='submit'
            name={'Request Changes'}
            onClick={() => {
              setChangeStatusModal({ toggle: true, status: 'RequestChanges' });
            }}
            className='mb-75'
          ></SaveButton>
        </CardBody>
      </Card>
      {openModal && (
        <SendTestQuoteInvoiceModal
          loading={sendTestInvoiceLoading || sendTestQuoteLoading}
          openModal={openModal}
          setOpenModal={(toggle) => {
            if (!toggle) {
              setCurrentEmails([]);
            }
            setOpenModal(toggle);
          }}
          handleEmails={handleEmails}
          showError={showError}
          currentEmails={currentEmails}
          sendTestInvoice={async () => {
            const result = await showWarnAlert({
              title: 'Are you sure?',
              text: `Are you sure you want to send this ${
                type === 'Invoice' ? 'invoice' : 'quote'
              }?`,
            });
            if (result.value) {
              if (type === 'Invoice') {
                sendTestInvoiceFunc();
              } else {
                sendTestQuoteFunc();
              }
            }
          }}
          setShowError={setShowError}
        />
      )}

      {changeStatusModal.toggle && (
        <ChangeBillStatusHistoryModal
          statusHistoryData={statusHistoryData}
          setStatusHistoryData={setStatusHistoryData}
          recordId={id}
          openModal={changeStatusModal.toggle}
          setOpenModal={(toggle) =>
            setChangeStatusModal({ ...changeStatusModal, toggle })
          }
          setData={setData}
          status={changeStatusModal.status}
          type={type === 'Invoice' ? 'Invoice' : 'Quote'}
          notes={notes}
        />
      )}
    </>
  );
};

export default PreviewActions;
