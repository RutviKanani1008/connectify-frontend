import React from 'react';
import { SaveButton } from '../../save-button';

const AddCard = ({ stageId, onAddNewContact }) => {
  return (
    <div className='addNew-contact-btn-wrapper'>
      <SaveButton
        width='100%'
        type='button'
        name='+ Add New Contact'
        onClick={() => onAddNewContact(stageId)}
        className=''
        loading={false}
      />
    </div>
  );
};

export default AddCard;
