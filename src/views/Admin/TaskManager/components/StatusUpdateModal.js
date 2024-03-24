import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap'
import { SaveButton } from '../../../../@core/components/save-button'
import { showWarnAlert } from '../../../../helper/sweetalert.helper'
import {
  useGetUserTaskManagerSetting,
  useUpdateTask,
  useUpdateUserTaskManagerSetting,
} from '../service/task.services'
import { ArrowRight } from 'react-feather'
import { useLoadMentionUsers } from '../hooks/useHelper'
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor'

export const StatusUpdateModal = ({
  isOpen,
  close,
  setCurrentTasks,
  subTasks,
  currentTasks,
  setSubTasks,
  setCurrentStatusOrPriorityChangingIds,
  currentStatusOrPriorityChangingIdsRef,
  changeStatusModal,
  taskOptions,
  usersOptions,
}) => {
  const { mentionUsers, loadMentionUsers } = useLoadMentionUsers({
    assignedUsers: usersOptions?.data || [],
  })
  const [showAlertOnComplete, setShowAlertOnComplete] = useState(true)

  const { getUserTaskManagerSetting } = useGetUserTaskManagerSetting()
  const { updateTaskManagerSetting, isLoading: updateSettingLoader } =
    useUpdateUserTaskManagerSetting()

  // ** Refs
  const alertCheckboxRef = useRef(null)

  // ** states
  const [content, setContent] = useState('')

  useEffect(() => {
    loadUserTaskManagerSetting()
  }, [])

  useEffect(() => {
    loadMentionUsers({ assignedUsers: usersOptions?.data || [] })
  }, [usersOptions])

  //   ** api service hooks
  const { updateTask: updateTaskDetail, isLoading } = useUpdateTask()

  const loadUserTaskManagerSetting = async () => {
    const { data, error } = await getUserTaskManagerSetting()
    if (!error && data?.alertOnTaskComplete === false) {
      setShowAlertOnComplete(false)
    }
  }

  const handleStatus = async () => {
    let newContent = ''
    if (content) {
      newContent = content
    }

    const taskClone = JSON.parse(JSON.stringify(changeStatusModal.task))
    taskClone.status = changeStatusModal.currentOption?._id

    'contact' in taskClone && delete taskClone.contact
    'assigned' in taskClone && delete taskClone.assigned
    'createdBy' in taskClone && delete taskClone.createdBy
    taskClone.content = newContent
    taskClone.toast = false

    let res = null
    let isCompleted = false
    if (
      showAlertOnComplete &&
      changeStatusModal.currentOption?.markAsCompleted
    ) {
      const result = await showWarnAlert({
        confirmButtonText: 'Yes',
        html: alertHtml(),
      })
      if (result.value) {
        if (alertCheckboxRef.current.checked) {
          await updateTaskManagerSetting({ alertOnTaskComplete: false })
        }
        taskClone.completed = true
        isCompleted = true
        res = await updateTaskDetail(
          taskClone._id,
          taskClone,
          'Status updating'
        )
      } else {
        return false
      }
    } else {
      res = await updateTaskDetail(taskClone._id, taskClone, 'Status updating')
    }
    const { error } = res
    if (!error) {
      let tempCurrentStatusOrPriorityChangingIds = [
        ...currentStatusOrPriorityChangingIdsRef.current,
      ]
      tempCurrentStatusOrPriorityChangingIds =
        tempCurrentStatusOrPriorityChangingIds.filter(
          (id) =>
            `${changeStatusModal.task._id}-${changeStatusModal.task.status}` !==
            id
        )

      setCurrentStatusOrPriorityChangingIds([
        ...tempCurrentStatusOrPriorityChangingIds,
      ])
      currentStatusOrPriorityChangingIdsRef.current = [
        ...tempCurrentStatusOrPriorityChangingIds,
      ]
      let tempCurrentTasks = [...currentTasks]
      tempCurrentTasks = [
        ...tempCurrentTasks.map((task) => {
          if (task._id === taskClone._id) {
            return {
              ...task,
              completed: isCompleted,
              status: changeStatusModal.currentOption?._id,
              ...(res?.data?.latestUpdates
                ? { latestUpdates: res?.data?.latestUpdates }
                : {}),
            }
          } else if (
            task._id === taskClone.parent_task &&
            changeStatusModal.currentOption?.markAsCompleted
          ) {
            return {
              ...task,
              sub_tasks: task.sub_tasks ? task.sub_tasks - 1 : 0,
            }
          } else {
            return { ...task }
          }
        }),
      ]

      if (changeStatusModal.currentOption?.markAsCompleted) {
        tempCurrentTasks = tempCurrentTasks.filter(
          (task) => task._id !== taskClone._id
        )
      }
      setCurrentTasks(tempCurrentTasks)
      let tempSubTasks = [...(subTasks[taskClone.parent_task] || [])]
      tempSubTasks = [
        ...tempSubTasks.map((task) => {
          if (task._id === taskClone._id) {
            return {
              ...task,
              completed: isCompleted,
              status: changeStatusModal.currentOption?._id,
              ...(res?.data?.latestUpdates
                ? { latestUpdates: res?.data?.latestUpdates }
                : {}),
            }
          } else {
            return { ...task }
          }
        }),
      ]

      if (changeStatusModal.currentOption?.markAsCompleted) {
        tempSubTasks = tempSubTasks.filter((task) => task._id !== taskClone._id)
      }
      setSubTasks((pre) => ({ ...pre, [taskClone.parent_task]: tempSubTasks }))
      close()
    }
  }
  const previousStatus = taskOptions?.find(
    (option) => changeStatusModal.task?.status === option._id
  )

  const alertHtml = () => (
    <>
      <p>
        Are you sure you want to change this status to
        {changeStatusModal.currentOption?.label} because task will be marked as
        archived on moving task to this status ?
      </p>

      <>
        <Input
          innerRef={alertCheckboxRef}
          id='stop-alert'
          type='checkbox'
          style={{ marginTop: '4px' }}
        />
        <Label for='stop-alert' style={{ marginLeft: '4px' }}>
          Don't tell me again
        </Label>
      </>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => close()}
      className='modal-dialog-centered modal-lg'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          close()
        }}
      >
        <div className='d-flex'>Add Note</div>
      </ModalHeader>
      <ModalBody className='pt-50'>
        <Row>
          <div className='d-flex justify-content-center mb-1'>
            <span className='me-1 fw-bold'>Status :</span>
            <span className='text-primary fw-bold'>
              {previousStatus?.label || 'Unassigned'}
            </span>
            <ArrowRight className='ms-1 me-1' />
            <span className='text-primary fw-bold'>
              {changeStatusModal.currentOption.label || 'Unassigned'}
            </span>
          </div>
          <Col md={12}>
            <SyncfusionRichTextEditor
              key={`task_status_updates`}
              onChange={(e) => {
                setContent(e.value)
              }}
              value={content}
              mentionOption={mentionUsers}
              mentionEnable
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          className='me-1'
          type='reset'
          color='secondary'
          outline
          onClick={close}
        >
          Close
        </Button>
        <SaveButton
          color='primary'
          onClick={handleStatus}
          loading={isLoading || updateSettingLoader}
          name={'Save'}
          width='100px'
          className='align-items-center justify-content-center'
        />
      </ModalFooter>
    </Modal>
  )
}

export default StatusUpdateModal
