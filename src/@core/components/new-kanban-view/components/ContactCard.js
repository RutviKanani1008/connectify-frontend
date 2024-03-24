import React from 'react';
import { MoreVertical } from 'react-feather';
import Avatar from '@components/avatar';

const ContactCard = ({ contactData, stageId, viewCardDetails }) => {
  return (
    <>
      <div
        className='contact-box'
        onClick={() => {
          viewCardDetails?.({
            contactId: contactData.id,
            stageId,
          });
        }}
      >
        <div className='move-icon-wrapper' onClick={(e) => e.stopPropagation()}>
          <MoreVertical className='drag-icon' />
          <MoreVertical className='drag-icon' />
        </div>
        {contactData?.userProfile ? (
          <Avatar
            className='user-profile'
            img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${contactData?.userProfile}`}
            content={`${contactData.title}`}
            initials
          />
        ) : (
          <Avatar
            className='user-profile'
            color={'light-primary'}
            content={`${contactData.title}`}
            initials
          />
        )}
        <div className='name-company-details'>
          <h4 className='contact-neme'>{contactData.title}</h4>
          <h6 className='company-name'>{contactData.companyName}</h6>
        </div>
      </div>
    </>
  );
};

export default ContactCard;
