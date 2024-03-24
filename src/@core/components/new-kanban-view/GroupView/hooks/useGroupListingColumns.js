import { useMemo } from 'react';

import { Edit2, Eye, Trash } from 'react-feather';
import { Input, UncontrolledTooltip } from 'reactstrap';

const useGroupListingColumns = ({
  groups,
  onEditStage,
  onEditGroupStatus,
  onViewDeleteGroup,
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: 'Name',
        searchKey: 'groupName',
        minWidth: '250px',
        selector: (row) => row?.groupName,
        isSearchable: true,
      },
      {
        name: 'Status',
        cell: (row) => {
          return (
            <>
              {row?.groupCode !== 'unAssigned' && (
                <>
                  <div className='switch-checkbox' id={`status_${row?._id}`}>
                    <Input
                      key={row?.active}
                      type='switch'
                      label='Group'
                      name='status'
                      disabled={row?.isExist}
                      defaultChecked={row?.active}
                      onChange={(e) => {
                        // Todo
                        if (!row?.isExist) {
                          onEditGroupStatus(e, row);
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
                      ? 'This group contain one or more contacts. so you cannot change status of this group.'
                      : row?.active
                      ? 'Deactivate'
                      : 'Activate'}
                  </UncontrolledTooltip>
                </>
              )}
            </>
          );
        },
      },
      {
        name: 'Actions',
        cell: (row) => {
          return (
            <div className='action-btn-wrapper'>
              {row?.groupCode !== 'unAssigned' && (
                <>
                  <div className='action-btn edit-btn'>
                    <Edit2
                      size={15}
                      className='cursor-pointer'
                      onClick={() => onEditStage({ id: row?._id })}
                      id={`edit_${row?._id}`}
                    />
                    <UncontrolledTooltip
                      placement='top'
                      target={`edit_${row?._id}`}
                    >
                      Edit
                    </UncontrolledTooltip>
                  </div>
                  <div className='action-btn delete-btn'>
                    <Eye
                      size={15}
                      className='cursor-pointer'
                      onClick={() => onViewDeleteGroup(row)}
                      id={`view_${row?._id}`}
                    ></Eye>
                    <UncontrolledTooltip
                      placement='top'
                      target={`view_${row?._id}`}
                    >
                      View Contacts
                    </UncontrolledTooltip>
                  </div>

                  <>
                    <div className='action-btn delete-btn'>
                      <Trash
                        color={'red'}
                        size={15}
                        className={'cursor-pointer'}
                        onClick={() => onViewDeleteGroup(row, true)}
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
                </>
              )}
            </div>
          );
        },
      },
    ];
  }, [groups]);

  return { columns };
};

export default useGroupListingColumns;
