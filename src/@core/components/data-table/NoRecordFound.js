const NoRecordFound = ({
  title = 'No record found',
  text = ' Whoops... we do not see any records for this table in our database',
}) => {
  return (
    <>
      <div className='no-record-found-table'>
        <div className='img-wrapper'>
          <img src='/images/no-result-found.png' />
        </div>
        <div
          className='title'
        >
          {title}
        </div>
        <p
          className='text'
        >
          {text}
        </p>
      </div>
    </>
  );
};

export default NoRecordFound;
