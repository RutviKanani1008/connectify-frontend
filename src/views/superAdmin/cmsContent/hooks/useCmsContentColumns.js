import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

const useCmsContentColumn = ({
  setAddOrUpdateCmsContent,
  handleDeleteCmsContent,
}) => {
  const columns = [
    {
      name: 'Title',
      minWidth: '250px',
      sortField: 'title',
      sortable: true,
      selector: (row) => row?.text,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.title ? row?.title : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Content',
      minWidth: '250px',
      sortField: 'content',
      sortable: true,
      selector: (row) => row?.text,
      cell: (row) => {
        return (
          <div className='user-list-first-name'>
            <div
              dangerouslySetInnerHTML={{
                __html: row?.content,
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
      selector: (row) => row?.page.pageName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
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
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  setAddOrUpdateCmsContent({
                    isModalOpen: true,
                    cmsContent: {
                      ...row,
                      page: {
                        ...row.page,
                        label: row.page?.pageName,
                        value: row?.page?._id,
                      },
                    },
                  });
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
                  handleDeleteCmsContent(row?._id);
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

export default useCmsContentColumn;
