import DateFormat from '../../../../../components/DateFormate';

const StatusNotes = ({ statusNotes }) => {
  return (
    <>
      <div className='billing__status__notes__wp fancy__scrollbar'>
        <h4>Notes</h4>
        {statusNotes
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          ?.map((obj, index) => {
            return (
              obj.text && (
                <div className='mb-1' key={index}>
                  {obj.text ? (
                    <>
                      <div>
                        <span className='fw-bold '>({index + 1}) </span>
                        <span className=''>{obj.text}</span>
                      </div>
                      <div className='d-flex justify-content-end me-2 text-primary'>
                        <DateFormat
                          date={obj.createdAt}
                          format='MM/DD/yyyy hh:mm A'
                        />
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              )
            );
          })}
      </div>
    </>
  );
};

export default StatusNotes;
