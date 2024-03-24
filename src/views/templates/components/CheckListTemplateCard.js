//  Packages **
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  Copy,
  Edit2,
  Link as LinkIcon,
  Eye,
  MoreVertical,
  Printer,
  Trash,
  Users,
} from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import { encrypt } from '../../../helper/common.helper';
import { TOASTTYPES, showToast } from '../../../utility/toast-helper';
import AddChecklistToContactModal from './AddChecklistToContactModal';
import { useState } from 'react';
import { useGetContactsByFilter } from '../../Admin/contact/service/contact.services';
import {
  useCopyChecklistToCompany,
  useCopyChecklistToContacts,
} from '../hooks/checklistApis';
import { showWarnAlert } from '../../../helper/sweetalert.helper';

const CheckListTemplateCard = ({
  item,
  handleConfirmClone,
  setChecklistId,
  handleConfirmDelete,
  setIsViewOnly,
  handlePrintIndividualChecklist,
  searchValue = null,
  type,
}) => {
  const { name, _id, checklist } = item;
  const [addToContactListModalVisible, setAddToContactListModalVisible] =
    useState(false);

  const [contactList, setContactList] = useState({ results: [], total: 0 });
  const { getContacts, isLoading: loadingContacts } = useGetContactsByFilter();
  const {
    copyChecklistToContacts,
    isLoading: assignChecklistToContactsLoading,
  } = useCopyChecklistToContacts();
  const { copyChecklistToCompany } = useCopyChecklistToCompany();
  const highlightMatch = (text, query) => {
    if (!query) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight-text-color">$1</span>');
  };

  const handleCopyLinkClick = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Copy Link...');
    showToast(TOASTTYPES.success, toastId, 'Checklist Link Copied');
  };

  const highlightedHeader = highlightMatch(name ? name : '', searchValue);

  const loadContacts = async ({ page, limit, loadMore, search }) => {
    try {
      const { data, error } = await getContacts({
        page,
        search,
        query: {
          limit,
          archived: false,
          select: 'firstName,lastName,userProfile,email',
        },
      });
      if (!error) {
        if (loadMore) {
          setContactList((prev) => ({
            results: [...prev.results, ...data.allContacts],
            total: data.total,
          }));
        } else {
          setContactList({
            results: data.allContacts || [],
            total: data.total,
          });
        }
      }
    } catch (error) {
      setAddToContactListModalVisible(false);
    }
  };

  const onAddChecklistToContacts = async (selectedContactIds) => {
    await copyChecklistToContacts(item._id, {
      contactIds: Array.from(selectedContactIds),
    });
    setAddToContactListModalVisible(false);
    setContactList([]);
  };

  const handleCloneChecklistToCompany = async () => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to copy this checklist to company?',
    });

    if (result.value) {
      await copyChecklistToCompany(item?._id);
    }
  };

  return (
    <>
      <div className='company-form-card checklist-company-form-card'>
        <div className='header-wrapper'>
          <div
            className='form-card-title'
            dangerouslySetInnerHTML={{ __html: highlightedHeader }}
          ></div>
          <div className='action-btn-wrapper'>
            <div
              className='action-btn printer-btn'
              onClick={(e) => {
                e.stopPropagation();
                handlePrintIndividualChecklist(item);
              }}
            >
              <Printer
                size={20}
                className={'cursor-pointer'}
                id={`print_folder_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                target={`print_folder_${_id}`}
              >
                Print
              </UncontrolledTooltip>
            </div>
            <div
              className='action-btn view-btn'
              onClick={(event) => {
                event.stopPropagation();
                setChecklistId(item?._id);
                setIsViewOnly(true);
              }}
            >
              <Eye
                // color='#a3db59'
                size={15}
                className='cursor-pointer'
                id={`view_checklist_${_id}`}
              />
              <UncontrolledTooltip
                key={`view_checklist_${_id}`}
                placement='top'
                autohide={true}
                target={`view_checklist_${_id}`}
              >
                View Checklist
              </UncontrolledTooltip>
            </div>
            <div
              className='action-btn copy-btn'
              onClick={(event) => {
                event.stopPropagation();
                handleConfirmClone(_id);
              }}
            >
              <Copy
                // color='orange'
                size={15}
                className='cursor-pointer'
                id={`clone_${_id}`}
              />
              <UncontrolledTooltip
                key={`clone_${_id}`}
                placement='top'
                autohide={true}
                target={`clone_${_id}`}
              >
                Clone
              </UncontrolledTooltip>
            </div>
            {['ChecklistTemplate', 'Users', 'Contacts'].includes(type) && (
              <div
                className='action-btn copy-btn'
                onClick={(event) => {
                  event.stopPropagation();
                  if (['Users', 'Contacts'].includes(type)) {
                    handleCloneChecklistToCompany();
                  } else {
                    setAddToContactListModalVisible(true);
                  }
                }}
              >
                <Users
                  size={15}
                  className='cursor-pointer'
                  id={`contact_list_${_id}`}
                />
                <UncontrolledTooltip
                  key={`contact_list_${_id}`}
                  placement='top'
                  autohide={true}
                  target={`contact_list_${_id}`}
                >
                  Copy Checklist to Contacts
                </UncontrolledTooltip>
              </div>
            )}
            <div className='action-btn link-btn'>
              <CopyToClipboard
                text={`${window.location.origin}/checklist-details/${encrypt(
                  _id
                )}`}
              >
                <LinkIcon
                  size={15}
                  className='cursor-pointer'
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyLinkClick();
                  }}
                  id={`copyC_${_id}`}
                />
              </CopyToClipboard>
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`copyC_${_id}`}
              >
                Copy Checklist Link
              </UncontrolledTooltip>
            </div>
            <div
              className='action-btn edit-btn'
              onClick={(event) => {
                event.stopPropagation();
                setChecklistId(item?._id);
              }}
            >
              <Edit2
                size={15}
                className='cursor-pointer'
                // color={'#64c664'}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                key={`edit_${_id}`}
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit
              </UncontrolledTooltip>
            </div>
            <div
              className='action-btn delete-btn'
              onClick={(event) => {
                event.stopPropagation();
                handleConfirmDelete(item);
              }}
            >
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                id={`trash_${_id}`}
              />
              <UncontrolledTooltip
                key={`trash_${_id}`}
                placement='top'
                autohide={true}
                target={`trash_${_id}`}
              >
                Delete
              </UncontrolledTooltip>
            </div>
            <div className='action-btn toggle-btn'>
              <MoreVertical
                color='#000000'
                size={15}
                className='cursor-pointer'
              />
            </div>
          </div>
        </div>
        <div className='body-wrapper'>
          <div className='checklist-listing-items'>
            {checklist?.map(({ title, checked }, key) => {
              const highlightedChecklistTitle = highlightMatch(
                title ? title : '',
                searchValue
              );

              return (
                <div className={`item ${checked ? 'active' : ''}`} key={key}>
                  <div className='inner-wrapper'>
                    <div className='cn-wrapper'>
                      <input
                        key={`${checked}_{${_id}`}
                        className='form-check-input'
                        name=''
                        disabled
                        type='checkbox'
                        defaultChecked={checked}
                      />
                      <p
                        className='title'
                        key={key}
                        dangerouslySetInnerHTML={{
                          __html: highlightedChecklistTitle,
                        }}
                      ></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {addToContactListModalVisible && (
        <AddChecklistToContactModal
          isModalOpen={addToContactListModalVisible}
          onCloseModal={() => {
            setAddToContactListModalVisible(false);
          }}
          contactsLoading={loadingContacts}
          availableContacts={contactList.results}
          sumbitLoader={assignChecklistToContactsLoading}
          onAddContacts={onAddChecklistToContacts}
          totalContacts={contactList.total}
          loadMoreContacts={loadContacts}
        />
      )}
    </>
  );
};
export default CheckListTemplateCard;
