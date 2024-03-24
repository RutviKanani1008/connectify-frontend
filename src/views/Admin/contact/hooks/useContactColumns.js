import { Archive, Edit2, Trash } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const useContactColumns = ({
  handleConfirmDeleteAndArchive,
  user,
  showActions = true,
}) => {
  // ** Hooks
  const history = useHistory();
  // ** CUstom Hooks
  const { basicRoute } = useGetBasicRoute();

  const columns = [
    {
      name: 'First Name',
      minWidth: '180px',
      sortField: 'firstName',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.firstName ? row?.firstName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '180px',
      sortField: 'lastName',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.lastName ? row?.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Company',
      sortable: true,
      minWidth: '140px',
      sortField: 'company_name',
      selector: (row) => row?.company,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.company_name ? row?.company_name : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Website',
      sortable: true,
      minWidth: '180px',
      sortField: 'company_name',
      selector: (row) => row?.website,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.website ? row?.website : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Group Name',
      sortable: true,
      minWidth: '180px',
      sortField: 'group.groupName',
      selector: (row) => row?.group?.groupName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.group?.groupName ? row?.group?.groupName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '220px',
      sortField: 'email',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
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
      minWidth: '150px',
      sortField: 'phone',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.phone ? row?.phone : '-'}
            </span>
          </div>
        );
      },
    },
    {
      ...(showActions && {
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
                        history.push(`${basicRoute}/contact/${row?._id}`);
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
                </>
              )}

              {['admin', 'superadmin'].includes(user?.role) && (
                <>
                  <div className='action-btn archive-btn'>
                    <Archive
                      size={15}
                      className='cursor-pointer'
                      onClick={() =>
                        handleConfirmDeleteAndArchive(
                          row?._id,
                          row?.archived,
                          row?.userId
                        )
                      }
                      id={`archive_${row?._id}`}
                    />

                    <UncontrolledTooltip
                      key={`archive_${row?._id}`}
                      placement='top'
                      target={`archive_${row?._id}`}
                    >
                      {row?.archived ? 'Active' : 'Archive'}
                    </UncontrolledTooltip>
                  </div>

                  {row?.archived && (
                    <>
                      <div className='action-btn delete-btn'>
                        <Trash
                          color='red'
                          size={15}
                          className='cursor-pointer'
                          onClick={() =>
                            handleConfirmDeleteAndArchive(row?._id)
                          }
                          id={`delete_${row?._id}`}
                        />
                        <UncontrolledTooltip
                          placement='top'
                          target={`delete_${row?._id}`}
                        >
                          Delete
                        </UncontrolledTooltip>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          );
        },
      }),
    },
  ];

  return { columns };
};

export default useContactColumns;
