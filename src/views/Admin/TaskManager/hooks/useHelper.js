import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useGetCompanyUsers } from '../service/userApis';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

export const useHandleSideBar = ({
  setCurrentFilter,
  initialContactData,
  setCurrentTaskPagination,
  initialUserData = null,
}) => {
  const handleSidebar = (filter = {}) => {
    let tempFilter = {
      trash: false,
      snoozedTask: false,
      open: null,
      status: [],
      priority: [],
      page: 1,
      loadMore: true,
      completed: null,
      assigned: initialUserData?._id ? initialUserData._id : null,
      contact: initialContactData?._id ? initialContactData?._id : null,
      search: '',
      sort: { column: '', order: null },
      subTaskSort: {},
    };
    // document.getElementById('search-task').value = '';
    tempFilter = { ...tempFilter, ...filter };

    setCurrentFilter((prev) => {
      let existFilter = {};
      // here this object for remain one filter based on open,trash and complete
      if (filter.status || filter.priority) {
        if (prev.open) {
          existFilter = { open: prev.open };
        } else if (prev.completed) {
          existFilter = { completed: prev.completed };
        } else if (prev.trash) {
          existFilter = { trash: prev.trash };
        } else if (prev.snoozedTask) {
          existFilter = { trash: prev.snoozedTask };
        }
      }

      // if filter on trash,open and completed then reset sort
      if (
        filter.trash ||
        filter.open ||
        filter.completed ||
        filter.snoozedTask
      ) {
        prev.sort = { column: '', order: null };
        prev.subTaskSort = {};
      }

      return {
        ...tempFilter,
        ...existFilter,
        status: prev?.status,
        priority: prev?.priority,
        sort: prev?.sort,
        search: prev?.search || '',
        subTaskSort: prev?.subTaskSort,
        contact: prev?.contact,
        assigned: prev?.assigned,
        frequency: prev?.frequency,
        includeSubTasks: prev?.includeSubTasks ?? true,
        ...filter,
      };
    });

    setCurrentTaskPagination &&
      setCurrentTaskPagination({
        page: 1,
        loadMore: true,
        pagination: null,
      });
  };

  return { handleSidebar };
};

export default useHandleSideBar;

export const useLoadMentionUsers = ({ assignedUsers }) => {
  const currentUser = useSelector(userData);
  // ** states
  const [mentionUsers, setMentionUsers] = useState([]);

  // ** api service hooks
  const { getCompanyUsers } = useGetCompanyUsers();

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();

  const loadMentionUsers = async () => {
    const companyId = currentUser?.company?._id;

    if (companyId) {
      const { data, error } = await getCompanyUsers(companyId, {
        select: 'firstName,lastName,email,role',
      });
      if (!error && data && Array.isArray(data)) {
        const notifiedUsers = data.filter((user) => {
          if (assignedUsers && Array.isArray(assignedUsers)) {
            return (
              user.role === 'admin' ||
              ([...assignedUsers] || [])
                .map((u) => u.value || u._id)
                .includes(user._id)
            );
          } else {
            return true;
          }
        });
        const userOptions = notifiedUsers.map((user) => ({
          text: `${user.firstName || ''} ${user.lastName || ''}`,
          label: `${user.firstName || ''} ${user.lastName || ''}`,
          value: `${user._id}`,
          id: user._id,
          url: user._id,
          fullUrl: `${process.env.REACT_APP_APP_URL}${basicRoute}/users/${user._id}`,
        }));
        setMentionUsers([...userOptions]);
      }
    }
  };

  return { loadMentionUsers, mentionUsers };
};

// Here user filter from user list (in this list only those user which mention in task or admin user)
export const useFilteredMentionUsers = ({ mentionUsers, getValues }) => {
  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();

  const filteredMentionUsers = useMemo(() => {
    const assignedUsers = getValues(`assigned`);
    const filteredUserUsers = mentionUsers.filter((user) => {
      if (assignedUsers && Array.isArray(assignedUsers)) {
        return (
          user.role === 'admin' ||
          ([...assignedUsers] || [])
            .map((u) => u.value || u._id)
            .includes(user._id)
        );
      } else {
        return true;
      }
    });
    return filteredUserUsers.map((user) => ({
      text: `${user.firstName || ''} ${user.lastName || ''}`,
      label: `${user.firstName || ''} ${user.lastName || ''}`,
      value: `${user._id}`,
      id: user._id,
      url: user._id,
      fullUrl: `${process.env.REACT_APP_APP_URL}${basicRoute}/users/${user._id}`,
    }));
  }, [mentionUsers]);

  return { filteredMentionUsers };
};
