import React, { forwardRef } from 'react';
// import { Row } from 'reactstrap';
// import parse from 'html-react-parser';

// import { CheckSquare, Square } from 'react-feather';
// import { Card, CardTitle } from 'reactstrap';

const PrintTask = forwardRef((props, ref) => {
  const { data } = props;
  PrintTask.displayName = 'TaskPrint';

  return (
    <div ref={ref}>
      <div>
        {/* <Row>
          <Col md={2} className='h5'>
            Task Number
          </Col>
          <Col md={6} className='h5'>
            Name
          </Col>
          <Col md={4} className='h5'>
            Contact
          </Col>
        </Row> */}
        <table style={{width:'96%', margin:'0px auto'}}>
          <tr>
            <th
              style={{ width: '20%', textAlign: 'left', fontSize:'16px', color:'black', fontWeight:'700', paddingRight: '10px', }}
            >
              Task Number
            </th>
            <th style={{ width: '50%', textAlign: 'left', fontSize:'16px', color:'black', fontWeight:'700', paddingLeft: '10px', paddingRight: '10px', }}>Name</th>
            <th
              style={{ width: '30%', textAlign: 'left', fontSize:'16px', color:'black', fontWeight:'700', paddingLeft: '10px', }}
            >
              Contact
            </th>
          </tr>

          {data?.length > 0 &&
            data
              ?.sort(
                ({ snoozeUntil: a }, { snoozeUntil: b }) =>
                  (b === null) - (a === null) || b - a
              )
              ?.map((task) => {
                return (
                  <>
                    <tr>
                      <td
                        style={{
                          width: '20%',
                          textAlign: 'left',
                          borderBottom: '1px solid #dbdbdb',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          paddingRight: '10px',
                          fontSize:'16px', 
                          color:'grey', 
                          fontWeight:'400'
                        }}
                      >
                        #{task?.taskNumber}
                      </td>
                      <td
                        style={{
                          width: '50%',
                          textAlign: 'left',
                          borderBottom: '1px solid #dbdbdb',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          fontSize:'16px', 
                          color:'grey', 
                          fontWeight:'400'
                        }}
                      >
                        {task?.name}
                      </td>
                      <td
                        style={{
                          width: '30%',
                          textAlign: 'left',
                          borderBottom: '1px solid #dbdbdb',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          paddingLeft: '10px',
                          fontSize:'16px', 
                          color:'grey', 
                          fontWeight:'400'
                        }}
                      >
                        {task?.contact && (
                          <>
                            {task?.contact?.firstName} {task?.contact?.lastName}
                          </>
                        )}
                      </td>
                    </tr>
                  </>
                );
              })}
        </table>
      </div>
    </div>
  );
});

export default PrintTask;
