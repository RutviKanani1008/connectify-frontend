import React from 'react';
import { MoreVertical } from 'react-feather';
import Avatar from '@components/avatar';

function ContactCard(props) {
  return (
    <>
      <div
        className='contact-box'
        onClick={() => {
          props.viewCardDetails?.({
            contactId: props.id,
            stageId: props.laneId,
          });
        }}
      >
        <div className='move-icon-wrapper' onClick={(e) => e.stopPropagation()}>
          <MoreVertical className='drag-icon' />
          <MoreVertical className='drag-icon' />
        </div>
        {props?.userProfile ? (
          <Avatar
            className='user-profile'
            img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${props?.userProfile}`}
            content={`${props.title}`}
            initials
          />
        ) : (
          <Avatar
            className='user-profile'
            color={'light-primary'}
            content={`${props.title}`}
            initials
          />
        )}
        <div className='name-company-details'>
          <h4 className='contact-neme'>{props.title}</h4>
          <h6 className='company-name'>{props.companyName}</h6>
        </div>
      </div>
    </>
  );
}

export default ContactCard;
