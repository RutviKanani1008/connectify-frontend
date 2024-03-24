import React from 'react';
// import { CheckCircle } from 'react-feather';

const ImportUnsubSuccess = ({ unsubCounts }) => {
  return (
    <>
      <div className='importSuccess-wrapper'>
        {/* <CheckCircle size={150} className='mt-3' color='green' /> */}
        <div className="img-wrapper">
          <img src="/images/importSuccessImg.png" alt="" />
          <iframe className="tick-animated-img" src="https://lottie.host/?file=3e8027a7-9d32-4816-b4f7-7aef91bafb5b/L2yOWecH57.json"></iframe>
        </div>
        <p className='text'>
          {unsubCounts
            ? `${unsubCounts} Contact(s) Unsubscribed Successfully.`
            : 'No Contacts Found'}
        </p>
      </div>
    </>
  );
};

export default ImportUnsubSuccess;
