import Document from '../../../document/Document';

const ContactFilesTab = ({ contactId, modelType = 'Contacts' }) => {
  return (
    <div className='contact__files__wrapper'>
      <Document type='contact' contactId={contactId} modelType={modelType} />
    </div>
  );
};

export default ContactFilesTab;
