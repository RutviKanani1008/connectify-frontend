import { useMemo } from 'react';
import { Edit2, Eye, Trash } from 'react-feather';
import { Input, UncontrolledTooltip } from 'reactstrap';

const useStatusListingColumns = ({
  status,
  onEditStage,
  onEditStageStatus,
  onViewDeleteStatus,
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: 'Name',
        minWidth: '250px',
        searchKey: 'statusName',
        selector: (row) => row?.statusName,
        isSearchable: true,
      },
      {
        name: 'Status',
        cell: (row) => {
          return (
            <>
              {row?._id !== 'unassignedItem' ? (
                <>
                  <div className='switch-checkbox' id={`status_${row?._id}`}>
                    <Input
                      key={row?.active}
                      className='cursor-pointer'
                      type='switch'
                      label='Status'
                      name='status'
                      disabled={row?.isExist}
                      defaultChecked={row?.active}
                      onChange={(e) => {
                        if (!row?.isExist) {
                          onEditStageStatus(e, row);
                        }
                      }}
                    />
                    <span className='switch-design'></span>
                  </div>
                  <UncontrolledTooltip
                    placement='top'
                    target={`status_${row?._id}`}
                  >
                    {row?.isExist
                      ? 'This status contain one or more contacts. so you cannot change status.'
                      : row?.active
                      ? 'Deactivate'
                      : 'Activate'}
                  </UncontrolledTooltip>
                </>
              ) : null}
            </>
          );
        },
      },
      {
        name: 'Actions',
        cell: (row) => {
          return (
            <div className='action-btn-wrapper'>
              {row._id !== 'unassignedItem' ? (
                <>
                  <div className='action-btn edit-btn'>
                    <Edit2
                      size={15}
                      className={'cursor-pointer'}
                      onClick={() => {
                        onEditStage({ id: row?._id, data: row });
                      }}
                      id={`edit_${row?._id}`}
                    />
                    <UncontrolledTooltip
                      placement='top'
                      target={`edit_${row?._id}`}
                    >
                      Edit
                    </UncontrolledTooltip>
                  </div>
                  {row && row._id && (
                    <>
                      <div className='action-btn view-btn'>
                        <Eye
                          size={15}
                          className={'cursor-pointer'}
                          onClick={() => {
                            onViewDeleteStatus(row);
                          }}
                          id={`view_${row?._id}`}
                        ></Eye>
                        <UncontrolledTooltip
                          placement='top'
                          target={`view_${row?._id}`}
                        >
                          View Contacts
                        </UncontrolledTooltip>
                      </div>
                    </>
                  )}

                  <div className='action-btn delete-btn'>
                    <Trash
                      color={'red'}
                      size={15}
                      className={'cursor-pointer'}
                      onClick={() => {
                        onViewDeleteStatus(row, true);
                      }}
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
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [status]);

  return { columns };
};

export default useStatusListingColumns;
