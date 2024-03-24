/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import PipelineView from './PipelineView';
import { useDraggable } from '../data-table/hooks/useDragging';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { updateContactAndFormDetails } from '../../../api/contacts';
import { deleteCategory, getCategory } from '../../../api/category';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';

const CategoryView = ({ currentGroup }) => {
  // ** Redux **
  const user = useSelector(userData);

  // ** States **
  const [fetching, setFetching] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categoriesStages, setCategoriesStages] = useState([]);
  const [showNewStatusError, setNewStatusShowError] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState(false);
  const [remainingCategory, setRemainingCategory] = useState([]);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState({
    visible: false,
    data: {},
  });

  const { onDragEnd, sortableHandle } = useDraggable({
    originalDataList: categories,
    setOriginalDataList: (newList) => {
      setCategories(newList);
      setAllStages(newList);
    },
    model: 'category',
  });

  const setAllStages = (items) => {
    const stages = items.map((ctg) => ({
      id: ctg._id,
      _id: ctg._id,
      title: ctg.categoryName,
      position: ctg.position,
      stageCode: ctg.categoryId,
      isNotDraggable: ctg.isNotDraggable ?? false,
      cards: [],
      data: ctg,
    }));
    setCategoriesStages(stages);
  };

  const addNewCategory = () => {
    setOpenCategoryModal(!openCategoryModal);
  };

  const getCategories = async (id) => {
    if (id !== 'unAssigned' && id !== '') {
      setFetching(true);
      const [{ data: categoriesResponse }] = await Promise.all([
        getCategory({
          company: user.company._id,
          groupId: id,
        }),
      ]);
      const categoriesData = [
        {
          categoryName: 'Unassigned',
          categoryId: 'unassignedItem',
          _id: 'unassignedItem',
          position: 0,
          isNotDraggable: true,
        },
        ...(categoriesResponse?.data || []),
      ].sort((a, b) => a.position - b.position);
      setCategories(categoriesData);
      setAllStages(categoriesData);
      setFetching(false);
    } else {
      const categoriesData = [
        {
          categoryName: 'Unassigned',
          categoryId: 'unassignedItem',
          _id: 'unassignedItem',
          position: 0,
          isNotDraggable: true,
        },
      ];
      setAllStages(categoriesData);
      setCategories(categoriesData);
    }
  };

  const handleEditCategory = (id) => {
    const selectCategory = categories.find((Category) => Category._id === id);
    if (selectCategory && selectCategory.categoryName) {
      setOpenCategoryModal(!openCategoryModal);
    }
  };

  const handleDeleteCategory = async (id = null) => {
    setNewStatusShowError();
    if (!selectedNewStatus) {
      setNewStatusShowError(true);
    }
    const contactId = [];
    contacts.forEach((c) => contactId.push(c._id));
    const obj = {};
    obj.contacts = contactId;
    obj.category = selectedNewStatus;

    if (obj && contactId.length > 0 && selectedNewStatus) {
      await updateContactAndFormDetails(obj);
    }
    if (deleteCategoryModal.data?.id || id) {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you would like to delete this Category?',
        allowOutsideClick: false,
        confirmButtonText: 'Yes',
        inputAttributes: {
          autocapitalize: 'off',
        },
        loaderHtml: '<div class="spinner-border text-primary"></div>',
        showLoaderOnConfirm: true,
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
          loader: 'custom-loader',
        },
        preConfirm: () => {
          return deleteCategory(
            deleteCategoryModal.data?.id ? deleteCategoryModal.data?.id : id
          ).then((res) => {
            if (res?.status === 200) {
              setDeleteCategoryModal({
                data: {},
                visible: false,
              });
              setRemainingCategory([]);
              setSelectedNewStatus(false);
              getCategories(currentGroup._id);
              setNewStatusShowError(false);
            }
          });
        },
      });

      if (!result.isConfirmed) {
        const temp = categories;
        temp.forEach((c) => {
          if (c._id === id) {
            c.loading = false;
          }
        });
        setCategories(temp);
        setNewStatusShowError(false);
      }
    }
  };

  return (
    <PipelineView
      moduleKey='category'
      selectedGroup={{ value: currentGroup._id }}
      stages={categoriesStages}
      onAddStage={addNewCategory}
      onEditStage={handleEditCategory}
      onDeleteStage={handleDeleteCategory}
      isLoading={fetching}
      showBackButton={false}
      setStages={setCategoriesStages}
      title='Category'
      // setList={setCategory}
    />
  );
};

export default CategoryView;
