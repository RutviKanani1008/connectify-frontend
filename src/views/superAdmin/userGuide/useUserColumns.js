import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import _ from 'lodash';

const useUserGuideColumn = ({
  setAddOrUpdateUserGuide,
  handleDeleteUserGuide,
}) => {
  const columns = [
    {
      name: 'Text',
      minWidth: '250px',
      sortField: 'text',
      sortable: true,
      selector: (row) => row?.text,
      cell: (row) => {
        return (
          <div className='user-list-first-name'>
            <div
              dangerouslySetInnerHTML={{
                __html: row?.text,
              }}
            ></div>
          </div>
        );
      },
    },
    {
      name: 'Page',
      sortable: true,
      minWidth: '250px',
      // sortField: 'lastName',
      selector: (row) => row?.page.pageName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              // onClick={() => history.push(`${basicRoute}/users/${row?._id}`)}
            >
              {row?.page?.pageName ? row?.page?.pageName : '-'}
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
            <div className='action-btn edit-btn'>
              <Edit2
                // color={'#64c664'}
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  setAddOrUpdateUserGuide({
                    isModalOpen: true,
                    userGuide: {
                      ...row,
                      imageAttchments: _.isArray(row?.imageAttchments)
                        ? row.imageAttchments
                        : [],
                      videoAttchments: _.isArray(row?.videoAttchments)
                        ? row.videoAttchments
                        : [],
                      page: {
                        ...row.page,
                        label: row.page?.pageName,
                        value: row?.page?._id,
                      },
                    },
                  });
                  // history.push(`${basicRoute}/users/${row?._id}`);
                }}
                id={`edit_${row?._id}`}
              ></Edit2>
              <UncontrolledTooltip placement='top' target={`edit_${row?._id}`}>
                Edit
              </UncontrolledTooltip>
            </div>
            <div className='action-btn delete-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  handleDeleteUserGuide(row?._id);
                }}
                id={`delete_${row?._id}`}
              ></Trash>
              <UncontrolledTooltip
                placement='top'
                target={`delete_${row?._id}`}
              >
                Delete
              </UncontrolledTooltip>
            </div>
          </div>
        );
      },
    },
  ];
  return { columns };
};

export default useUserGuideColumn;
