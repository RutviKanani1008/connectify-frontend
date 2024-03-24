import { useEffect, useState } from 'react';
import XLSX from 'xlsx';

import TableResponsive from '../data-table/TableResponsive';
// const CsvFileViewer = ({ url }) => {
//   //State to store table Column name
//   const [tableColumns, setTableColumns] = useState([]);

//   //State to store the values
//   const [values, setValues] = useState([]);

//   const changeHandler = (url) => {
//     Papa.parse(url, {
//       header: true,
//       download: true,
//       skipEmptyLines: true,

//       // eslint-disable-next-line object-shorthand
//       complete: function (results) {
//         const rowsArray = [];
//         const valuesArray = [];
//         // Iterating data to get column name and their values
//         if (results?.data?.length) {
//           results?.data?.map((d) => {
//             rowsArray.push(Object.keys(d));
//             valuesArray.push(Object.values(d));
//           });
//           // Parsed Data Response in array format
//           setTableColumns(rowsArray[0]);

//           // Filtered Values
//           setValues(valuesArray);
//         } else {
//           setTableColumns(results?.meta?.fields ? results?.meta?.fields : []);
//         }
//       },
//     });
//   };

//   useEffect(() => {
//     if (url) {
//       changeHandler(url);
//     }
//   }, [url]);

//   return (
//     <>
//       <TableResponsive tableColumns={tableColumns} data={values} />
//       {/* <table>
//         <thead>
//           <tr>
//             {tableRows.map((rows, index) => {
//               return <th key={index}>{rows}</th>;
//             })}
//           </tr>
//         </thead>
//         <tbody>
//           {values.map((value, index) => {
//             return (
//               <tr key={index}>
//                 {value.map((val, i) => {
//                   return <td key={i}>{val}</td>;
//                 })}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table> */}
//     </>
//   );
// };

const CsvFileViewer = ({ url }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      const arraybuffer = xhr.response;
      const data = new Uint8Array(arraybuffer);
      const arr = [];
      for (let i = 0; i !== data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (url.endsWith('.csv')) {
        // setFileType('csv');
        setData(jsonData);
      } else if (url.endsWith('.xlsx') || url.endsWith('.xls')) {
        // setFileType('xlsx');
        setData(jsonData);
      } else {
        console.error('Unsupported file type');
      }
    };
    xhr.send();
  }, [url]);

  return (
    <div>
      <TableResponsive tableColumns={data[0]} data={data.splice(1)} />
    </div>
  );
};

export default CsvFileViewer;
