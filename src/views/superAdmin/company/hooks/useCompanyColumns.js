import { Archive, Edit2, LogIn, Trash } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { Input, Spinner, UncontrolledTooltip } from 'reactstrap';

export const useCompanyColumns = ({
  handleUpdateStatus,
  handleVirtualLogin,
  virtualLoginLoading,
  handleConfirmArchiveDelete,
  deleteLoading,
}) => {
  const history = useHistory();

  const columns = [
    {
      name: 'Name',
      sortable: (row) => row?.full_name,
      selector: (row) => row?.name,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`/companies/${row?._id}`)}
            >
              {row?.name}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`/companies/${row?._id}`)}
            >
              {row?.email}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`/companies/${row?._id}`)}
            >
              {row?.phone}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Status',
      maxWidth: '150px',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='d-flex'>
            <span className='align-middle ms-50'>
              <div className='switch-checkbox'>
                <Input
                  type='switch'
                  label='Status'
                  name='status'
                  defaultChecked={row?.status}
                  onChange={(e) => handleUpdateStatus(e, row)}
                />
                <span className='switch-design'></span>
              </div>
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
          <div className='action-btn-wrapper'>
            {!row?.archived && (
              <>
                <div
                  className='action-btn edit-btn'
                  id={`edit_${row?._id}`}
                  onClick={() => {
                    history.push(`/companies/${row?._id}`);
                  }}
                >
                  <Edit2
                    // color={'#64c664'}
                    size={15}
                    className='cursor-pointer'
                  ></Edit2>
                  <UncontrolledTooltip
                    placement='top'
                    target={`edit_${row?._id}`}
                    key={`edit_${row?._id}`}
                  >
                    Edit
                  </UncontrolledTooltip>
                </div>
                <>
                  {virtualLoginLoading === row?._id ? (
                    <div className='action-btn edit-btn'>
                      <Spinner className='' size='sm' />
                    </div>
                  ) : (
                    <>
                      <div
                        className='action-btn login-btn'
                        onClick={() => handleVirtualLogin(row?._id)}
                        id={`virtual_lo${row?._id}`}
                      >
                        <LogIn size={15} className='cursor-pointer'></LogIn>
                        <UncontrolledTooltip
                          placement='top'
                          target={`virtual_lo${row?._id}`}
                        >
                          Login as
                        </UncontrolledTooltip>
                      </div>
                    </>
                  )}
                </>
              </>
            )}

            <>
              <div
                className='action-btn archive-btn'
                onClick={() =>
                  !deleteLoading &&
                  handleConfirmArchiveDelete(row?._id, row?.archived || false)
                }
                id={`archive_${row?._id}`}
              >
                <Archive size={15} className='cursor-pointer' />

                <UncontrolledTooltip
                  key={`archive_${row?._id}`}
                  placement='top'
                  target={`archive_${row?._id}`}
                >
                  {row?.archived ? 'Active' : 'Archive'}
                </UncontrolledTooltip>
              </div>
            </>

            {row?.archived && (
              <>
                <div
                  className='action-btn archive-btn'
                  onClick={() =>
                    !deleteLoading && handleConfirmArchiveDelete(row?._id)
                  }
                  id={`delete_${row?._id}`}
                >
                  <Trash size={15} className='cursor-pointer'></Trash>
                  <UncontrolledTooltip
                    key={`delete_${row?._id}`}
                    placement='top'
                    target={`delete_${row?._id}`}
                  >
                    Delete
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
export default useCompanyColumns;
