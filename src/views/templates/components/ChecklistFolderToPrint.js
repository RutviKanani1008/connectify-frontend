import React, { forwardRef } from 'react';
import parse from 'html-react-parser';

import { CheckSquare, Square } from 'react-feather';
import { Card, CardTitle } from 'reactstrap';

const ChecklistFolderToPrint = forwardRef((props, ref) => {
  const { data, folderId, allFolders } = props;

  const currentFolder = (allFolders || []).find((f) => f._id === folderId);

  ChecklistFolderToPrint.displayName = 'ChecklistFolderToPrint';

  return (
    <div ref={ref}>
      {currentFolder ? (
        <div>
          <h3 className='text-primary'>{currentFolder?.folderName || ''}</h3>

          {data?.map((template) => {
            return (
              <Card
                style={{ marginTop: '15px', padding: '10px' }}
                key={template?._id}
              >
                <CardTitle>
                  <span className='text-primary'>{template.name}</span>
                </CardTitle>

                {(template?.checklist || []).map((checklist) => (
                  <div key={checklist?._id}>
                    <div style={{ marginTop: '10px' }} className='d-flex mt-1'>
                      <span style={{ marginRight: '2px' }}>
                        {' '}
                        {checklist.checked && <CheckSquare />}
                        {!checklist.checked && <Square />}
                      </span>
                      {checklist.title || ''}
                    </div>

                    {checklist?.details && (
                      <div style={{ margin: '5px 0' }}>
                        <span> Description:</span>
                        <div>{parse(checklist?.details)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      ) : (
        <>{''}</>
      )}
    </div>
  );
});

export default ChecklistFolderToPrint;
