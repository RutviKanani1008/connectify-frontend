/* eslint-disable no-unused-vars */
import moment from 'moment';
import { useState } from 'react';
import { Edit2, Trash } from 'react-feather';
import { Spinner, UncontrolledTooltip } from 'reactstrap';

const useTaskTimerColumn = ({
  deleteLoader,
  handleRowEdit,
  handleRowDelete,
}) => {
  let timer = 0;

  const [currentDelete, setCurrentDelete] = useState(null);

  const columns = [
    {
      name: 'Started At',
      minWidth: '170px',
      // sortable: (row) => row?.startedAt,
      selector: (row) => row?.startedAt,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.startedAt
            ? `${moment(
                moment.duration(Number(row?.startedAt)).asMilliseconds()
              ).format('MM/DD/yyyy hh:mm A')}`
            : '-'}
        </span>
      ),
    },
    {
      name: 'Started By',
      minWidth: '170px',
      // sortable: (row) => row?.startedAt,
      selector: (row) => row?.startedBy,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.startedBy &&
          (row?.startedBy?.firstName || row?.startedBy?.lastName)
            ? `${row?.startedBy?.firstName} ${row?.startedBy?.lastName}`
            : `${row?.startedBy?.email}`}
        </span>
      ),
    },
    {
      name: 'Ended At',
      minWidth: '170px',
      // sortable: (row) => row?.startedAt,
      selector: (row) => row?.endedAt,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.endedAt
            ? `${moment(
                moment.duration(Number(row?.endedAt)).asMilliseconds()
              ).format('MM/DD/yyyy hh:mm A')}`
            : '-'}
        </span>
      ),
    },
    {
      name: 'Ended By',
      minWidth: '170px',
      // sortable: (row) => row?.startedAt,
      selector: (row) => row?.endedBy,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.endedBy && (row?.endedBy?.firstName || row?.endedBy?.lastName)
            ? `${row?.endedBy?.firstName} ${row?.endedBy?.lastName}`
            : `Ongoing`}
        </span>
      ),
    },
    {
      name: 'Time Spend',
      minWidth: '170px',
      // sortable: (row) => row?.startedAt,
      selector: (row) => row?.totalTime,
      cell: (row) => {
        const hours = Math.floor((row?.totalTime || 0) / 3600000);

        const remainingMilliseconds = (row?.totalTime || 0) % 3600000;
        const minutes = Math.floor(remainingMilliseconds / 60000);
        const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return (
          <span className='text-capitalize'>
            {row?.totalTime ? formattedTime : '-'}
          </span>
        );
      },
    },
    {
      name: 'Accumulated Time Spent',
      minWidth: '170px',
      selector: (row) => row?.totalTime,
      cell: (row) => {
        timer = timer + (row?.totalTime || 0);

        const hours = Math.floor((timer || 0) / 3600000);

        const remainingMilliseconds = (timer || 0) % 3600000;
        const minutes = Math.floor(remainingMilliseconds / 60000);
        const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return (
          <span className='text-capitalize'>{timer ? formattedTime : '-'}</span>
        );
      },
    },

    {
      name: 'Note',
      minWidth: '250px',
      // sortable: (row) => row?.startedAt,
      selector: (row) => row?.note,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.note ? <>{row?.note}</> : '-'}
        </span>
      ),
    },

    {
      name: '',
      minWidth: '100px',
      cell: (row) => {
        return (
          <>
            <div className='action-btn-wrapper'>
              {row?.endedBy &&
              (row?.endedBy?.firstName || row?.endedBy?.lastName) ? (
                <div className='action-btn edit-btn'>
                  <>
                    <Edit2
                      size={15}
                      className='cursor-pointer'
                      onClick={() => {
                        handleRowEdit(row?._id);
                      }}
                      id={`edit_${row?._id}`}
                    />
                    <UncontrolledTooltip
                      placement='top'
                      target={`edit_${row?._id}`}
                    >
                      Edit
                    </UncontrolledTooltip>
                  </>
                </div>
              ) : (
                <div className='action-btn' />
              )}
              <div className='action-btn delete-btn'>
                {deleteLoader && row?._id === currentDelete ? (
                  <Spinner size='sm' />
                ) : (
                  <Trash
                    color='red'
                    size={15}
                    className='cursor-pointer'
                    onClick={async () => {
                      try {
                        setCurrentDelete(row?._id);
                        await handleRowDelete(row?._id);
                        setCurrentDelete(null);
                      } catch (error) {
                        setCurrentDelete(null);
                      }
                    }}
                    id={`delete_${row?._id}`}
                  />
                )}
              </div>
            </div>
          </>
        );
      },
    },
  ];

  return { columns };
};

export default useTaskTimerColumn;
