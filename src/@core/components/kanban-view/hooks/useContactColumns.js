export const useContactColumn = () => {
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
  return { contactsColumns };
};

export default useContactColumn;
