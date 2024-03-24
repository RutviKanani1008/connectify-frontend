export const USER_PROFILE_TAB = {
  PERSONAL_INFORMATION: 'personal-information',
  ACTIVITIES: 'activities',
  NOTES: 'notes',
  CHECKLISTS: 'checklists',
  FILES: 'files',
  TASKS: 'tasks',
};

export const AVAILABLE_USER_PERSONAL_TABS = [
  {
    tabCode: 'personal-information',
    tabName: 'Personal Information',
    isDisabledOnAdd: false,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'activities',
    tabName: 'Activities',
    isDisabledOnAdd: true,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'notes',
    tabName: 'Notes',
    isDisabledOnAdd: true,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'checklists',
    tabName: 'Checklists',
    isDisabledOnAdd: true,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'files',
    tabName: 'Files',
    isDisabledOnAdd: true,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'tasks',
    tabName: 'Tasks',
    isDisabledOnAdd: true,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'tasks-timer-report',
    tabName: 'Tasks Timer Report',
    isDisabledOnAdd: true,
    isAdminLoginOnly: false,
  },
  {
    tabCode: 'user-settings',
    tabName: 'Settings',
    isDisabledOnAdd: true,
    isAdminLoginOnly: true,
  },
];

export const AVAILABLE_USER_TAB_KEYS = AVAILABLE_USER_PERSONAL_TABS.reduce(
  (accumulator, task) => {
    return { ...accumulator, [task.tabCode]: task.tabCode };
  },
  {}
);
