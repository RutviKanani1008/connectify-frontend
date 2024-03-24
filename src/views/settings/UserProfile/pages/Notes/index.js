import React from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import NoteDetails from '../../../../Admin/contact/components/NotesDetails';

const Notes = () => {
  // ** Redux **
  const user = useSelector(userData);

  // ** State **
  return (
    <NoteDetails
      modelName='Users'
      currentContactDetail={[]}
      key={user._id}
      params={{ id: user._id }}
    />
  );
};

export default Notes;
