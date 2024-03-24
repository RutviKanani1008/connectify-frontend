import { useState } from 'react';
import { useSelector } from 'react-redux';

import { userData } from '../../../../../redux/user';
import { getContactDetails } from '../../../../../api/contacts';

const useGetCategoryContacts = ({
  group,
  setModal,
  handleDeleteCategory,
  category,
}) => {
  const user = useSelector(userData);

  // ** State **
  const [contactLoading, setContactLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [remainingCategory, setRemainingCategory] = useState([]);

  const getCategoryContacts = async ({ id, data, deleteCategory }) => {
    try {
      setContactLoading(true);
      if (deleteCategory) {
        const tempCategory = category.filter(
          (s) => s._id !== id && s._id !== 'unassignedItem'
        );
        const temp = [];
        tempCategory.forEach((t) => {
          const obj = {};
          obj._id = t._id;
          obj.label = t?.categoryName;
          obj.value = t?.categoryId;
          temp.push(obj);
        });
        setRemainingCategory(temp);
      } else {
        setModal((prev) => ({ ...prev, relatedContact: true }));
      }
      if (id !== 'unassignedItem') {
        const contact = await getContactDetails({
          'group.id': group.value,
          company: user.company._id,
          'category.id': id,
          select: 'firstName,lastName,email,phone,category',
          archived: false,
        });
        if (deleteCategory) {
          if (contact.data.data.length === 0) {
            deleteCategory(id);
            setModal((prev) => ({ ...prev, delete: false, id: null }));
          } else {
            handleDeleteCategory({ id, data });
          }
        }
        setContacts(contact.data.data);
        setContactLoading(false);
      } else {
        const contact = await getContactDetails({
          'group.id': group.value,
          company: user.company._id,
          category: null,
          select: 'firstName,lastName,email,phone,category',
          archived: false,
        });
        const temp = contact.data.data.filter(
          (contact) => contact.category === null
        );
        setContacts(temp);
        setContactLoading(false);
      }
    } catch (error) {
      setContactLoading(false);
    }
  };

  return { getCategoryContacts, contactLoading, remainingCategory, contacts };
};

export default useGetCategoryContacts;
