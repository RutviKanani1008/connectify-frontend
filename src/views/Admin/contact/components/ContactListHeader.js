import _ from 'lodash';
import {
  Button,
  CardHeader,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import {
  Edit,
  FileText,
  Plus,
  PlusSquare,
  Share,
  Trash,
  Mail,
} from 'react-feather';
import ExportData from '../../../../components/ExportData';
import { Icon } from '@iconify/react';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const ContactListHeader = ({
  tableRef,
  hideTitle,
  selectedData,
  hideButton,
  currentTab,
  setShowSwitchGroupModal,
  handleImportItem,
  setOpenChangeGroupModal,
  handleDeleteMultiple,
  handleUnSubImportItem,
  handleBulkNoteCreate,
  handleBulkTaskCreate,
  handleSendMassMailCreate,
  isSelectedTotalData,
  isImportInProcess,
}) => {
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();

  const tableFilters = tableRef.current?.filter || {};
  const selectFilters = _.omit(tableFilters, ['sort', 'page', 'limit']);

  return (
    <>
      <CardHeader className='d-flex align-items-center card-header-with-buttons'>
        <div className='d-flex align-items-center'>
          <CardTitle tag='h4' className='text-primary item-table-title'>
            <div className='d-flex'>{!hideTitle ? 'Contact List' : ''}</div>
          </CardTitle>
        </div>
        <div className='d-flex buttons-wrapper'>
          <div>
            {(selectedData.length > 0 || isSelectedTotalData) && (
              <>
                <UncontrolledButtonDropdown className='me-1'>
                  <DropdownToggle color='secondary' caret outline>
                    <Share size={15} />
                    <span className='align-middle ms-50'>Bulk Actions</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      className='w-100'
                      onClick={() => {
                        setOpenChangeGroupModal(true);
                      }}
                    >
                      <Edit size={15} />
                      <span className='align-middle ms-50'>Change Group</span>
                    </DropdownItem>
                    <DropdownItem
                      className='w-100'
                      onClick={handleDeleteMultiple}
                    >
                      <Trash size={15} />
                      <span className='align-middle ms-50'>
                        {currentTab !== 'archive'
                          ? 'Move to Archive'
                          : 'Delete Contacts'}
                      </span>
                    </DropdownItem>
                    <DropdownItem
                      className='w-100'
                      onClick={() => handleBulkTaskCreate()}
                    >
                      <PlusSquare size={15} />
                      <span className='align-middle ms-50'>
                        Create Bulk Task
                      </span>
                    </DropdownItem>
                    <DropdownItem
                      className='w-100'
                      onClick={() => handleBulkNoteCreate()}
                    >
                      <FileText size={15} />
                      <span className='align-middle ms-50'>
                        Create Bulk Note
                      </span>
                    </DropdownItem>
                    <DropdownItem
                      className='w-100'
                      onClick={() => handleSendMassMailCreate()}
                    >
                      <Mail size={15} />
                      <span className='align-middle ms-50'>Email Campaign</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </>
            )}

            <ExportData
              model='contact'
              query={selectFilters}
              childDropDownOptions={
                <>
                  <DropdownItem
                    className='w-100'
                    onClick={handleUnSubImportItem}
                    disabled={isImportInProcess}
                  >
                    <Icon
                      icon='fluent:mail-unsubscribe-24-regular'
                      width='15'
                    />
                    <span className='align-middle ms-50'>
                      Import Unsubscribed
                    </span>
                  </DropdownItem>
                  <DropdownItem
                    className='w-100'
                    onClick={handleImportItem}
                    disabled={isImportInProcess}
                  >
                    <Share size={15} />
                    <span className='align-middle ms-50'>Import Contacts</span>
                  </DropdownItem>
                  <DropdownItem
                    className='w-100'
                    onClick={() => setShowSwitchGroupModal(true)}
                  >
                    <Icon icon='octicon:arrow-switch-16' width='18' />
                    <span className='align-middle ms-50'>
                      Mass Move Contacts
                    </span>
                  </DropdownItem>
                </>
              }
            />

            {!hideButton ? (
              <>
                <Button
                  className='ms-1'
                  color='primary'
                  onClick={() => {
                    history.push(`${basicRoute}/contact/add`);
                  }}
                >
                  <Plus size={15} />
                  <span className='align-middle ms-50'>Add Contact</span>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>
    </>
  );
};

export default ContactListHeader;
