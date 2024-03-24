// ==================== Packages =======================
import { Copy, Edit2, Link as LinkIcon, Send, Trash, Eye } from 'react-feather';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useHistory } from 'react-router-dom';
import { displayDateByCompanyFormate } from '../../../../../helper/user.helper';
import { useCloneInvoice } from '../hooks/invoiceApis';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import { paymentStatus } from '../../../../../constant';

export const selectBadge = (type) => {
  switch (type) {
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'pending':
      return 'warning';
    case 'draft':
      return 'primary';
  }
};

const InvoiceCard = ({
  item,
  handleDelete,
  sendInvoice,
  sendInvoiceLoading,
  reloadInvoice,
}) => {
  const {
    _id,
    dueDate,
    invoiceDate,
    invoiceId,
    customer,
    status,
    stripe_payment_link,
    slug,
  } = item;

  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const { cloneInvoice } = useCloneInvoice();

  const cloneInvoiceDetail = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to clone this invoice?',
    });
    if (result.value) {
      const { data } = await cloneInvoice(id, 'Clone invoice...');
      if (data) {
        await reloadInvoice();
      }
    }
  };

  const handleIconCardClick = () => {
    showToast(TOASTTYPES.success, '', 'Payment link Copied');
  };

  return (
    <Card className='mb-2 invoice-card-wrapper' key={_id}>
      <CardHeader>
        <h5
          className='text-primary mass-email-card-title'
          id={`invoice_id_${_id}`}
        >
          #{invoiceId}
        </h5>
        <UncontrolledTooltip
          placement='top'
          autohide={true}
          target={`invoice_id_${_id}`}
        >
          Invoice id: {invoiceId}
        </UncontrolledTooltip>
        <div className='text-primary d-flex mt-md-0 mt-1'>
          <Copy
            key={_id}
            size={15}
            className='me-1 cursor-pointer'
            onClick={() => cloneInvoiceDetail(_id)}
            id={`clone_${_id}`}
          />
          <UncontrolledTooltip
            // key={_id}
            placement='top'
            autohide={true}
            target={`clone_${_id}`}
          >
            Clone Invoice
          </UncontrolledTooltip>

          <Send
            size={15}
            className={
              sendInvoiceLoading
                ? 'cursor-not-allowed me-1'
                : 'cursor-pointer me-1'
            }
            onClick={() =>
              !sendInvoiceLoading && sendInvoice(slug, 'Sending invoice...')
            }
            id={`send_invoice_${_id}`}
          />

          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`send_invoice_${_id}`}
          >
            Send Invoice
          </UncontrolledTooltip>
          <Eye
            size={15}
            className='cursor-pointer me-1'
            onClick={() =>
              history.push(`${basicRoute}/invoice/preview/${slug}`)
            }
            id={`view_invoice_${_id}`}
          />
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`view_invoice_${_id}`}
          >
            Preview Invoice
          </UncontrolledTooltip>
          {stripe_payment_link && stripe_payment_link?.payment_link ? (
            <>
              <CopyToClipboard text={`${stripe_payment_link?.payment_link}`}>
                <LinkIcon
                  size={15}
                  className='me-1 cursor-pointer'
                  onClick={() => handleIconCardClick()}
                  id={`copy_link_${_id}`}
                />
              </CopyToClipboard>
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`copy_link_${_id}`}
              >
                Copy Payment Link
              </UncontrolledTooltip>
            </>
          ) : null}

          {status !== 'paid' ? (
            <>
              <Edit2
                color={'#64c664'}
                size={15}
                className={`me-1 cursor-pointer`}
                onClick={() => {
                  history.push(`${basicRoute}/invoice/${_id}`);
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit Invoice
              </UncontrolledTooltip>
            </>
          ) : (
            <></>
          )}
          <Trash
            color='red'
            size={15}
            className='cursor-pointer me-1'
            onClick={() => handleDelete(_id)}
            id={`delete_${_id}`}
          ></Trash>
          <UncontrolledTooltip placement='top' target={`delete_${_id}`}>
            Delete
          </UncontrolledTooltip>
        </div>
      </CardHeader>
      <CardBody>
        <div>
          <div className='d-flex'>
            <h5 className='me-1'>Customer Name: </h5>
            <h5 className='text-primary c__ellipsis' style={{ width: '50%' }}>
              {`${customer?.firstName} ${customer?.lastName}`}
            </h5>
          </div>
          <div className='d-flex'>
            <h5 className='me-2 date-label'>Invoice Date: </h5>
            <h5 className='text-primary'>
              {displayDateByCompanyFormate(invoiceDate)}
            </h5>
          </div>
          <div className='d-flex'>
            <h5 className='me-2 date-label'>Due Date: </h5>
            <h5 className='text-primary'>
              {displayDateByCompanyFormate(dueDate)}
            </h5>
          </div>
        </div>
        <div className=''>
          <span className='text-primary h5'>Payment Status: </span>
          <Badge className='ms-1' color={`light-${selectBadge(status)}`} pill>
            {paymentStatus[status]}
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
};

export default InvoiceCard;
