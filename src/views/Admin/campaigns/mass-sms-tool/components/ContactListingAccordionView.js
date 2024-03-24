// ==================== Packages =======================
import { ChevronDown, Grid, List } from 'react-feather';
import { useState } from 'react';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  ButtonGroup,
  Col,
  Row,
  Spinner,
} from 'reactstrap';
import classnames from 'classnames';
// ====================================================
import ContactCard from '../../../event/components/ContactCard';
import ItemTable from '../../../../../@core/components/data-table';
import useContactColumn from '../hooks/useColumns';

const ContactListingAccordionView = ({
  isLoading,
  toggle,
  contacts,
  mode,
  open,
  control,
  errors,
  setValue,
  getValues,
}) => {
  // ============================== States ============================
  const [firstSectionView, setFirstSectionView] = useState('grid');
  const [firstSectionPerPage, setFirstSectionPerPage] = useState(9);

  // ========================== Custom Hooks =========================

  const { contactsColumns } = useContactColumn({
    control,
    errors,
    setValue,
    getValues,
    mode,
  });

  return (
    <Accordion className='accordion-margin contact-accordion' open={open} toggle={toggle}>
      <AccordionItem>
        <ButtonGroup className='toggle-view-btn-wrapper'>
          <Button
            tag='label'
            className={classnames('btn-icon view-btn grid-view-btn', {
              active: firstSectionView === 'grid',
            })}
            color='primary'
            outline
            onClick={() => setFirstSectionView('grid')}
          >
            <Grid size={18} />
          </Button>
          <Button
            tag='label'
            className={classnames('btn-icon view-btn list-view-btn', {
              active: firstSectionView === 'list',
            })}
            color='primary'
            outline
            onClick={() => setFirstSectionView('list')}
          >
            <List size={18} />
          </Button>
        </ButtonGroup>
        <AccordionHeader targetId='1'>
          <h3 className='title'>
            Contact: <span className='value'>{contacts.length}</span>
          </h3>
          <div className='down-arrow-btn'>
            <ChevronDown className='' size={34} />
          </div>
        </AccordionHeader>
        <AccordionBody accordionId='1'>
          {isLoading ? (
            <div className='text-primary text-center my-3'>
              <Spinner color='primary' />
            </div>
          ) : (
            <Row className='event-contact-list-wrapper'>
              {firstSectionView === 'grid' ? (
                contacts.length ? (
                  contacts.map((contact, index) => {
                    if (index < firstSectionPerPage) {
                      return (
                        <Col className='event-contact-col' key={index}>
                          <ContactCard
                            label='selected'
                            index={index}
                            mode='edit'
                            contact={contact}
                            errors={errors}
                            control={control}
                            getValues={getValues}
                            setValue={setValue}
                            showCheckbox={mode === 'edit' ? true : false}
                          />
                        </Col>
                      );
                    }
                  })
                ) : (
                  !isLoading && (
                    <div className='my-3 h5 text-center'>
                      Contact Not Found!
                    </div>
                  )
                )
              ) : (
                <div className='event-contact-table-w'>
                  <ItemTable
                    hideButton={true}
                    columns={contactsColumns}
                    data={contacts}
                    itemsPerPage={10}
                    selectableRows={false}
                    showCard={false}
                    showHeader={false}
                    hideExport={true}
                  />
                </div>
              )}
            </Row>
          )}
          {!isLoading &&
            firstSectionPerPage < contacts.length &&
            firstSectionView === 'grid' && (
              <div className='text-center mt-1 mb-1'>
                <Button
                  outline={true}
                  color='primary'
                  onClick={() => {
                    let temp = firstSectionPerPage;
                    temp = temp + 6;
                    setFirstSectionPerPage(temp);
                  }}
                >
                  Load More
                </Button>
              </div>
            )}
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );
};

export default ContactListingAccordionView;
