import _ from 'lodash';

export const permissionBasedSetSideBarObj = ({
  user,
  pendingChangeLogCount,
  navBarItems,
}) => {
  const permissions = user?.permissions ? user?.permissions : [];
  const inventoryProduct = user?.inventoryProductCount
    ? user?.inventoryProductCount
    : '';
  let tempMemberNavItems = [...navBarItems];
  // first check children permissions
  tempMemberNavItems = tempMemberNavItems?.map((parentObj) => {
    if (
      _.isArray(parentObj?.children) &&
      parentObj.id !== 'home' &&
      parentObj.id !== 'settings'
    ) {
      parentObj.children = parentObj?.children?.filter((obj) =>
        permissions?.includes(obj?.id)
      );
      return { ...parentObj, children: parentObj.children };
    } else {
      return parentObj;
    }
  });
  // second check children permissions
  tempMemberNavItems = tempMemberNavItems.filter(
    (obj) =>
      (obj.children && obj.children?.length > 0) ||
      (!obj.children && permissions?.includes(obj?.id)) ||
      (obj.children && permissions?.includes(obj?.id)) ||
      obj.id === 'home' ||
      obj.id === 'settings'
  );
  tempMemberNavItems = tempMemberNavItems.map((obj) => {
    if (obj.id === 'settings') {
      obj.children = obj.children.map((childObj) => {
        if (childObj.id === 'change-log') {
          return {
            ...childObj,
            badge: 'danger',
            badgeText: pendingChangeLogCount,
          };
        } else {
          return { ...childObj };
        }
      });
      return { ...obj };
    } else if (obj.id === 'inventory') {
      obj.children = obj.children.map((childObj) => {
        if (childObj.id === 'product-list') {
          return {
            ...childObj,
            badge: 'success',
            badgeText: inventoryProduct,
          };
        } else {
          return { ...childObj };
        }
      });
      return { ...obj };
    } else {
      return { ...obj };
    }
  });

  return tempMemberNavItems;
};

export const setSidebarUpdatesCount = ({ navBarItems, sidebarCount }) => {
  return navBarItems.map((item) => {
    if (item.id === 'sendRequest') {
      return {
        ...item,
        badge: 'danger',
        badgeText: sidebarCount?.supportTicket || 0,
      };
    } else if (item.id === 'featureRequest') {
      return {
        ...item,
        badge: 'danger',
        badgeText: sidebarCount?.featureRequest || 0,
      };
    }
    return item;
  });
};
