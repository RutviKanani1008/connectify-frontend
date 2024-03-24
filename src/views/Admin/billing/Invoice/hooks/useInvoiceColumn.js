// ==================== Packages =======================
import { Copy, Edit2, Send, Trash, Eye } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
// ====================================================
import {
  displayDateByCompanyFormate,
  getCurrentUser,
} from '../../../../../helper/user.helper';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import { selectBadge } from '../components/InvoiceCard';
import { useCloneInvoice } from './invoiceApis';

export const useInvoiceColumns = ({
  sendInvoiceLoading,
  sendInvoice,
  reloadInvoice,
}) => {
  const user = getCurrentUser();
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

  const invoiceColumns = ({ handleDelete }) => [
    {
      name: 'InvoiceId',
      minWidth: '100px',
      sortable: (row) => row?.invoiceId,
      selector: (row) => row?.invoiceId,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>#{row?.invoiceId}</span>
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
      name: 'Invoice Date',
      sortable: true,
      selector: (row) => row?.invoiceDate,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {displayDateByCompanyFormate(row.invoiceDate)}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Due Date',
      sortable: true,
      selector: (row) => row?.dueDate,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {displayDateByCompanyFormate(row.dueDate)}
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
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => cloneInvoiceDetail(row._id)}
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
                sendInvoiceLoading
                  ? 'cursor-not-allowed me-1'
                  : 'cursor-pointer me-1'
              }
              onClick={() =>
                !sendInvoiceLoading &&
                sendInvoice(row.slug, 'Sending invoice...')
              }
              id={`send_invoice_${row._id}`}
            />

            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`send_invoice_${row._id}`}
            >
              Send Invoice
            </UncontrolledTooltip>
            <Eye
              color='#a3db59'
              size={15}
              className='cursor-pointer me-1'
              onClick={() =>
                history.push(`${basicRoute}/invoice/preview/${row.slug}`)
              }
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
                    history.push(`${basicRoute}/invoice/${row?._id}`);
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

  return { invoiceColumns };
};
