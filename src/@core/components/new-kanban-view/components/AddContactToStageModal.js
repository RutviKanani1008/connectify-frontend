import { Fragment, useState, useCallback, useEffect } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import _ from 'lodash';
import Avatar from '@components/avatar';
import { SaveButton } from '../../save-button';
import NoRecordFound from '../../data-table/NoRecordFound';
import { updateMultipleContactStage } from '../../../../api/contacts';
import { useGetNotInStageContactList } from '../../kanban-view/hooks/contactsAPI';
import { logger } from '../../../../utility/Utils';
import { ReactComponent as SearchIcon } from '../../../../assets/images/icons/searchIcon.svg';

const initialFilter = {
  page: 1,
  limit: 10,
  search: '',
  loadMore: false,
};

const AddContactToStageModal = ({
  isModalOpen,
  onCloseModal,
  groupId,
  customPipelineId,
  moduleKey,
  stageId,
  getStages,
}) => {
  // ** State **
  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [filter, setFilter] = useState(initialFilter);
  const [contacts, setContacts] = useState({ rows: [], total: 0 });
  const [addContactLoading, setAddContactLoading] = useState(false);

  // ** Custom Hooks
  const { getOtherStageContacts, isLoading } = useGetNotInStageContactList();

  useEffect(() => {
    getContacts(filter);
  }, []);

  const getContacts = async ({ page, limit, loadMore, search }) => {
    try {
      const { data, error } = await getOtherStageContacts({
        page,
        limit,
        search,
        group: groupId,
        archived: false,
        notInStage: stageId,
        stageKey: moduleKey,
        select: 'firstName,lastName,userProfile,email',
      });
      if (!error) {
        if (loadMore) {
          setContacts((prevContacts) => ({
            rows: [...prevContacts.rows, ...data.contacts],
            total: data.total,
          }));
        } else {
          setContacts({ rows: data.contacts || [], total: data.total });
        }
      }
    } catch (error) {
      logger(error);
    }
  };

  const checkContact = (contactId) => {
    const contactIds = new Set(selectedContactIds);
    if (!contactIds.has(contactId)) {
      contactIds.add(contactId);
    } else {
      contactIds.delete(contactId);
    }
    setSelectedContactIds(contactIds);
  };

  const debounceFn = useCallback(
    _.debounce(async (search) => {
      const newFilters = {
        ...filter,
        page: 1,
        search: search ? search.trim() : search,
        loadMore: false,
      };
      getContacts(newFilters);
      setFilter(newFilters);
    }, 300),
    []
  );

  const onAddContacts = async (selectedContactIds) => {
    setAddContactLoading(true);
    await updateMultipleContactStage({
      stageId,
      customPipelineId,
      stageKey: moduleKey,
      contactIds: Array.from(selectedContactIds),
    });
    setAddContactLoading(false);
    getStages({ groupId, pipelineId: customPipelineId });
    onCloseModal();
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    await debounceFn(value);
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        toggle={() => {
          onCloseModal();
        }}
        className='modal-dialog-centered add-new-contact-contact-pipline-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            onCloseModal();
          }}
        >
          Add New Contacts into Stage
        </ModalHeader>
        <ModalBody>
          <div className={`search-box-wrapper search-box-wrapper-contactList`}>
            <div className='form-element-icon-wrapper'>
              <SearchIcon />
              <Input
                className='dataTable-filter mb-50'
                placeholder={'Search'}
                type='text'
                bsSize='sm'
                id='search-input'
                onChange={handleSearch}
              />
            </div>
          </div>
          {isLoading && !filter.loadMore ? (
            <>
              <div className='mb-2 mt-2 text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : contacts.rows.length > 0 ? (
            <>
              {contacts.rows.map((contact, index) => {
                return (
                  <Fragment key={index}>
                    <div className='contact-box'>
                      <div className='inner-wrapper'>
                        <div className='img-wrapper'>
                          {contact?.userProfile ? (
                            <Avatar
                              className='user-profile'
                              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${contact?.userProfile}`}
                              content={`${contact.firstName || ''} ${
                                contact.lastName || ''
                              }`}
                              initials
                            />
                          ) : (
                            <Avatar
                              className='user-profile'
                              color={'light-primary'}
                              content={`${contact.firstName || ''} ${
                                contact.lastName || ''
                              }`}
                              initials
                            />
                          )}
                        </div>
                        <div className='details'>
                          <h3 className='title'>{`${contact?.firstName || ''} ${
                            contact?.lastName || ''
                          }`}</h3>
                          <div className='email'>{`${
                            contact?.email || ''
                          }`}</div>
                        </div>
                        <Input
                          type='checkbox'
                          onChange={() => {
                            checkContact(contact._id);
                          }}
                          checked={selectedContactIds.has(contact._id)}
                        />
                      </div>
                    </div>
                  </Fragment>
                );
              })}
              {isLoading && filter.loadMore ? (
                <div className='mb-2 mt-2 text-center'>
                  <Spinner color='primary' />
                </div>
              ) : (
                contacts.total > contacts.rows.length && (
                  <div className='d-flex justify-content-center'>
                    <SaveButton
                      loading={false}
                      outline
                      name='Load More'
                      width='150px'
                      onClick={() => {
                        const newFilters = {
                          ...filter,
                          page: filter.page + 1,
                          loadMore: true,
                        };
                        getContacts(newFilters);
                        setFilter(newFilters);
                      }}
                    />
                  </div>
                )
              )}
            </>
          ) : (
            <NoRecordFound />
          )}
        </ModalBody>
        <ModalFooter>
          <Button color='danger' onClick={() => onCloseModal()}>
            Cancel
          </Button>
          {contacts.rows.length !== 0 ? (
            <SaveButton
              loading={addContactLoading}
              width='100%'
              type='button'
              name={'Add'}
              onClick={() => onAddContacts(selectedContactIds)}
              className=''
            ></SaveButton>
          ) : null}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddContactToStageModal;
