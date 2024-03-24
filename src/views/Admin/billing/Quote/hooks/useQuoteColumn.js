//  ** External packages **
import { Copy, Edit2, Eye, Send, Trash } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { Badge, UncontrolledTooltip } from 'reactstrap';

// ** hooks **
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

// ** others
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';

import {
  displayDateByCompanyFormate,
  getCurrentUser,
} from '../../../../../helper/user.helper';
import { selectBadge } from '../components/QuoteCard';
import { useCloneQuote } from './quoteApis';

export const useQuoteColumns = ({
  sendQuoteLoading,
  sendQuote,
  reloadQuote,
}) => {
  const user = getCurrentUser();
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

  const quoteColumns = ({ handleDelete }) => [
    {
      name: 'QuoteId',
      minWidth: '100px',
      sortable: (row) => row?.quoteId,
      selector: (row) => row?.quoteId,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>#{row?.quoteId}</span>
          </div>
        );
      },
    },
    {
      name: 'Customer Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.customer,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{`${row?.customer.firstName} ${row?.customer.lastName}`}</span>
          </div>
        );
      },
    },
    {
      name: 'Quote Date',
      sortable: true,
      selector: (row) => row?.quoteDate,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {displayDateByCompanyFormate(row.quoteDate)}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Expiry Date',
      sortable: true,
      selector: (row) => row?.expiryDate,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {displayDateByCompanyFormate(row.expiryDate)}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Payment Status',
      minWidth: '250px',
      selector: (row) => row?.status,
      cell: (row) => {
        return (
          <Badge
            className='ms-1'
            color={`light-${selectBadge(row.status)}`}
            pill
          >
            {row.status}
          </Badge>
        );
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='d-flex'>
            <Copy
              color='#a3db59'
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => cloneQuoteDetail(row._id)}
              id={`clone_${row._id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`clone_${row._id}`}
            >
              Clone Quote
            </UncontrolledTooltip>
            <Send
              color='#a3db59'
              size={15}
              className={
                sendQuoteLoading
                  ? 'cursor-not-allowed me-1'
                  : 'cursor-pointer me-1'
              }
              onClick={() =>
                !sendQuoteLoading && sendQuote(row.slug, 'Sending quote...')
              }
              id={`send_quote_${row._id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`send_quote_${row._id}`}
            >
              Send Quote
            </UncontrolledTooltip>
            <Eye
              color='#a3db59'
              size={15}
              className='cursor-pointer me-1'
              onClick={() => {
                history.push(`${basicRoute}/quote/preview/${row.slug}`);
              }}
              id={`view_quote_${row._id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`view_quote_${row._id}`}
            >
              Preview Quote
            </UncontrolledTooltip>
            {!row?.archived && (
              <>
                <Edit2
                  color={'#64c664'}
                  size={15}
                  className='cursor-pointer me-1'
                  onClick={() => {
                    history.push(`${basicRoute}/quote/${row?._id}`);
                  }}
                  id={`edit_${row?._id}`}
                ></Edit2>
                <UncontrolledTooltip
                  placement='top'
                  target={`edit_${row?._id}`}
                >
                  Edit
                </UncontrolledTooltip>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Trash
                  color='red'
                  size={15}
                  className='cursor-pointer me-1'
                  onClick={() => handleDelete(row?._id)}
                  id={`delete_${row?._id}`}
                ></Trash>
                <UncontrolledTooltip
                  placement='top'
                  target={`delete_${row?._id}`}
                >
                  Delete
                </UncontrolledTooltip>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return { quoteColumns };
};
