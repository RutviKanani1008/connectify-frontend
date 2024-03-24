/* eslint-disable no-unused-vars */
// ** React Imports
import { useParams } from 'react-router-dom';

// ** Third Party Components
import classnames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Plus } from 'react-feather';

// ** Reactstrap Imports
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from 'reactstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMailFolders,
  getMailFoldersCount,
  selectAllMail,
  setEmailParams,
} from '../../../../../redux/email';
import InboxIcon from '../../../../../@core/assets/svg-icons/InboxIcon';
import useGetMailRoute from '../hooks/useRoute';
// import SentIcon from '../../../../../@core/assets/svg-icons/SentIcon';
import { Fragment, useEffect, useState } from 'react';

const Sidebar = (props) => {
  // ** Props
  const {
    tabletSidebarOpen,
    toggleCompose,
    setTabletSidebarOpen,
    handleSidebar,
    sidebarOpen,
    setDetailPageState,
    dropdownRef,
    contact,
    filters,
  } = props;

  // ** Vars
  const params = useParams();
  const history = useHistory();

  // ** Store Variables
  const dispatch = useDispatch();
  const mailFolders = useSelector(getMailFolders);
  const mailFoldersCount = useSelector(getMailFoldersCount);

  // ** State **
  const [filterLabel, setFilterLabel] = useState('All');

  // ** Custom Hooks
  const { getEmailModuleRoute } = useGetMailRoute({ contactId: contact.id });

  // Here set the filter label
  useEffect(() => {
    if (filters.includes('SEEN')) {
      setFilterLabel('Read');
    } else if (filters.includes('UNSEEN')) {
      setFilterLabel('Unread');
    } else {
      setFilterLabel('All');
    }
  }, [filters]);

  const handleComposeClick = () => {
    toggleCompose();
    setTabletSidebarOpen(false);
  };

  // ** Functions To Active List Item
  const handleActiveItem = (value, index) => {
    if (params.folder && params.folder === value) {
      return true;
    } else if (!params.folder && index === 0) {
      return true;
    } else {
      return false;
    }
  };

  const handleFolderTab = (folder) => {
    dispatch(selectAllMail(false));
    dispatch(setEmailParams({ page: 1 }));
    setDetailPageState({
      folder: '',
      threadId: '',
      sendDate: '',
      nextEmailThreadId: '',
      nextEmailSendDate: '',
    });
    history.push(getEmailModuleRoute(encodeURIComponent(folder)));
  };

  return (
    <div
      className={classnames('sidebar-left', {
        show: tabletSidebarOpen,
      })}
    >
      <div className='inner-wrapper' ref={dropdownRef}>
        <span className='collapse__btn' onClick={() => handleSidebar()}></span>
        <div
          className='close-btn'
          onClick={() => setTabletSidebarOpen(false)}
        ></div>
        <div className='compose-btn-wrapper'>
          <Button
            className='compose-btn'
            color='primary'
            block
            onClick={handleComposeClick}
          >
            <Plus size={16} />
            Compose
          </Button>
        </div>
        <PerfectScrollbar
          className='sidebar-menu-list'
          options={{ wheelPropagation: false }}
        >
          <ListGroup tag='div' className='list-group-messages'>
            {Object.keys(mailFolders)
              .filter((folder) => !!mailFolders[folder])
              .map((folder, index) => (
                <Fragment key={index}>
                  {!sidebarOpen && (
                    <UncontrolledTooltip
                      placement='right'
                      autohide={true}
                      target={`mail__sidebar__menu${index}`}
                    >
                      {folder}{' '}
                      {(mailFoldersCount[folder] ||
                        mailFoldersCount[folder] === 0) && (
                        <span>({mailFoldersCount[folder]})</span>
                      )}
                    </UncontrolledTooltip>
                  )}

                  <ListGroupItem
                    id={`mail__sidebar__menu${index}`}
                    key={index}
                    action
                    className='cursor-pointer'
                    onClick={() =>
                      params.folder !== folder && handleFolderTab(folder)
                    }
                    active={handleActiveItem(folder, index)}
                  >
                    <span className='icon__wrapper'>
                      <InboxIcon />
                    </span>
                    <span className='menu-name'>
                      {folder}{' '}
                      {`${
                        handleActiveItem(folder, index) && folder !== 'Unread'
                          ? `(${filterLabel})`
                          : ''
                      }`}
                    </span>
                    {(mailFoldersCount[folder] ||
                      mailFoldersCount[folder] === 0) && (
                      <Badge color='primary' className='mx-1' pill>
                        {mailFoldersCount[folder]}
                      </Badge>
                    )}
                  </ListGroupItem>
                </Fragment>
              ))}
          </ListGroup>
        </PerfectScrollbar>
      </div>
    </div>
  );
};

export default Sidebar;
