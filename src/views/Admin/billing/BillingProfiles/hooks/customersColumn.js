// ==================== Packages =======================
import { CreditCard, Eye } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
// ====================================================

export const useCustomersColumn = ({ setIsOpen }) => {
  // ========================== Hooks ================================
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();

  const customersColumns = () => [
    {
      name: 'First Name',
      minWidth: '250px',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.firstName ? row?.firstName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.lastName ? row?.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.email}</span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.phone ? row?.phone : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      maxWidth: '130px',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div>
            <>
              <CreditCard
                size={15}
                className='cursor-pointer me-1'
                onClick={() =>
                  setIsOpen({
                    toggle: true,
                    id: row._id,
                    billingCustomerId: row.billingCustomerId,
                  })
                }
                id={`p_method_${row?._id}`}
              ></CreditCard>
              <UncontrolledTooltip
                placement='top'
                target={`p_method_${row?._id}`}
              >
                Add payment method
              </UncontrolledTooltip>
            </>
            <>
              <Eye
                color='#a3db59'
                size={15}
                className='cursor-pointer me-1'
                onClick={() =>
                  history.push(`${basicRoute}/payment-methods/${row?._id}`)
                }
                id={`p_method_view_${row?._id}`}
              ></Eye>
              <UncontrolledTooltip
                placement='top'
                target={`p_method_view_${row?._id}`}
              >
                View payment methods
              </UncontrolledTooltip>
            </>
          </div>
        );
      },
    },
  ];

  return { customersColumns };
};
