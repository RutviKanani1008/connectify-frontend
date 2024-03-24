import { Fragment } from 'react';
import { ArrowRight } from 'react-feather';
import DateFormat from '../../../../../components/DateFormate';

const BillStatusHistory = ({ statusHistoryData, notes }) => {
  return (
    <div className='billing__status__history__wp'>
      {statusHistoryData.map((obj, index) => {
        return (
          <Fragment key={index}>
            <div className='mb-1'>
              <div className='d-flex flex-wrap'>
                <span className='text-primary me-1'>Status changed</span>
              </div>
              <div className='d-flex flex-wrap'>
                <span className='me-1 fw-bold'>
                  {statusHistoryData?.[index + 1]?.status
                    ? statusHistoryData?.[index + 1]?.status
                    : '-'}
                </span>
                <span className='text-primary me-1'>
                  <ArrowRight size={14} />
                </span>
                <span className='fw-bold'>{obj.status}</span>
              </div>

              <div>
                <span className='fw-bold d-block'>Note: </span>
                {notes &&
                  notes.length > 0 &&
                  notes
                    .filter(
                      (n) => String(n.statusHistoryId) === String(obj._id)
                    )
                    .map((note, noteIndex) => {
                      return (
                        <>
                          <div>
                            <span className='fw-bold'>({noteIndex + 1}) </span>
                            <span className=''>{note?.text || ''}</span>
                          </div>
                        </>
                      );
                    })}
              </div>
              {obj.note ? (
                <div>
                  <span className='fw-bold d-block'>Note: </span>
                  <span className='d-block'>{obj.note}</span>
                </div>
              ) : (
                <></>
              )}
              <div className='d-flex justify-content-end'>
                <DateFormat date={obj.createdAt} format='MM/DD/yyyy hh:mm A' />
              </div>
            </div>
            <hr />
          </Fragment>
        );
      })}
    </div>
  );
};

export default BillStatusHistory;
