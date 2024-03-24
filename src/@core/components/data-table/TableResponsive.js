// ** Reactstrap Imports
import { Table } from 'reactstrap';

const TableResponsive = ({ tableColumns, data }) => {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th scope='col' className='text-nowrap'>
            #
          </th>
          {tableColumns && tableColumns.length > 0
            ? tableColumns.map((columnName, index) => (
                <th scope='col' className='text-nowrap' key={index}>
                  {columnName}
                </th>
              ))
            : null}
        </tr>
      </thead>
      <tbody>
        {data.length > 0
          ? data?.map((row, index) => (
              <tr key={index}>
                <td className='text-nowrap'>{index}</td>
                {row.map((field, index) => (
                  <td className='text-nowrap' key={index}>
                    {field}
                  </td>
                ))}
              </tr>
            ))
          : null}
      </tbody>
    </Table>
  );
};

export default TableResponsive;
