export const getMentionsValues = (content) => {
  const assignedUsers = [];
  try {
    const temp = document.createElement('div');
    temp.innerHTML = content;
    const links = temp.querySelectorAll('.e-mention-chip');
    for (let i = 0; i < links.length; i++) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = links[i].innerHTML;
      const titleValue = tempDiv.querySelector('a').title;
      assignedUsers.push(titleValue);
    }
    return assignedUsers;
  } catch (error) {
    console.log('Error:getMentionsValues', error);
    return assignedUsers;
  }
};
