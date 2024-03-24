// ** React Imports
import React from 'react';

// ** Third Party Components
import {
  MoreVertical,
  Trash,
  Copy,
  Eye,
  Link as LinkIcon,
  Code,
  Edit2,
  RefreshCw,
} from 'react-feather';

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from 'reactstrap';

import CopyToClipboard from 'react-copy-to-clipboard';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';

const FormActionDropdown = ({
  formDetails = {},
  cloneFormDetails,
  handleConfirmDelete,
  handleFormPreview,
  handleTrashForm,
  handleIconCardClick,
}) => {
  const { _id, archived, active, slug } = formDetails;
  const user = useSelector(userData);

  const { basicRoute } = useGetBasicRoute();
  return (
    <UncontrolledDropdown tag='div' className='form-action-toggle-dropdown'>
      <DropdownToggle
        href='/'
        tag='a'
        className='form-action-toggle-btn'
        onClick={(e) => e.preventDefault()}
      >
        <MoreVertical />
      </DropdownToggle>
      <DropdownMenu end>
        {!archived && (
          <>
            <DropdownItem tag='span' onClick={() => cloneFormDetails(_id)}>
              <Copy
                className='cursor-pointer'
                icon='material-symbols:push-pin'
                width={'20'}
              />
              <span className='align-middle'>Clone Form</span>
            </DropdownItem>
            <DropdownItem
              tag='span'
              onClick={() => {
                if (user.role === 'superadmin') {
                  history.push(`/marketing/web-forms/${_id}`);
                } else {
                  history.push(`${basicRoute}/marketing/web-forms/${_id}`);
                }
              }}
            >
              <Edit2
                className='cursor-pointer'
                icon='material-symbols:push-pin'
                width={'20'}
              />
              <span className='align-middle'>Edit Form</span>
            </DropdownItem>
          </>
        )}
        {active && !archived ? (
          <>
            <DropdownItem
              tag='span'
              onClick={() => {
                handleFormPreview(_id);
              }}
            >
              <Eye
                className='cursor-pointer'
                icon='material-symbols:push-pin'
                width={'20'}
              />
              <span className='align-middle'>Preview</span>
            </DropdownItem>{' '}
            <CopyToClipboard
              text={`${process.env.REACT_APP_FORM_APP_URL}/forms/${slug}`}
            >
              <DropdownItem
                tag='span'
                onClick={() => {
                  handleIconCardClick();
                }}
              >
                <LinkIcon
                  className='cursor-pointer'
                  icon='material-symbols:push-pin'
                  width={'20'}
                />
                <span className='align-middle'>Copy Public Link</span>
              </DropdownItem>
            </CopyToClipboard>
            <CopyToClipboard
              text={`<iframe id="my-frame" src='${process.env.REACT_APP_FORM_APP_URL}/embed/${slug}' title='MyForm' style="width:100%;" frameBorder='0'></iframe>   <script>
                   window.addEventListener('message', function (e) {
                     const { data } = e;
                     if (data.type === 'UI') {
                       document.getElementById('my-frame').style.height =
                         data.payload + 'px';
                     } else if (data.type === 'link') {
                       window.location = data.payload;
                     } else if (data.type === 'scroll') {
                       setTimeout(function () {
                         window.scrollTo(0, 300);
                       }, 2);
                     }
                   });
                   document.body.style.overflowY = 'auto';
                 </script>`}
            >
              <DropdownItem
                tag='span'
                onClick={() => {
                  handleIconCardClick();
                }}
              >
                <Code
                  className='cursor-pointer'
                  icon='material-symbols:push-pin'
                  width={'20'}
                />
                <span className='align-middle'>Copy Embed Link</span>
              </DropdownItem>
            </CopyToClipboard>
          </>
        ) : null}
        {/* archived */}
        {archived && (
          <DropdownItem
            tag='span'
            onClick={() => {
              handleTrashForm(formDetails);
            }}
          >
            <RefreshCw
              className='cursor-pointer'
              icon='material-symbols:push-pin'
              width={'20'}
            />
            <span className='align-middle'>Recover Form</span>
          </DropdownItem>
        )}
        <DropdownItem
          tag='span'
          onClick={() => {
            if (archived) {
              handleConfirmDelete(_id);
            } else {
              handleTrashForm(formDetails);
            }
          }}
        >
          <Trash
            className='cursor-pointer'
            icon='material-symbols:push-pin'
            width={'20'}
          />
          <span className='align-middle'>
            {active && !archived ? 'Archive' : 'Delete'}
          </span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default FormActionDropdown;
