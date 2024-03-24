import { FileText, Share } from 'react-feather';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
  UncontrolledButtonDropdown,
} from 'reactstrap';
import { baseURL } from '../api/axios-config';
import { downloadFile } from '../helper/common.helper';
import { useExportDataAPI, useExportTaskDataAPI } from '../hooks/useGeneralAPI';
import { useExportTaskTimerDataAPI } from '../views/Admin/TaskManager/service/taskTimer.services';

const ExportData = ({
  model,
  query = {},
  childDropDownOptions = null,
  parentLoading = false,
  isDisabled = false,
}) => {
  const { exportDataAPI: exportTaskDataApi, isLoading: exportTaskLoading } =
    useExportTaskDataAPI();
  const { exportTaskTimerDataAPI, isLoading: taskTimerLoading } =
    useExportTaskTimerDataAPI();
  const { exportDataAPI, isLoading: exportDataLoading } = useExportDataAPI();

  const exportData = async () => {
    if (model === 'task') {
      const { data, error } = await exportTaskDataApi({ ...query });
      if (data && !error) {
        downloadFile(`${baseURL}/${data}`);
      }
    } else if (model === 'taskTimer') {
      const { data, error } = await exportTaskTimerDataAPI({ model, ...query });
      if (data && !error) {
        downloadFile(`${baseURL}/${data}`);
      }
    } else {
      const { data, error } = await exportDataAPI({ model, ...query });
      if (data && !error) {
        downloadFile(`${baseURL}/${data}`);
      }
    }
  };

  return (
    <UncontrolledButtonDropdown>
      <DropdownToggle
        color='secondary'
        caret
        outline
        disabled={
          exportTaskLoading ||
          exportDataLoading ||
          taskTimerLoading ||
          parentLoading ||
          isDisabled
        }
      >
        {(exportTaskLoading ||
          exportDataLoading ||
          taskTimerLoading ||
          parentLoading) && <Spinner className='me-1' size='sm' />}
        <Share size={15} />
        <span className='align-middle ms-50'>Actions</span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem className='w-100' onClick={() => exportData()}>
          <FileText size={15} />
          <span className='align-middle ms-50'>Export to CSV</span>
        </DropdownItem>
        {childDropDownOptions}
      </DropdownMenu>
    </UncontrolledButtonDropdown>
  );
};

export default ExportData;
