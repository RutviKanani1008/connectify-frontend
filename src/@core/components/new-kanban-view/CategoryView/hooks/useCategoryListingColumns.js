import React, { useMemo } from 'react';

import { Edit2, Eye, Trash } from 'react-feather';
import { Input, UncontrolledTooltip } from 'reactstrap';

const useCategoryListingColumns = ({
  category,
  onEditStage,
  onEditCategoryStatus,
  onViewDeleteCategory,
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: 'Name',
        minWidth: '250px',
        searchKey: 'categoryName',
        selector: (row) => row?.categoryName,
        isSearchable: true,
      },
      {
        name: 'Status',
        cell: (row) => {
          return (
            <>
              {row?._id !== 'unassignedItem' ? (
                <>
                  <div className='switch-checkbox' id={`category_${row?._id}`}>
                    <Input
                      key={row?.active}
                      type='switch'
                      label='category'
                      name='category'
                      disabled={row?.isExist}
                      defaultChecked={row?.active}
                      onChange={(e) => {
                        // Todo
                        if (!row?.isExist) {
                          onEditCategoryStatus(e, row);
                        }
                      }}
                    />
                    <span className='switch-design'></span>
                  </div>
                  <UncontrolledTooltip
                    placement='top'
                    target={`category_${row?._id}`}
                  >
                    {row?.isExist
                      ? 'This category contain one or more contacts. so you cannot change category of this category.'
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
              {row?._id !== 'unassignedItem' ? (
                <>
                  <div className='action-btn edit-btn'>
                    <Edit2
                      className={'cursor-pointer'}
                      size={15}
                      onClick={() => {
                        onEditStage({ id: row?._id });
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
                      <div className='action-btn delete-btn'>
                        <Eye
                          size={15}
                          className={'cursor-pointer'}
                          onClick={() => {
                            onViewDeleteCategory(row);
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
                  <>
                    <div className='action-btn delete-btn'>
                      <Trash
                        color={'red'}
                        className={'cursor-pointer'}
                        size={15}
                        onClick={() => {
                          onViewDeleteCategory(row, true);
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
                </>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [category]);

  return { columns };
};

export default useCategoryListingColumns;
