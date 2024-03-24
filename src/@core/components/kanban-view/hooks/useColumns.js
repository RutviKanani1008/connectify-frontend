import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const useColumn = () => {
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();

  const columns = [
    {
      name: 'Title',
      minWidth: '250px',
      sortable: (row) => row?.title,
      selector: (row) => row?.title,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.title ? row?.title : '-'}
            </span>
          </div>
        );
      },
    },
    // {
    //   name: 'First Name',
    //   minWidth: '250px',
    //   sortable: (row) => row?.firstName,
    //   selector: (row) => row?.firstName,
    //   cell: (row) => {
    //     return (
    //       <div>
    //         <span
    //           className='cursor-pointer'
    //           onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
    //         >
    //           {row?.firstName ? row?.firstName : '-'}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   name: 'Last Name',
    //   sortable: true,
    //   minWidth: '250px',
    //   selector: (row) => row?.lastName,
    //   cell: (row) => {
    //     return (
    //       <div>
    //         <span
    //           className='cursor-pointer'
    //           onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
    //         >
    //           {row?.lastName ? row?.lastName : '-'}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   name: 'Group Name',
    //   sortable: true,
    //   minWidth: '250px',
    //   selector: (row) => row?.lastName,
    //   cell: (row) => {
    //     return (
    //       <div>
    //         <span
    //           className='cursor-pointer'
    //           onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
    //         >
    //           {row?.group?.id?.groupName}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   name: 'Email',
    //   sortable: true,
    //   minWidth: '250px',
    //   selector: (row) => row?.email,
    //   cell: (row) => {
    //     return (
    //       <div>
    //         <span
    //           className='cursor-pointer'
    //           onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
    //         >
    //           {row?.email}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   name: 'Phone',
    //   sortable: true,
    //   minWidth: '150px',
    //   selector: (row) => row?.phone,
    //   cell: (row) => {
    //     return (
    //       <div>
    //         <span
    //           className='cursor-pointer'
    //           onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
    //         >
    //           {row?.phone ? row?.phone : '-'}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
  ];

  return { columns };
};

export default useColumn;
