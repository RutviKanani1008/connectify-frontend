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
import Avatar from '@components/avatar';
import _ from 'lodash';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';
import { SaveButton } from '../../../@core/components/save-button';
import { ReactComponent as SearchIcon } from '../../../assets/images/icons/searchIcon.svg';

const initialFilter = {
  page: 1,
  limit: 10,
  search: '',
  loadMore: false,
};

const AddChecklistToContactModal = (props) => {
  const {
    isModalOpen = false,
    onCloseModal,
    contactsLoading = false,
    availableContacts = [],
    sumbitLoader = false,
    onAddContacts,
    totalContacts = 0,
    loadMoreContacts,
  } = props;

  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    loadMoreContacts?.(filter);
  }, []);

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
      loadMoreContacts?.(newFilters);
      setFilter(newFilters);
    }, 300),
    []
  );

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
        className='modal-dialog-centered add-new-contact-contact-pipline-modal modal-dialog-mobile'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            onCloseModal();
          }}
        >
          Add Checklist to Contacts
        </ModalHeader>
        <ModalBody>
          <div className={`search-box-wrapper search-box-wrapper-contactList `}>
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
          {contactsLoading && !filter.loadMore ? (
            <>
              <div className='mb-2 mt-2 text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : availableContacts && availableContacts.length > 0 ? (
            <>
              {availableContacts.map((contact, index) => {
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
              {contactsLoading && filter.loadMore ? (
                <div className='mb-2 mt-2 text-center'>
                  <Spinner color='primary' />
                </div>
              ) : (
                totalContacts > availableContacts.length && (
                  <div className='load-more-wrapper'>
                    <SaveButton
                      className='load-more-btn'
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
                        loadMoreContacts?.(newFilters);
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
          {availableContacts.length !== 0 ? (
            <SaveButton
              loading={sumbitLoader}
              width='100%'
              type='button'
              name={'Add'}
              onClick={() => onAddContacts?.(selectedContactIds)}
              className=''
            ></SaveButton>
          ) : null}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddChecklistToContactModal;
