import { store } from '../redux/store';

const storeState = store.getState();
const cmsContentList = storeState.cmsContent;

export const getCmsPageContent = (page) => {
  return cmsContentList.find((content) => content.page?.pageId === page);
};
