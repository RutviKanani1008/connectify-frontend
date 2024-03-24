// ** React Imports
import React from 'react';

// ** Third Party Components
import { MoreVertical, Edit, Trash } from 'react-feather';

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from 'reactstrap';
import { Icon } from '@iconify/react';

const NoteActionDropdown = ({ noteIdx, pinNote, editNote, removeNote }) => {
  return (
    <UncontrolledDropdown
      tag='div'
      className='dropdown-user nav-item user-details'
    >
      <DropdownToggle
        href='/'
        tag='a'
        className='nav-link dropdown-user-link'
        onClick={(e) => e.preventDefault()}
      >
        <MoreVertical />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem tag='span' onClick={() => pinNote(noteIdx)}>
          <Icon
            className='cursor-pointer'
            icon='material-symbols:push-pin'
            width={'20'}
          />
          <span className='align-middle'>Pin Note</span>
        </DropdownItem>
        <DropdownItem tag='span' onClick={() => editNote(noteIdx)}>
          <Edit
            className='cursor-pointer'
            icon='material-symbols:push-pin'
            width={'20'}
          />
          <span className='align-middle'>Edit Note</span>
        </DropdownItem>
        <DropdownItem tag='span' onClick={() => removeNote(noteIdx)}>
          <Trash
            className='cursor-pointer'
            icon='material-symbols:push-pin'
            width={'20'}
          />
          <span className='align-middle'>Delete Note</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default NoteActionDropdown;
