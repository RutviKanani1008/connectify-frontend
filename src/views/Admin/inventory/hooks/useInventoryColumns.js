import { Edit2, Printer } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { getCurrentUser } from '../../../../helper/user.helper';

const useInventoryColumns = ({
 
  handlePrintBarcode,
}) => {
  /** hook */
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();
  const user = getCurrentUser();
  const columns = [
    {
      name: 'Product Name',
      minWidth: '250px',
      sortField: 'title',
      sortable: true,
      selector: (row) => row?.title,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.title ? row?.title : '-'}
            </span>
            {((user.inventoryRole === 'productDetailUser' || user.inventoryRole === 'storageUser') && row.productStatus === 1) &&
              <span className="orange-dot"></span>
            }
            {((user.inventoryRole === 'productDetailUser') && row.productStatus === 2) &&
              <span className="orange-dot"></span>
            }
          </div>
        );
      },
    },
    {
      name: 'Category',
      sortable: true,
      minWidth: '250px',
      sortField: 'category',
      selector: (row) => row?.category[0]?.name,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.category?.[0] ? row?.category[0]?.name : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Quantity',
      sortable: true,
      minWidth: '250px',
      sortField: 'quantity',
      selector: (row) => row?.quantity,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.quantity ? row.quantity : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Price',
      sortable: true,
      minWidth: '250px',
      sortField: 'price',
      selector: (row) => row?.price,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.price ? `$${row?.price}` : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Sale Price',
      sortable: true,
      minWidth: '250px',
      sortField: 'salePrice',
      selector: (row) => row?.salePrice,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.salePrice ? `$${row?.salePrice}` : '-'}
            </span>
          </div>
        );
      },
    },

    {
      name: 'Created By',
      sortable: true,
      minWidth: '250px',
      sortField: 'createdBy',
      selector: (row) => row?.category[0]?.name,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.createdBy?.[0]
                ? `${row?.createdBy[0]?.firstName}` +
                  ' ' +
                  `${row?.createdBy[0]?.lastName}`
                : '-'}
            </span>
          </div>
        );
      },
    },
       {
      name: 'Created At',
      sortable: true,
      minWidth: '250px',
      sortField: 'createdAt',
      selector: (row) => row?.category[0]?.name,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/product-details/${row?._id}`)
              }
            >
              {row?.createdAt
                ?  `${moment(new Date(row.createdAt)).format(
                    'MM/DD/YYYY, HH:mm A'
                  )}`
                : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            {!row?.archived && (
              <>
                <div className='action-btn edit-btn'>
                  <Edit2
                    // color={'#64c664'}
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      history.push(`${basicRoute}/product/${row?._id}`);
                    }}
                    id={`edit_${row?._id}`}
                  ></Edit2>
                  <UncontrolledTooltip
                    placement='top'
                    target={`edit_${row?._id}`}
                  >
                    Edit
                  </UncontrolledTooltip>
                </div>
                <div className='action-btn print-btn'>
                  <Printer
                    className='cursor-pointer'
                    onClick={() => {
                      handlePrintBarcode(row?._id);
                    }}
                    id={`printer_${row?._id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    target={`printer_${row?._id}`}
                  >
                    Print Barcode
                  </UncontrolledTooltip>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];
  return { columns };
};

export default useInventoryColumns;
