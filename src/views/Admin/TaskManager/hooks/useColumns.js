const useColumn = () => {
  const columns = [
    {
      name: 'Name',
      minWidth: '400px',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      cell: (row) => (
        <span className='text-capitalize'>
          {row?.name ? `${row?.name}` : '-'}
        </span>
      ),
    },
    {
      name: 'Current Status',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.status?.label,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.status?.label ? row?.status?.label : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Current Priority',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.priority?.label,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.priority?.label ? row?.priority?.label : '-'}
            </span>
          </div>
        );
      },
    },
  ];

  return { columns };
};

export default useColumn;
