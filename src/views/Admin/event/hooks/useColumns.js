import { UncontrolledTooltip } from 'reactstrap';
import { FormField } from '@components/form-fields';

const useColumn = ({ errors, getValues, control, setValue }) => {
  const columns = [
    {
      name: 'Name',
      minWidth: '400px',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.firstName || row?.lastName
            ? `${row?.firstName} ${row?.lastName}`
            : '-'}
        </span>
      ),
    },
    {
      name: 'Email',
      minWidth: '400px',
      cell: (row) => <span className='text-capitalize'>{`${row?.email}`}</span>,
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
      name: 'Group Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.group?.id?.groupName ? row?.group?.id?.groupName : '-'}
            </span>
          </div>
        );
      },
    },
  ];

  const inviteContactColumn = [
    ...columns,
    {
      name: 'Action',
      minWidth: '250px',
      maxWidth: '300px',
      allowOverflow: true,
      cell: (row, index) => {
        return (
          <div className='text-primary d-flex mt-md-0'>
            <div className='contact-card-checkbox' id={`invite_${index}`}>
              <FormField
                key={getValues(`${row?._id}`)}
                type='checkbox'
                error={errors}
                control={control}
                name={row?._id}
                defaultValue={getValues(`${row?._id}`)}
                onChange={(e) => {
                  setValue(`${row?._id}`, e.target.checked);
                }}
              />
            </div>
            <UncontrolledTooltip placement='top' target={`invite_${index}`}>
              Mark as invite
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  const invitedContactColumns = [
    ...columns,
    {
      name: 'Action',
      minWidth: '250px',
      maxWidth: '300px',
      allowOverflow: true,
      cell: (row, index) => {
        return (
          <div className='text-primary d-flex mt-md-0'>
            <div className='contact-card-checkbox' id={`attend_${index}`}>
              <FormField
                key={getValues(`${row._id}`)}
                type='checkbox'
                error={errors}
                control={control}
                name={row._id}
                defaultValue={getValues(`${row._id}`)}
                onChange={(e) => {
                  setValue(`${row._id}`, e.target.checked);
                }}
              />
            </div>
            <UncontrolledTooltip placement='top' target={`attend_${index}`}>
              Mark as attend
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  const otherContactColumns = [
    ...columns,
    {
      name: 'Action',
      minWidth: '250px',
      maxWidth: '300px',
      allowOverflow: true,
      cell: (row, index) => {
        return (
          <div className='text-primary d-flex mt-md-0'>
            <div className='contact-card-checkbox' id={`unattend_${index}`}>
              <FormField
                key={getValues(`${row._id}`)}
                type='checkbox'
                error={errors}
                control={control}
                name={row._id}
                defaultValue={getValues(`${row._id}`)}
                onChange={(e) => {
                  setValue(`${row._id}`, e.target.checked);
                }}
              />
            </div>

            <UncontrolledTooltip placement='top' target={`unattend_${index}`}>
              Mark as unattend
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  return { inviteContactColumn, otherContactColumns, invitedContactColumns };
};

export default useColumn;
