//  ** External packages **
import { Copy, Edit2, Send, Trash, Eye } from 'react-feather';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
// ** helper **
import { displayDateByCompanyFormate } from '../../../../../helper/user.helper';

// ** api hooks **
import { useCloneQuote } from '../hooks/quoteApis';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

export const selectBadge = (type) => {
  switch (type) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'denied':
    case 'cancelled':
    case 'expired':
      return 'danger';
    case 'draft':
      return 'primary';
  }
};

const quotePaymentStatus = {
  approved: 'Approved',
  pending: 'Pending',
  denied: 'Denied',
  cancelled: 'Cancelled',
  expired: 'Expired',
  draft: 'Draft',
};

const QuoteCard = ({
  item,
  handleDelete,
  sendQuote,
  sendQuoteLoading,
  reloadQuote,
}) => {
  const { _id, expiryDate, quoteDate, quoteId, customer, status, slug } = item;

  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const { cloneQuote } = useCloneQuote();

  const cloneQuoteDetail = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to clone this Quote?',
    });
    if (result.value) {
      const { data } = await cloneQuote(id, 'Clone Quote...');
      if (data) {
        await reloadQuote();
      }
    }
  };

  return (
    <Card className='mb-2 invoice-card-wrapper'>
      <CardHeader>
        <h5
          className='text-primary mass-email-card-title'
          id={`quote_id_${_id}`}
        >
          #{quoteId}
        </h5>
        <UncontrolledTooltip
          placement='top'
          autohide={true}
          target={`quote_id_${_id}`}
        >
          Quote id: {quoteId}
        </UncontrolledTooltip>
        <div className='text-primary d-flex mt-md-0 mt-1'>
          <Copy
            size={15}
            className='me-1 cursor-pointer'
            onClick={() => cloneQuoteDetail(_id)}
            id={`clone_${_id}`}
          />
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`clone_${_id}`}
          >
            Clone Quote
          </UncontrolledTooltip>
          <Send
            size={15}
            className={
              sendQuoteLoading
                ? 'cursor-not-allowed me-1'
                : 'cursor-pointer me-1'
            }
            onClick={() =>
              !sendQuoteLoading && sendQuote(slug, 'Sending quote...')
            }
            id={`send_invoice_${_id}`}
          />

          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`send_invoice_${_id}`}
          >
            Send Quote
          </UncontrolledTooltip>
          <Eye
            size={15}
            className='cursor-pointer me-1'
            onClick={() => history.push(`${basicRoute}/quote/preview/${slug}`)}
            id={`view_quote_${_id}`}
          />
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`view_quote_${_id}`}
          >
            Preview Quote
          </UncontrolledTooltip>
          {status !== 'paid' ? (
            <>
              <Edit2
                color={'#64c664'}
                size={15}
                className={`me-1 cursor-pointer`}
                onClick={() => {
                  history.push(`${basicRoute}/quote/${_id}`);
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit Quote
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
            <h5 className='me-2 date-label'>Quote Date: </h5>
            <h5 className='text-primary'>
              {displayDateByCompanyFormate(quoteDate)}
            </h5>
          </div>
          <div className='d-flex'>
            <h5 className='me-2 date-label'>Due Date: </h5>
            <h5 className='text-primary'>
              {displayDateByCompanyFormate(expiryDate)}
            </h5>
          </div>
        </div>
        <div className=''>
          <span className='text-primary h5'>Status: </span>
          <Badge className='ms-1' color={`light-${selectBadge(status)}`} pill>
            {quotePaymentStatus[status]}
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
};

export default QuoteCard;
