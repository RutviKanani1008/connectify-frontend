import { Eye } from 'react-feather';

import { UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const useColumn = () => {
  const { basicRoute } = useGetBasicRoute();
  const columns = [
    {
      name: 'Name',
      selector: (row) => row?.name,
      cell: (row) => <span>{row.name}</span>,
    },
    {
      name: 'Start Date',
      selector: (row) => row?.start,
      cell: (row) => <span>{new Date(row?.start).toLocaleString()}</span>,
    },
    {
      name: 'End Date',
      selector: (row) => row?.end,
      cell: (row) => {
        return (
          <div>
            <span>{new Date(row?.end).toLocaleString()}</span>
          </div>
        );
      },
    },
    {
      name: 'Action',
      allowOverflow: true,
      maxWidth: '100px',
      cell: (row, index) => {
        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn'>
              <Eye
                size={15}
                className={'cursor-pointer'}
                onClick={() => {
                  window.open(
                    `${basicRoute}/event?eventID=${row._id}`,
                    '_blank'
                  );
                }}
                id={`view_${index}`}
              ></Eye>
              <UncontrolledTooltip placement='top' target={`view_${index}`}>
                View Event
              </UncontrolledTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  return { columns };
};

export default useColumn;
