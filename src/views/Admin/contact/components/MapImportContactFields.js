import React, { useEffect, useMemo, useState } from 'react';
import CustomSelect from '../../../../@core/components/form-fields/CustomSelect';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import { Edit2, Plus, X } from 'react-feather';
import PerfectScrollbar from 'react-perfect-scrollbar';

const CONTACT_FIELDS = [
  { label: 'FirstName', value: 'firstName' },
  { label: 'LastName', value: 'lastName' },
  { label: 'Company Name', value: 'company_name' },
  { label: 'Company Type', value: 'companyType' },
  { label: 'Website', value: 'website' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Address1', value: 'address1' },
  { label: 'Address2', value: 'address2' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
  { label: 'Country', value: 'country' },
  { label: 'Zip', value: 'zip' },
  { label: 'Group Name', value: 'group' },
  { label: 'Status Name', value: 'status' },
  { label: 'Category Name', value: 'category' },
  { label: 'Tag Name', value: 'tags' },
  { label: 'Pipeline', value: 'pipeline' },
  { label: 'Stage', value: 'stage' },
];

const MapImportContactFields = ({
  columnNames = [],
  mappedColumns,
  setMappedColumns,
  customFields,
  setCustomFields,
}) => {
  const allOptions = useMemo(() => {
    const option = columnNames.map((col) => ({ label: col, value: col }));
    return option;
  }, [columnNames]);

  const mapOptions = useMemo(() => {
    const selectedCols = [
      ...Object.values(mappedColumns),
      ...customFields.map((c) => c.value),
    ];

    const option = columnNames
      .map((col) => ({ label: col, value: col }))
      .filter((opt) => !selectedCols.includes(opt.value));
    return option;
  }, [columnNames, mappedColumns, customFields]);

  const [currentCustomFieldIdx, setCurrentCustomFieldIdx] = useState(null);
  const [currentCustomFieldState, setCurrentCustomFieldState] = useState({
    text: '',
    error: '',
  });

  useEffect(() => {
    setMappedColumns((prev) => {
      columnNames.forEach((col) => {
        const existField = CONTACT_FIELDS.find((f) => f.value === col);
        if (existField) {
          prev[col] = existField.value;
        }
      });
      return { ...prev };
    });
  }, [columnNames]);

  const handleCreateCustomField = () => {
    if (currentCustomFieldState.text === '') {
      return setCurrentCustomFieldState((prev) => ({
        ...prev,
        error: 'Please Enter Custom Field.',
      }));
    }

    const isExist =
      currentCustomFieldIdx > -1 &&
      customFields.some((f) => f.label === currentCustomFieldState.text);

    if (isExist) {
      return setCurrentCustomFieldState((prev) => ({
        ...prev,
        error: 'Custom Field already exist.',
      }));
    }

    const isExistInDefaultField = CONTACT_FIELDS.some(
      (c) => c.value === currentCustomFieldState.text
    );

    if (isExistInDefaultField) {
      return setCurrentCustomFieldState((prev) => ({
        ...prev,
        error: 'Field already exist.',
      }));
    }

    setCustomFields((prev) => {
      return currentCustomFieldIdx > -1
        ? prev.map((field, idx) =>
            idx === currentCustomFieldIdx
              ? { ...field, label: currentCustomFieldState.text }
              : field
          )
        : [...prev, { label: currentCustomFieldState.text, value: null }];
    });

    setCurrentCustomFieldState({ text: '', error: '' });
    setCurrentCustomFieldIdx(null);
  };

  const handleEditCustomField = (idx) => {
    setCurrentCustomFieldIdx(idx);
    const customFieldText = customFields[idx].label;
    setCurrentCustomFieldState({ text: customFieldText, error: '' });
  };
  const handleRemoveCustomField = (idx) => {
    setCustomFields((prev) => prev.filter((_, idx1) => idx1 !== idx));
  };

  const handleClose = () => {
    setCurrentCustomFieldState({ text: '', error: '' });
    setCurrentCustomFieldIdx(null);
  };

  return (
    <div className='fieldNCN-wrapper'>
      <div className='field__name__replace__wrapper'>
        <div className='section-title-wrapper'>
          <h2 className='section-title'>Fields From Connectify CRM</h2>
          <h2 className='section-title'>Fields From CSV</h2>
        </div>
        <PerfectScrollbar className='scroll__wrapper hide-scrollbar'>
          {CONTACT_FIELDS.map((field, idx) => (
            <div key={idx} className='field__name__replace__box'>
              <div className='nameLabel'>
                <h4 id={`nameLabel${idx}`} className='title'>
                  {field.label}
                </h4>
              </div>
              <UncontrolledTooltip placement='top' target={`nameLabel${idx}`}>
                {field.label}
              </UncontrolledTooltip>
              <CustomSelect
                menuPosition='fixed'
                label='Map with'
                classNamePrefix='custom-select'
                value={allOptions.find(
                  (opt) => opt.value === mappedColumns[field.value]
                )}
                options={mapOptions}
                onChange={(e) => {
                  setMappedColumns((prev) => ({
                    ...prev,
                    [field.value]: e.value,
                  }));
                }}
              />
            </div>
          ))}
        </PerfectScrollbar>
      </div>
      <div className='custom-field-wrapper'>
        <div className='section-title-wrapper'>
          <h2 className='section-title'>Custom Fields</h2>
          <h2 className='section-title'>Fields From CSV</h2>
        </div>
        <PerfectScrollbar className='scroll__wrapper hide-scrollbar'>
          {customFields.map((field, idx) => (
            <div key={field.label} className='customFieldBox'>
              <div className='field__name__replace__box'>
                <div className='nameLabel'>
                  <h4 id={`nameLabel${idx}`} className='title'>
                    {field.label}
                  </h4>
                </div>
                <UncontrolledTooltip placement='top' target={`nameLabel${idx}`}>
                  {field.label}
                </UncontrolledTooltip>

                <CustomSelect
                  menuPosition='fixed'
                  label='Map with'
                  classNamePrefix='custom-select'
                  value={allOptions.find((opt) => opt.value === field.value)}
                  options={mapOptions}
                  onChange={(e) => {
                    setCustomFields((prev) =>
                      prev.map((f, cId) =>
                        idx === cId ? { ...f, value: e.value } : f
                      )
                    );
                  }}
                />
              </div>
              <div className='action-btn-wrapper'>
                <div className='action-btn edit-btn'>
                  <Edit2
                    className='text-primary cursor-pointer'
                    size={12}
                    onClick={() => handleEditCustomField(idx)}
                  />
                </div>
                <div className='action-btn delete-btn'>
                  <X
                    size={14}
                    className='text-primary cursor-pointer'
                    onClick={() => handleRemoveCustomField(idx)}
                  />
                </div>
              </div>
            </div>
          ))}
        </PerfectScrollbar>
        <Button
          className='add__custom__field__btn'
          color='primary'
          onClick={() => setCurrentCustomFieldIdx(-1)}
        >
          <Plus size={16} /> Add Custom Field
        </Button>
      </div>

      <Modal
        isOpen={currentCustomFieldIdx !== null}
        toggle={handleClose}
        className='modal-dialog-centered add-custom-filed-modal'
        backdrop='static'
      >
        <ModalHeader toggle={handleClose}>{'Add Custom Field'}</ModalHeader>
        <ModalBody>
          <div className='mb-1 mt-1'>
            <Input
              label='Question'
              name='question'
              placeholder='Enter Custom Field'
              type='text'
              value={currentCustomFieldState.text}
              onChange={(e) => {
                setCurrentCustomFieldState({
                  text: e.target.value,
                  error: '',
                });
              }}
            />
            {currentCustomFieldState.error ? (
              <>
                <div className='mt-1 text-danger'>
                  {currentCustomFieldState.error}
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={handleCreateCustomField}>
            {'Add'}
          </Button>
          <Button color='danger' onClick={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MapImportContactFields;
