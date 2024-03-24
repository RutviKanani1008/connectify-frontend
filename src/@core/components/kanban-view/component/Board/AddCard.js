import React from 'react';
import { SaveButton } from '../../../save-button';

const AddCardLink = (props) => {
  return (
    <>
      {props.laneId !== 'addNewStage' ? (
        <>
          <div className='addNew-contact-btn-wrapper'>
            <SaveButton
              loading={
                props.addContactsToStageLane === props.laneId
                  ? props.isLoading
                  : false
              }
              width='100%'
              type='button'
              name={'+ Add New Contact'}
              onClick={() => props.onAddNewContact?.(props.laneId)}
              className=''
            ></SaveButton>
          </div>
        </>
      ) : null}
    </>
  );
};

export default AddCardLink;
