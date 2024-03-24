import { UncontrolledTooltip } from 'reactstrap';
import { FormField } from '@components/form-fields';

export const useContactColumn = ({
  errors,
  getValues,
  control,
  setValue,
  mode,
}) => {
  const contactsColumns = [
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
  ];

  if (mode === 'edit') {
    contactsColumns.push({
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
                defaultValue={getValues(`${row?._id}`) ? true : false}
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
    });
  }

  return { contactsColumns };
};

export default useContactColumn;
