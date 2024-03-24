// ==================== Packages =======================
import React, { useState, useEffect } from 'react';
import { CmsContentModal } from './addOrUpdateCmsContentModal';
import {
  useDeleteCmsContent,
  useGetPages,
  useGetCmsContents,
} from './hooks/useApis';
import ItemTable from '../../../@core/components/data-table';
import useCmsContentColumn from './hooks/useCmsContentColumns';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { storeRemoveCmsPageContent } from '../../../redux/cmsContent';
import { useDispatch } from 'react-redux';

const CmsContent = () => {
  // ========================== states ================================
  const [availablePages, setAvailablePages] = useState([]);
  const [availableCmsContents, setAvailableCmsContents] = useState([]);
  const [addOrUpdateCmsContent, setAddOrUpdateCmsContent] = useState({
    cmsContent: null,
    isModalOpen: false,
  });

  const dispatch = useDispatch();

  // ========================== Custom Hooks ==========================
  const { getPages } = useGetPages();
  const { getCmsContent, isLoading: cmsContentsLoading } = useGetCmsContents();
  const { deleteCmsContent } = useDeleteCmsContent();

  const getAvailablePages = async () => {
    const { data, error } = await getPages();
    if (!error) {
      setAvailablePages(data);
    }
  };

  const getCmsContentList = async () => {
    const { data, error } = await getCmsContent();
    if (!error) {
      setAvailableCmsContents(data);
    }
  };

  useEffect(() => {
    getAvailablePages();
    getCmsContentList();
  }, []);

  const handleDeleteCmsContent = async (cmsContentId) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this CMS Content?',
    });

    if (result.value) {
      const { error } = await deleteCmsContent(
        cmsContentId,
        'Delete CMS Content..'
      );
      if (!error) {
        if (Array.isArray(availableCmsContents)) {
          setAvailableCmsContents(
            availableCmsContents?.filter((obj) => obj?._id !== cmsContentId)
          );
          dispatch(storeRemoveCmsPageContent({ cmsContentId }));
        }
      }
    }
  };

  const { columns } = useCmsContentColumn({
    handleDeleteCmsContent,
    setAddOrUpdateCmsContent,
  });

  const handleAddNewItem = () => {
    setAddOrUpdateCmsContent({
      isModalOpen: true,
      cmsContent: null,
    });
  };

  const handleCloseCmsContentModal = (data = null) => {
    if (data) {
      if (addOrUpdateCmsContent.cmsContent) {
        setAvailableCmsContents(
          availableCmsContents.map((cmsContent) =>
            cmsContent._id === addOrUpdateCmsContent.cmsContent?._id
              ? { ...data }
              : { ...cmsContent }
          )
        );
      } else {
        setAvailableCmsContents([...availableCmsContents, data]);
      }
    }
    setAddOrUpdateCmsContent({
      isModalOpen: false,
      cmsContent: null,
    });
  };

  return (
    <>
      <div className='user-guide-page'>
        <ItemTable
          loading={cmsContentsLoading}
          hideButton={false}
          ExportData={false}
          hideExport={true}
          columns={columns}
          data={availableCmsContents}
          searchPlaceholder={'Search CMS Content'}
          title={'CMS Content'}
          addItemLink={false}
          onClickAdd={handleAddNewItem}
          buttonTitle={'Add CMS Content'}
          itemsPerPage={10}
        />
      </div>
      {addOrUpdateCmsContent.isModalOpen && (
        <CmsContentModal
          isModalShow={addOrUpdateCmsContent.isModalOpen}
          currentCmsContent={addOrUpdateCmsContent.cmsContent}
          handleCloseModal={handleCloseCmsContentModal}
          availablePages={availablePages}
          availableCmsContent={availableCmsContents}
          addOrUpdateCmsContent={addOrUpdateCmsContent}
          setAddOrUpdateCmsContent={setAddOrUpdateCmsContent}
        />
      )}
    </>
  );
};

export default CmsContent;
