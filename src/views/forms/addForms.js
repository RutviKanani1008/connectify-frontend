import React, { Fragment, useEffect, useState } from 'react'
import { Edit2, Move, Plus, Send, X } from 'react-feather'
import UILoader from '@components/ui-loader'
import { useHistory, useParams } from 'react-router-dom'
import { isArray, isEmpty } from 'lodash'
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Form,
  Input,
  Label,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  UncontrolledTooltip,
} from 'reactstrap'
import * as yup from 'yup'
import { required } from '../../configs/validationConstant'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormField } from '@components/form-fields'
import { SaveButton } from '@components/save-button'
import { showToast, TOASTTYPES } from '@src/utility/toast-helper'
import {
  getFormDetail,
  saveForm,
  sendTestFormResponseMail,
  updateForm,
} from '../../api/forms'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useSelector } from 'react-redux'
import { userData } from '../../redux/user'
import { getGroupDetails } from '../../api/groups'
import MentionInput from '../../@core/components/form-fields/MentionInput'
import { mentionInputValueSet, scrollToTop } from '../../helper/common.helper'
import useGetBasicRoute from '../../hooks/useGetBasicRoute'
import EmailEditors from '../templates/EmailEditor'
import { AVAILABLE_FONT_STYLE, FORM_SCHEDULE_TIMER } from '../../constant'
import TemplatePreviewModal from './component/TemplatePreviewModal'
import SendTemplateModal from './component/SendTemplateModal'
import FieldModal, { mappedContacts } from './component/FieldsModal'
import FormPreview from './component/FormPreview'
import { showWarnAlert } from '../../helper/sweetalert.helper'
import { getEmailTemplates } from '../../api/emailTemplates'
import { useGetGroups } from './hooks/useGroupApi'
import { FormDesignFields } from './formDesignFields'
import SyncfusionRichTextEditor from '../../components/SyncfusionRichTextEditor'

const initialAccordians = {
  form_details: true,
  preview_form_fields: false,
  form_design_fields: false,
  after_form_submission: false,
  form_assignments: false,
  emails: false,
}

const accordianFormFieldValidation = {
  form_details: ['title'],
  preview_form_fields: [],
  form_design_fields: [],
  after_form_submission: ['thankyou', 'redirectLink'],
  form_assignments: [],
  emails: ['autoresponder', 'notification'],
}

const formScheme = yup.object().shape({
  title: yup.string().required(required('Title')),
  notification: yup
    .object()
    .when('notificationOptional', {
      is: true,
      then: yup.object().shape({
        emails: yup
          .array()
          .min(1, 'At least one email required!')
          .required('At least one email required!')
          .nullable(),
        jsonBody: yup.string().required().nullable(),
      }),
    })
    .nullable(),
  autoresponder: yup
    .object()
    .when('autoresponderOptional', {
      is: true,
      then: yup.object().shape({
        jsonBody: yup.string().required().nullable(),
      }),
    })
    .nullable(),
  thankyou: yup
    .string()
    .when('isThankYouPage', {
      is: 'thankYou',
      then: yup.string().required().nullable(),
    })
    .nullable(),
  redirectLink: yup
    .string()
    .when('isThankYouPage', {
      is: 'redirectLink',
      then: yup.string().url().required().nullable(),
    })
    .nullable(),
})

const Forms = () => {
  const [activeAccordions, setActiveAccordions] = useState(initialAccordians)
  const { basicRoute } = useGetBasicRoute()
  const [initialValue] = useState({
    isThankYouPage: 'thankYou',
    autoresponder: {},
    designField: {
      pageBackgroundColor: '#FFFFFF',
      pageOpacity: 100,
      fontColor: '#a3db59',
      submitButtonColor: '#a3db59',
      submitButtonFontColor: '#000000',
      fontFamily: { value: 'montserrat', label: 'Montserrat' },
      fontSize: 16,
      fieldBorderRadius: 7,
      questionSpacing: 18,
      formWidth: 600,
      submitButtonWidth: 20,
    },
    fields: [
      {
        label: 'Email',
        options: [],
        order: 0,
        placeholder: 'Enter Email Address',
        required: false,
        type: { label: 'Email', value: 'email' },
        isEdit: true,
      },
    ],
    createTaskOnSubmit: false,
    allowReCaptcha: true,
  })

  const [editFieldsId, setEditFieldsId] = useState(false)
  const [isUpdateNotification, setIsUpdateNotification] = useState({
    autoresponder: false,
    notification: false,
  })
  const [showPreview, setShowPreview] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [testMailItem, setTestMailItem] = useState({
    item: false,
    type: false,
  })
  const [formSetRenderKey, setFormSetRenderKey] = useState(1)
  const [pipelineData, setPipelineData] = useState([])
  // ------form field---------
  const [templateModal, setTemplateModal] = useState(false)
  const [templatePreviewModal, setTemplatePreviewModal] = useState(false)

  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    getValues,
    setValue,
    formState: { errors, isValid, isSubmitted, submitCount },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(formScheme),
    defaultValues: initialValue,
  })

  useEffect(() => {
    if (isSubmitted && !isValid) {
      const keysWithErrors = Object.keys(accordianFormFieldValidation).filter(
        (key) =>
          accordianFormFieldValidation[key].some((field) => field in errors)
      )
      if (keysWithErrors.length) {
        keysWithErrors.map((key) => setAccordion(key, { keepOpen: true }))

        const accordion = document.getElementById(keysWithErrors[0])
        if (accordion) {
          accordion.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [submitCount])

  const formAfterSubmittext = {
    thankYouPage: 'thankYouPage',
    redirectLink: 'redirectLink',
  }
  const { fields, append } = useFieldArray({
    control,
    name: 'fields',
  })
  const params = useParams()

  const [availableFieldType] = useState([
    {
      label: 'Text',
      value: 'text',
    },
    {
      label: 'Number',
      value: 'number',
    },
    {
      label: 'Email',
      value: 'email',
    },
    {
      label: 'TextBox',
      value: 'textarea',
    },
    {
      label: 'Phone',
      value: 'phone',
    },
    {
      label: 'Dropdown',
      value: 'select',
      isMulti: false,
    },
    {
      label: 'File',
      value: 'file',
    },
    {
      label: 'Multiple Choices',
      value: 'multiSelect',
      isMulti: true,
    },
  ])

  const history = useHistory()
  const user = useSelector(userData)
  const [loading, setLoading] = useState(false)
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  })
  const [openModal, setOpenModal] = useState(false)
  const [openEmailModal, setOpenEmailModal] = useState(false)
  const [showError, setShowError] = useState(false)
  const [currentEmail, setcurrentEmail] = useState({ text: '' })
  const [currentFromDetails, setCurrentFormDetails] = useState(false)
  const [groups, setGroups] = useState([])
  const [emailTemplates, setEmailTemplates] = useState([])

  const autoresponderOptional = useWatch({
    control,
    name: 'autoresponderOptional',
  })
  const notificationOptional = useWatch({
    control,
    name: 'notificationOptional',
  })

  const redirectUser = (id) => {
    const path = id ? `/${id}` : ''
    if (user.role === 'superadmin') {
      history.push(`/marketing/web-forms${path}`)
    } else {
      history.push(`${basicRoute}/marketing/web-forms${path}`)
    }
  }

  const onSubmit = async (data) => {
    const {
      fields,
      title,
      description,
      notification,
      autoresponder,
      showLogo,
      showTitle,
      showCompanyName,
      showDescription,
      autoResponderDelay,
      isFormAssignments,
      allowReCaptcha,
      createTaskOnSubmit,
    } = data
    if (!data.redirectLink) {
      data.redirectLink = null
    }
    if (!data.afterFormSubmit) {
      data.afterFormSubmit = formAfterSubmittext.thankYouPage
    }
    if (!data.thankyou) {
      data.thankyou = null
    }

    const tempDesignField = JSON.parse(JSON.stringify(data.designField))
    let { autoresponderOptional, notificationOptional } = data

    if (fields && fields?.length >= 0) {
      const rowField = JSON.parse(JSON.stringify(fields))
      rowField.map((field) => {
        field.type = field?.type?.value
        if (
          (['text', 'email', 'phone'].includes(field.type) &&
            field?.mappedContactField?.value) ||
          field?.mappedContactField?.value === 'custom-field'
        ) {
          field.mappedContactField = field?.mappedContactField?.value
        } else {
          field.mappedContactField = null
        }
      })
      if (autoresponderOptional === '') {
        autoresponderOptional = false
      }
      if (notificationOptional === '') {
        notificationOptional = false
      }
      if (notification?.subject === null) {
        notification.subject = ''
      }
      if (autoresponder?.subject === null) {
        autoresponder.subject = ''
      }
      if (tempDesignField?.fontFamily?.value) {
        tempDesignField.fontFamily = tempDesignField?.fontFamily.value
      }
      const obj = {}
      obj.title = title
      obj.fields = rowField
      obj.notification = notification
      obj.autoresponder = autoresponder
      if (typeof description === 'object') {
        obj.description = JSON.stringify(description)
      } else {
        obj.description = description
      }
      if (user?.company?._id) {
        obj.company = user.company._id
      } else {
        obj.company = null
      }
      obj.autoresponderOptional = autoresponderOptional
      obj.notificationOptional = notificationOptional

      obj.autoResponderDelay = autoResponderDelay?.value
      obj.thankyou = data.thankyou
      obj.redirectLink = data.redirectLink
      obj.afterFormSubmit = data.afterFormSubmit
      obj.showLogo = showLogo
      obj.showTitle = showTitle
      obj.showCompanyName = showCompanyName
      obj.showDescription = showDescription
      obj.allowReCaptcha = allowReCaptcha
      obj.createTaskOnSubmit = createTaskOnSubmit
      obj.isFormAssignments = isFormAssignments || false
      obj.designField = tempDesignField
      if (data.group) {
        obj.group = data.group
        if (data?.status) {
          obj.status = data?.status
        }
        if (data?.category) {
          obj.category = data?.category
        }
        if (data?.tags) {
          obj.tags = data?.tags
        }
        if (data?.pipeline) {
          obj.pipeline = data?.pipeline
        }
        if (data?.stage?.id) {
          obj.stage = data.stage.id
        }
      }

      if (
        currentFromDetails &&
        currentFromDetails.title &&
        currentFromDetails.title !== title
      ) {
        obj.updateName = true
      } else {
        obj.updateName = false
      }
      setButtonLoading({ submitLoading: true })
      if (params.id !== 'add') {
        updateForm(params.id, obj)
          .then((res) => {
            if (res.error) {
              if (res.errorData) {
                res.errorData.forEach((error) => {
                  showToast(TOASTTYPES.error, '', error)
                })
              } else {
                showToast(TOASTTYPES.error, '', res.error)
              }
            } else {
              showToast(TOASTTYPES.success, '', 'Form updated successfully!')
              // redirectUser();
              scrollToTop()
            }
            setButtonLoading({ submitLoading: false })
          })
          .catch(() => {
            setButtonLoading({ submitLoading: false })
          })
      } else {
        saveForm(obj)
          .then((res) => {
            if (res.error) {
              if (res.errorData && res.errorData?.length > 0) {
                res.errorData.forEach((error) => {
                  showToast(TOASTTYPES.error, '', error)
                })
              } else {
                showToast(TOASTTYPES.error, '', res.error)
              }
            } else {
              showToast(TOASTTYPES.success, '', 'Form added successfully!')
              redirectUser(res?.data?.data?._id)
            }
            setButtonLoading({ submitLoading: false })
          })
          .catch(() => {
            setButtonLoading({ submitLoading: false })
          })
      }
    } else {
      await showWarnAlert({
        text: 'Please add at least one field to submit.',
        confirmButtonText: 'Yes',
        icon: 'warning',
        showCancelButton: false,
        allowOutsideClick: false,
        cancelButtonText: 'Okay',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
        },
        buttonsStyling: false,
      })
    }
  }

  const resetField = () => {
    setEditFieldsId(false)
    setOpenModal(!openModal)
  }

  // ---------on field submit----------
  const onFieldSubmit = (data) => {
    let autoResponderHtmlContent = getValues('autoresponder.htmlBody')
    let autoResponderJsonContent = getValues('autoresponder.jsonBody')
    let autoResponderSubject = getValues('autoresponder.subject')
    let notificationHtmlContent = getValues('notification.htmlBody')
    let notificationJsonContent = getValues('notification.jsonBody')
    let notificationSubject = getValues('notification.subject')

    if (editFieldsId) {
      const oldValue = fields?.find((a, i) => i === editFieldsId)
      autoResponderHtmlContent = autoResponderHtmlContent?.replaceAll(
        `@${oldValue?.label}`,
        `@${data.label}`
      )
      autoResponderJsonContent = autoResponderJsonContent?.replaceAll(
        `@${oldValue?.label}`,
        `@${data.label}`
      )
      autoResponderSubject = autoResponderSubject?.replaceAll(
        `@[${oldValue?.label}](${oldValue?.label})`,
        `@[${data.label}](${data.label})`
      )
      notificationSubject = notificationSubject?.replaceAll(
        `@[${oldValue?.label}](${oldValue?.label})`,
        `@[${data.label}](${data.label})`
      )
      notificationHtmlContent = notificationHtmlContent?.replaceAll(
        `@${oldValue?.label}`,
        `@${data.label}`
      )

      notificationJsonContent = notificationJsonContent?.replaceAll(
        `@${oldValue?.label}`,
        `@${data.label}`
      )

      setValue('autoresponder.htmlBody', autoResponderHtmlContent)
      setValue('autoresponder.jsonBody', autoResponderJsonContent)
      setValue('autoresponder.subject', autoResponderSubject)
      setValue('notification.htmlBody', notificationHtmlContent)
      setValue('notification.jsonBody', notificationJsonContent)
      setValue('notification.subject', notificationSubject)
      setFormSetRenderKey(Math.random())
    } else {
      // if (fields.find((obj) => obj?.label === data?.label)) {
      //   // console.log('already exist........');
      // }
    }

    if (data?.options?.length) {
      data?.options?.forEach((option) => {
        delete option.__isNew__
      })
    }
    if (
      data.required === '' ||
      data.required === undefined ||
      data.required === null
    ) {
      data.required = false
    }
    if (editFieldsId !== false) {
      fields.forEach((field) => {
        if (field.id === editFieldsId?.id) {
          field.label = data.label
          field.placeholder = data.placeholder
          field.required = data.required
          // field.type = data.type;
          if (
            (['text', 'email', 'phone'].includes(data.type.value) &&
              data?.mappedContactField?.value) ||
            data?.mappedContactField?.value === 'custom-field'
          ) {
            field.mappedContactField = data.mappedContactField
          } else {
            field.mappedContactField = null
          }
          field.type = data.type
          if (!['multiSelect', 'select'].includes(field?.type?.value)) {
            field.options = []
          } else {
            field.options = data?.options
          }
        }
      })
      setValue(`fields`, fields)
      setEditFieldsId(false)
    } else {
      if (
        !['text', 'email', 'phone'].includes(data.type.value) &&
        data?.mappedContactField?.value &&
        data?.mappedContactField?.value !== 'custom-field'
      ) {
        data.mappedContactField = null
      }
      data.isEdit = true
      data.options = data.options ? data.options : []
      data.order = fields.length
      append(data)
    }
    resetField()
  }

  const removeFields = async (index) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this field?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    })

    if (result.isConfirmed) {
      const field = fields.filter((field, i) => i !== index)
      setValue('fields', field)
      // ----------remove from autoresponder and notification------
      let autoResponderHtmlContent = getValues('autoresponder.htmlBody')
      let autoResponderJSONContent = getValues('autoresponder.jsonBody')
      let notificationHtmlContent = getValues('notification.htmlBody')
      let notificationJSONContent = getValues('notification.jsonBody')
      let autoResponderSubject = getValues('autoresponder.subject')
      let notificationSubject = getValues('notification.subject')
      const oldValue = fields?.find((a, i) => i === index)
      autoResponderHtmlContent = autoResponderHtmlContent?.replaceAll(
        `@${oldValue?.label}`,
        ''
      )
      autoResponderJSONContent = autoResponderJSONContent?.replaceAll(
        `@${oldValue?.label}`,
        ''
      )
      notificationHtmlContent = notificationHtmlContent?.replaceAll(
        `@${oldValue?.label}`,
        ''
      )
      notificationJSONContent = notificationJSONContent?.replaceAll(
        `@${oldValue?.label}`,
        ''
      )
      autoResponderSubject = autoResponderSubject?.replaceAll(
        `@[${oldValue?.label}](${oldValue?.label})`,
        ''
      )
      notificationSubject = notificationSubject?.replaceAll(
        `@[${oldValue?.label}](${oldValue?.label})`,
        ''
      )
      setValue('autoresponder.htmlBody', autoResponderHtmlContent)
      setValue('autoresponder.jsonBody', autoResponderJSONContent)
      setValue('notification.htmlBody', notificationHtmlContent)
      setValue('notification.jsonBody', notificationJSONContent)
      setValue('autoresponder.subject', autoResponderSubject)
      setValue('notification.subject', notificationSubject)
      setFormSetRenderKey(Math.random())
    }
  }

  const editFields = (index) => {
    setOpenModal(!openModal)
    setEditFieldsId(index)
  }

  const getForms = () => {
    if (params.id !== 'add') {
      setLoading(true)
      getFormDetail(params.id)
        .then((res) => {
          if (res.error) {
            if (res.errorData) {
              res.errorData.forEach(() => {})
              redirectUser()
            } else {
              redirectUser()
            }
          } else {
            if (res.data.data === null) {
              history.goBack()
            }

            const tempForms = res.data.data
            tempForms?.fields?.forEach((field) => {
              if (field?.type) {
                const type = availableFieldType.find(
                  (types) => types?.value === field?.type
                )
                field.type = type
              }
              if (field?.label === 'Email' && field?.type?.value === 'email') {
                field.isEdit = true
              } else {
                field.isEdit = true
              }
              if (
                (['text', 'email', 'phone'].includes(field?.type?.value) &&
                  field?.mappedContactField) ||
                field?.mappedContactField === 'custom-field'
              ) {
                field.mappedContactField = mappedContacts.find((mappedField) =>
                  mappedField?.value.includes(field.mappedContactField)
                )
              }
            })

            // ------------------Form Field ----------------
            if (
              tempForms?.designField?.fontFamily &&
              tempForms?.designField?.fontFamily !== ''
            ) {
              //
              tempForms.designField.fontFamily = AVAILABLE_FONT_STYLE.find(
                (fontFamily) =>
                  fontFamily?.value === tempForms?.designField?.fontFamily
              )
            }
            // ------------------End Form Field ----------------
            tempForms?.fields.sort(({ order: a }, { order: b }) => a - b)
            if (tempForms?.notification?.emails?.length > 0) {
              const temp = []
              tempForms.notification.emails.forEach((email) => {
                const obj = {}
                obj['label'] = email
                obj['value'] = email
                temp.push(obj)
              })
              tempForms.notification.emails = temp
            }
            const temp = { autoresponder: false, notification: false }
            if (
              tempForms?.autoresponderOptional &&
              tempForms?.autoresponder === null
            ) {
              temp.autoresponder = true
            }
            if (
              tempForms?.notificationOptional &&
              tempForms?.notification === null
            ) {
              temp.notification = true
            }
            if (tempForms?.thankyou) {
              tempForms.afterFormSubmit = formAfterSubmittext.thankYouPage
              tempForms.isThankYouPage = 'thankYou'
            }
            if (tempForms.redirectLink) {
              tempForms.afterFormSubmit = formAfterSubmittext.redirectLink
              tempForms.isThankYouPage = 'redirectLink'
            }

            if (tempForms?.group) {
              const obj = {}
              obj.id = tempForms?.group?.id?._id
              obj.value = tempForms?.group?.id?.groupCode
              obj.label = tempForms?.group?.id?.groupName
              delete tempForms?.group?.id
              tempForms.group = obj
              handleGroupChange(obj, false, tempForms?.pipeline?.id?._id)
            }
            // -----------status--------------
            if (tempForms?.status?.id) {
              const obj = {}
              obj.id = tempForms?.status?.id?._id
              obj.value = tempForms?.status?.id?.statusCode
              obj.label = tempForms?.status?.id?.statusName
              delete tempForms?.status?.id
              tempForms.status = obj
            } else {
              tempForms.status = null
            }
            // --------category-----------
            if (tempForms?.category?.id) {
              const obj = {}
              obj.id = tempForms?.category?.id?._id
              obj.value = tempForms?.category?.id?.categoryId
              obj.label = tempForms?.category?.id?.categoryName
              delete tempForms?.category?.id
              tempForms.category = obj
            } else {
              tempForms.category = null
            }
            // ------------pipeline-----------
            if (tempForms?.pipeline) {
              if (tempForms?.stage) {
                const stages = tempForms?.pipeline?.id?.stages
                if (isArray(stages)) {
                  const tempStage = stages.find(
                    (obj) => obj._id === tempForms?.stage
                  )
                  if (tempStage) {
                    const obj = {
                      id: tempStage?._id,
                      value: tempStage?.code,
                      label: tempStage?.title,
                    }
                    tempForms.stage = obj
                  }
                }
              }
              const obj = {}
              obj.id = tempForms?.pipeline?.id?._id
              obj.value = tempForms?.pipeline?.id?.pipelineCode
              obj.label = tempForms?.pipeline?.id?.pipelineName
              tempForms.pipeline = obj
            } else {
              tempForms.pipeline = null
              tempForms.stage = null
            }

            if (tempForms?.tags && tempForms?.tags?.length > 0) {
              let tags = JSON.parse(JSON.stringify(tempForms?.tags))
              tags = tags.filter((tag) => tag?.id?._id)
              tags = tags.map((tag) => ({
                id: tag?.id?._id,
                value: tag?.id?.tagId,
                label: tag?.id?.tagName,
              }))
              if (isArray(tags)) {
                tempForms.tags = tags
              }
            }
            if (!tempForms.autoresponder) {
              tempForms.autoresponder = {}
            }
            setIsUpdateNotification(temp)
            tempForms.autoResponderDelay = FORM_SCHEDULE_TIMER.find(
              (obj) => obj?.value === tempForms.autoResponderDelay
            )
            reset(tempForms)
            setFormSetRenderKey(Math.random())
            setCurrentFormDetails(tempForms)
          }
          setLoading(false)
        })
        .catch((error) => {
          console.log({ error })
          setLoading(false)
        })
    }
  }

  const { getGroups } = useGetGroups()

  const getTagsDetails = async () => {
    const { data, error } = await getGroups({
      company: user.company?._id,
      active: true,
    })

    if (!error) {
      const group = JSON.parse(JSON.stringify(data))
      const groupObj = []
      group.forEach((groupDetail) => {
        if (groupDetail.active) {
          const obj = {}
          obj['label'] = groupDetail.groupName
          obj['value'] = groupDetail.groupCode
          obj['id'] = groupDetail._id
          groupObj.push(obj)
        }
      })
      setGroups(groupObj)
    }
  }

  const setGroupRelatedValue = (
    groupValues,
    eraseOldValue,
    pipelineId = false
  ) => {
    if (isArray(groupValues?.pipeline)) {
      setPipelineData(groupValues.pipeline)
    }
    if (eraseOldValue) {
      setValue('status', null)
      setValue('category', null)
      setValue('tags', null)
      setValue('pipeline', null)
      setValue('stage', null)
    }
    if (groupValues?.status) {
      const listObj = []
      groupValues?.status?.forEach((status) => {
        const obj = {}
        obj.id = status._id
        obj.value = status.statusCode
        obj.label = status.statusName
        listObj.push(obj)
      })
      setValue('statusList', listObj)
    }
    if (groupValues?.category) {
      const listObj = []
      groupValues?.category?.forEach((category) => {
        const obj = {}
        obj.id = category._id
        obj.value = category.categoryId
        obj.label = category.categoryName
        listObj.push(obj)
      })
      setValue('categoryList', listObj)
    }
    if (groupValues?.tags) {
      const listObj = []
      groupValues?.tags?.forEach((tag) => {
        const obj = {}
        obj.id = tag._id
        obj.value = tag.tagId
        obj.label = tag.tagName
        listObj.push(obj)
      })
      setValue('tagList', listObj)
    }
    if (groupValues?.pipeline) {
      const tempContactObj = groupValues?.pipeline ? groupValues?.pipeline : []
      const contactPipeline = []
      if (tempContactObj && tempContactObj.length > 0) {
        tempContactObj.forEach((temp) => {
          const obj = {}
          obj.label = temp.pipelineName
          obj.value = temp.pipelineCode
          obj.id = temp._id
          contactPipeline.push(obj)
        })
      }
      setValue('pipelineList', contactPipeline)
      if (pipelineId) {
        handlePipelineChange({ id: pipelineId }, false, groupValues?.pipeline)
      }
    }
  }

  const handleGroupChange = (
    value,
    eraseOldValue = true,
    pipelineId = false
  ) => {
    getGroupDetails(value.id).then((res) => {
      if (res.data.data) {
        setGroupRelatedValue(res.data.data, eraseOldValue, pipelineId)
      }
    })
  }
  const handlePipelineChange = (
    value,
    eraseOldValue = true,
    tempPipelineData = pipelineData
  ) => {
    if (eraseOldValue) {
      setValue('stage', null)
    }
    let stages = tempPipelineData?.find((obj) => obj._id === value.id)?.stages
    if (isArray(stages)) {
      stages = stages.map((obj) => ({
        id: obj._id,
        value: obj.code,
        label: obj.title,
      }))
    }
    if (isArray(stages)) {
      setValue('stageList', stages)
    }
  }

  useEffect(() => {
    if (params.id !== 'add') {
      getForms()
    } else {
      setIsUpdateNotification({
        autoresponder: true,
        notification: true,
      })
    }
    getTagsDetails()
    getTemplatesFunc()
  }, [])

  //--------- get email templates ----------
  const getTemplatesFunc = async () => {
    try {
      const res = await getEmailTemplates()
      const data = res?.data?.data
      if (isArray(data)) {
        setEmailTemplates(res.data.data)
      }
    } catch (e) {
      console.log(e?.message)
    }
  }

  // set template value
  const setTemplateValueFunc = (value, type) => {
    const template = emailTemplates.find((obj) => obj._id === value?.id)
    if (type === 'autoresponder') {
      setValue(
        'autoresponder.subject',
        template?.subject ? template?.subject : ''
      )
      setValue(
        'autoresponder.htmlBody',
        template?.htmlBody ? template?.htmlBody : null
      )
      setValue(
        'autoresponder.jsonBody',
        template?.jsonBody ? template?.jsonBody : null
      )
    } else {
      setValue(
        'notification.subject',
        template?.subject ? template?.subject : ''
      )
      setValue(
        'notification.htmlBody',
        template?.htmlBody ? template?.htmlBody : null
      )
      setValue(
        'notification.jsonBody',
        template?.jsonBody ? template?.jsonBody : null
      )
    }
    setFormSetRenderKey(Math.random())
  }

  const handleOptionChange = () => {}

  const onDragEnd = (result) => {
    if (result.destination) {
      const rowData = JSON.parse(JSON.stringify(fields))
      rowData.forEach((field) => {
        if (
          result.destination.index > result.source.index &&
          field.order >= result.source.index &&
          field.order <= result.destination.index
        ) {
          field.order = field.order - 1
        }
        if (
          result.source.index > result.destination.index &&
          field.order >= result.destination.index &&
          field.order <= result.source.index
        ) {
          field.order = field.order + 1
        }
        if (`id_${field.id}` === result.draggableId) {
          field.order = result.destination.index
        }
      })
      rowData.sort(({ order: a }, { order: b }) => a - b)
      setValue('fields', rowData)
    }
  }

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  }

  const handleEmails = (values) => {
    if (values && values.length > 0) {
      const validEmail = []
      values.forEach((value) => {
        if (validateEmail(value.value)) {
          validEmail.push(value)
        }
      })
      setValue('notification.emails', validEmail)
    }
  }

  const sendTestMail = () => {
    if (
      params.id !== 'add' &&
      currentEmail.text !== '' &&
      validateEmail(currentEmail.text)
    ) {
      const toastId = showToast(TOASTTYPES.loading, '', 'Sending Test Mail...')
      const obj = {}
      obj.id = params.id
      obj.email = currentEmail.text
      obj.type = testMailItem.type

      sendTestFormResponseMail(obj).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error)
        } else {
          showToast(TOASTTYPES.success, toastId, 'Mail send Successfully')
        }
      })
      setTestMailItem({
        item: false,
        type: false,
      })
      setShowError(false)
      setcurrentEmail({ text: '' })
      setOpenEmailModal(!openEmailModal)
    } else {
      setShowError(true)
    }
  }

  const sendMail = (item, type) => {
    setTestMailItem({ item, type })
    setOpenEmailModal(!openEmailModal)
  }

  const TemplateCard = ({ item, title, type }) => {
    const { subject } = item

    return (
      <>
        <div className='company-form-card'>
          <div className='header-wrapper'>
            <div className='form-card-title'>{title}</div>
            <div className='action-btn-wrapper'>
              <div
                className='action-btn edit-btn'
                onClick={() => {
                  if (title === 'Autoresponder') {
                    setIsUpdateNotification({
                      ...isUpdateNotification,
                      autoresponder: true,
                    })
                  } else {
                    setIsUpdateNotification({
                      ...isUpdateNotification,
                      notification: true,
                    })
                  }
                }}
              >
                <Edit2 size={15} className='cursor-pointer' />
              </div>
            </div>
          </div>
          <div className='body-wrapper'>
            {subject && (
              <div className='cn-wrapper'>
                <h3 className='title'>Subject</h3>
                <p className='text'>{mentionInputValueSet(fields, subject)}</p>
              </div>
            )}
            <div className='btn-wrapper'>
              {type === 'autoresponder' ? (
                getValues('autoresponder') &&
                getValues('autoresponder.htmlBody') ? (
                  <SaveButton
                    type='button'
                    loading={false}
                    className=''
                    // name={'Update Template'}
                    name={'Edit Autoresponder'}
                    onClick={() => openTemplatePreview('autoresponder')}
                  />
                ) : (
                  <></>
                )
              ) : getValues('notification') &&
                getValues('notification.htmlBody') ? (
                <SaveButton
                  type='button'
                  loading={false}
                  // className='align-items-center justify-content-center ms-1'
                  className=''
                  // name={'Update Template'}
                  name={'Preview template'}
                  onClick={() => openTemplatePreview('notification')}
                />
              ) : (
                <>
                  <div className='mb-2'></div>
                </>
              )}

              <Button
                className=''
                color='primary'
                onClick={() => {
                  if (title === 'Autoresponder') {
                    sendMail(item, 'autoresponder')
                  } else {
                    sendMail(item, 'notifications')
                  }
                }}
              >
                <Send size={15} />
                <span className='align-middle ms-50'>Send Test Email</span>
              </Button>
            </div>
          </div>
        </div>

        <Row>
          <Col>
            {item?.emails && item?.emails.length > 0 ? (
              <div>
                <label className='form-label form-label'>Recipients</label>
                <h5 className='mb-0'>
                  {item?.emails?.map((email, index) =>
                    index === item?.emails?.length - 1
                      ? `${email.value}`
                      : `${email.value},  `
                  )}
                </h5>
                {/* {item?.emails.map((email, index) => {
                    {
                      return (
                        <Fragment key={index}>
                          <h5 className='d-inline-block mr-1'>{email.value}</h5>
                        </Fragment>
                      );
                    }
                  })} */}
              </div>
            ) : null}
          </Col>
        </Row>
      </>
    )
  }

  const checkForValidation = (data) => {
    let flag = 1
    if (data && data.fields && data.fields.length > 0 && data.response) {
      data.fields.forEach((field) => {
        if (field.required) {
          if (field.type === 'file' && field.required) {
            setError(
              `upload`,
              { type: 'required', message: `Upload is Required.` },
              { shouldFocus: true }
            )
            flag = 0
          } else if (
            !data.response[field.label] ||
            data.response[field.label] === '' ||
            data.response[field.label] === null ||
            data.response[field.label] === undefined
          ) {
            setError(
              `response[${field.label}]`,
              { type: 'focus', message: `${field.label} is Required.` },
              { shouldFocus: true }
            )
            flag = 0
          }
        }
      })
    }
    return flag
  }

  const onFormPreviewSubmit = (data) => {
    if (checkForValidation(data)) {
      setShowThankYou(!showThankYou)
    }
  }

  const statusList = useWatch({
    control,
    name: 'statusList',
  })
  const tagList = useWatch({
    control,
    name: 'tagList',
  })
  const categoryList = useWatch({
    control,
    name: 'categoryList',
  })
  const group = useWatch({
    control,
    name: 'group',
  })
  const pipelineList = useWatch({
    control,
    name: 'pipelineList',
  })
  const stageList = useWatch({
    control,
    name: 'stageList',
  })
  const afterFormSubmitType = useWatch({
    control,
    name: 'afterFormSubmit',
  })

  const [editTemplateType, setEditTemplateType] = useState(false)
  const [templatePreview, setTemplatePreview] = useState(false)
  const onTemplateDone = ({ design, html }) => {
    if (editTemplateType === 'autoresponder') {
      setValue('autoresponder.htmlBody', html)
      setValue('autoresponder.jsonBody', JSON.stringify(design))
      setEditTemplateType(false)
      setTemplateModal(false)
    }
    if (editTemplateType === 'notification') {
      setValue('notification.htmlBody', html)
      setValue('notification.jsonBody', JSON.stringify(design))
      setEditTemplateType(false)
      setTemplateModal(false)
    }
  }

  const openTemplateEditor = (type) => {
    setEditTemplateType(type)

    setTemplateModal(true)
  }

  const openTemplatePreview = (type) => {
    setTemplatePreview(type)
    setTemplatePreviewModal(true)
  }

  const onTemplatePreviewModalClose = () => {
    setTemplatePreviewModal(false)
    setTemplatePreview(false)
  }

  const onSendTemplateModalClose = () => {
    setTestMailItem({
      item: false,
      type: false,
    })
    setOpenEmailModal(!openEmailModal)
  }

  const setAccordion = (key, { keepOpen = false } = { keepOpen: false }) => {
    // if accordian is active -> it is being closed
    if (activeAccordions[key]) {
      // check if only single accordian open
      const activeAccordionList = Object.keys(activeAccordions).filter(
        (item) => activeAccordions[item]
      )
      if (activeAccordionList.length === 1) {
        setActiveAccordions({
          ...activeAccordions,
          [key]: !activeAccordions[key],
          form_details: true,
        })
        return
      }
    }
    setActiveAccordions({
      ...activeAccordions,
      [key]: keepOpen ? true : !activeAccordions[key],
    })
  }

  return (
    <div className='form-preview-page'>
      <UILoader blocking={loading}>
        <Card>
          <CardHeader className='d-flex justify-content-between'>
            <div>
              {/* BACK BUTTON IN FORM */}
              <div
                className='back-arrow'
                onClick={() => history.goBack()}
                id={'goback'}
              >
                <UncontrolledTooltip placement='top' target={`goback`}>
                  Go Back
                </UncontrolledTooltip>
              </div>
              <CardTitle className='text-primary'>
                {showPreview
                  ? 'Form Preview'
                  : params.id !== 'add'
                  ? 'Update Form'
                  : 'Add Forms'}
              </CardTitle>
            </div>
            <div className='right'>
              <label className='label'>Preview</label>
              <div className='switch-checkbox'>
                <Input
                  type={'switch'}
                  inline='true'
                  onChange={() => {
                    setShowPreview(!showPreview)
                    setShowThankYou(false)
                  }}
                />
                <span className='switch-design'></span>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className='add-company-form-wrapper'>
              {!showPreview ? (
                <>
                  <Form
                    className='auth-login-form mt-2'
                    onSubmit={handleSubmit(onSubmit)}
                    autoComplete='off'
                  >
                    <div className='inner-scroll-wrapper hide-scrollbar'>
                      {/* Form Details new start */}
                      <div
                        id='form_details'
                        className={`accordian-loyal-box form-details ${
                          activeAccordions.form_details && 'active'
                        }`}
                      >
                        <div
                          className='accordian-loyal-header'
                          onClick={() => setAccordion('form_details')}
                        >
                          <div className='inner-wrapper'>
                            <h3 className='title'>Form Details</h3>
                            <button
                              className='down-arrow'
                              type='button'
                            ></button>
                          </div>
                        </div>
                        <div className='accordian-loyal-body mb-2'>
                          <div className='permission-row-wrapper from-details'>
                            <div className='permission-row'>
                              <div className='inner-wrapper'>
                                <div className='permission-title'>
                                  Show Company Logo
                                </div>
                                <div className='switch-checkbox'>
                                  <FormField
                                    type='switch'
                                    errors={errors}
                                    control={control}
                                    name='showLogo'
                                    defaultValue={
                                      getValues('showLogo') !== undefined
                                        ? getValues('showLogo')
                                        : true
                                    }
                                    key={getValues('showLogo')}
                                  />
                                  <span className='switch-design'></span>
                                </div>
                              </div>
                            </div>
                            <div className='permission-row'>
                              <div className='inner-wrapper'>
                                <div className='permission-title'>
                                  Show Company Name
                                </div>
                                <div className='switch-checkbox'>
                                  <FormField
                                    type='switch'
                                    errors={errors}
                                    control={control}
                                    name='showCompanyName'
                                    defaultValue={
                                      getValues('showCompanyName') !== undefined
                                        ? getValues('showCompanyName')
                                        : true
                                    }
                                    key={getValues('showCompanyName')}
                                  />
                                  <span className='switch-design'></span>
                                </div>
                              </div>
                            </div>
                            <div className='permission-row'>
                              <div className='inner-wrapper'>
                                <div className='permission-title'>Title</div>
                                <div className='switch-checkbox'>
                                  <FormField
                                    type='switch'
                                    errors={errors}
                                    control={control}
                                    name='showTitle'
                                    defaultValue={
                                      getValues('showTitle') !== undefined
                                        ? getValues('showTitle')
                                        : true
                                    }
                                  />
                                  <span className='switch-design'></span>
                                </div>
                              </div>
                            </div>
                            <div className='permission-row'>
                              <div className='inner-wrapper'>
                                <div className='permission-title'>
                                  Description
                                </div>
                                <div className='switch-checkbox'>
                                  <FormField
                                    type='switch'
                                    errors={errors}
                                    control={control}
                                    name='showDescription'
                                    defaultValue={
                                      getValues('showDescription') !== undefined
                                        ? getValues('showDescription')
                                        : true
                                    }
                                    key={getValues('showDescription')}
                                  />
                                  <span className='switch-design'></span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='mb-1'>
                            <FormField
                              name='title'
                              placeholder='Enter Form Title'
                              type='text'
                              errors={errors}
                              control={control}
                            />
                          </div>
                          {/* REVIEW - STYLE */}
                          <SyncfusionRichTextEditor
                            key={`form_description_${formSetRenderKey}`}
                            onChange={(e) => {
                              setValue('description', e.value, {
                                shouldValidate: true,
                              })
                            }}
                            value={getValues('description')}
                          />
                          {/* editorStyle=
                          {{
                            border: '1px solid',
                            minHeight: '175px',
                          }}
                          wrapperClassName='template-editor-wrapper' 
                          editorClassName='editor-class'*/}
                          {errors?.description &&
                            errors?.description?.type === 'required' && (
                              <span className='form-error'>
                                Description is required
                              </span>
                            )}
                          <div className='permission-row-wrapper from-details'>
                            <div className='permission-row pb-0 mb-0 mt-1'>
                              <div className='inner-wrapper'>
                                <div className='permission-title'>
                                  Allow ReCaptcha
                                </div>
                                <div className='switch-checkbox'>
                                  <FormField
                                    type='switch'
                                    errors={errors}
                                    control={control}
                                    name='allowReCaptcha'
                                    defaultValue={getValues('allowReCaptcha')}
                                    key={getValues('allowReCaptcha')}
                                  />
                                  <span className='switch-design'></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Form Details new end */}

                      {/* Preview Form Fields */}
                      <div
                        id='preview_form_fields'
                        className={`accordian-loyal-box preview-form-fields ${
                          activeAccordions.preview_form_fields && 'active'
                        }`}
                      >
                        <div
                          className='accordian-loyal-header'
                          onClick={() => setAccordion('preview_form_fields')}
                        >
                          <div className='inner-wrapper'>
                            <h3 className='title'>Preview Form Fields</h3>
                            <button
                              className='down-arrow'
                              type='button'
                            ></button>
                          </div>
                        </div>
                        <div className='accordian-loyal-body mb-2'>
                          <div className='field-repeater-row-wrapper'>
                            <DragDropContext onDragEnd={onDragEnd}>
                              <Droppable droppableId='droppable'>
                                {(provided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    {fields && fields.length > 0 ? (
                                      fields.map((field, index) => {
                                        return (
                                          <Fragment key={index}>
                                            <Draggable
                                              key={field.id}
                                              draggableId={`id_${field.id}`}
                                              index={index}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                >
                                                  <div className='field-repeater-row'>
                                                    <div className='title-wrapper'>
                                                      <Label for={field.label}>
                                                        <Move
                                                          size={12}
                                                          className='cursor cursor-all-scroll move-btn'
                                                        />{' '}
                                                        <span
                                                          className='text'
                                                          id={`idl_${field.id}`}
                                                        >
                                                          {field.label}
                                                        </span>
                                                        <UncontrolledTooltip
                                                          placement='top'
                                                          autohide={true}
                                                          target={`idl_${field.id}`}
                                                        >
                                                          {field.label}
                                                        </UncontrolledTooltip>
                                                        {field?.required ? (
                                                          <>
                                                            <span className='text-danger required-field-sign'>
                                                              *
                                                            </span>
                                                          </>
                                                        ) : null}
                                                      </Label>
                                                    </div>
                                                    <div className='form-field-wrapper'>
                                                      <FormField
                                                        placeholder={
                                                          field.placeholder
                                                        }
                                                        type={
                                                          field?.type?.value ===
                                                          'multiSelect'
                                                            ? 'select'
                                                            : field?.type?.value
                                                        }
                                                        isMulti={
                                                          field?.type?.value ===
                                                          'multiSelect'
                                                        }
                                                        errors={errors}
                                                        options={field?.options}
                                                        control={control}
                                                        name={field.label}
                                                      />
                                                    </div>
                                                    {field.isEdit ? (
                                                      <div className='action-btn-wrapper'>
                                                        <div className='action-btn edit-btn'>
                                                          <Edit2
                                                            className='text-primary cursor-pointer'
                                                            size={12}
                                                            onClick={() => {
                                                              editFields(field)
                                                            }}
                                                          />
                                                        </div>
                                                        <div className='action-btn delete-btn'>
                                                          <X
                                                            size={14}
                                                            className='text-primary cursor-pointer'
                                                            onClick={() => {
                                                              removeFields(
                                                                index
                                                              )
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          </Fragment>
                                        )
                                      })
                                    ) : (
                                      <>
                                        <span className='text-primary'>
                                          Please add at least one field
                                        </span>
                                      </>
                                    )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          </div>
                          <div className='submit-btn-wrapper'>
                            <Button
                              type='button'
                              color='primary'
                              size='md'
                              onClick={() => {
                                setOpenModal(!openModal)
                                // setIsFormFieldUnique(true);
                              }}
                            >
                              <Plus size={15} />
                              <span className='align-middle ms-25'>
                                {editFieldsId === false
                                  ? 'Add Field'
                                  : 'Update Field'}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Preview Form Fields end */}

                      {/* Form Design Fields */}
                      <div
                        id='form_design_fields'
                        className={`accordian-loyal-box form-design-fields ${
                          activeAccordions.form_design_fields && 'active'
                        }`}
                      >
                        <div
                          className='accordian-loyal-header'
                          onClick={() => setAccordion('form_design_fields')}
                        >
                          <div className='inner-wrapper'>
                            <h3 className='title'>Form Design Fields</h3>
                            <button
                              className='down-arrow'
                              type='button'
                            ></button>
                          </div>
                        </div>
                        <div className='accordian-loyal-body mb-2'>
                          <div className=''>
                            <FormDesignFields
                              errors={errors}
                              control={control}
                              getValues={getValues}
                              setValue={setValue}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Form Design Fields end */}

                      {/* After Form Submitted */}
                      <div
                        id='after_form_submission'
                        className={`accordian-loyal-box after-form-submitted ${
                          activeAccordions.after_form_submission && 'active'
                        } ${
                          errors?.thankyou &&
                          errors?.thankyou?.type === 'required' &&
                          'is-invalid'
                        }`}
                        key={activeAccordions.after_form_submission}
                      >
                        <div
                          className='accordian-loyal-header'
                          onClick={() => setAccordion('after_form_submission')}
                        >
                          <div className='inner-wrapper'>
                            <h3 className='title'>After Form Submitted</h3>
                            <button
                              className='down-arrow'
                              type='button'
                            ></button>
                          </div>
                        </div>
                        <div className='accordian-loyal-body mb-2'>
                          <div className='customRadio-btn-wrapper'>
                            <FormField
                              type='radio'
                              error={errors}
                              control={control}
                              options={[
                                { label: 'Thank You Page', value: 'thankYou' },
                                {
                                  label: 'Redirect Link',
                                  value: 'redirectLink',
                                },
                              ]}
                              name='isThankYouPage'
                              defaultValue={getValues('isThankYouPage')}
                              key={getValues('isThankYouPage')}
                              onChange={(e) => {
                                const { value } = e.target
                                if (value === 'thankYou') {
                                  setValue('redirectLink', null)
                                  setValue(
                                    'afterFormSubmit',
                                    formAfterSubmittext.thankYouPage
                                  )
                                } else {
                                  setValue('thankyou', null)
                                  setValue(
                                    'afterFormSubmit',
                                    formAfterSubmittext.redirectLink
                                  )
                                }
                              }}
                            />
                          </div>
                          <div className='form-field-wrapper'>
                            {/* <AfterFormSubmit /> */}
                            {afterFormSubmitType ===
                            formAfterSubmittext.redirectLink ? (
                              <>
                                <div className='form-field-group'>
                                  <Label for='fname'>Redirect Link</Label>
                                  <FormField
                                    name='redirectLink'
                                    type='text'
                                    errors={errors}
                                    control={control}
                                    placeholder='Enter Redirect URL'
                                    defaultValue={getValues('redirectLink')}
                                    // {...register(`redirectLink`, {
                                    //   onBlur: (e) => isValidHttpUrl(e),
                                    // })}
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className='form-field-group'>
                                  <Label for='fname'>Thank You Card</Label>
                                  {/* REVIEW - STYLE */}
                                  <SyncfusionRichTextEditor
                                    key={`thank_you_${formSetRenderKey}`}
                                    onChange={(e) => {
                                      setValue('thankyou', e.value, {
                                        shouldValidate: true,
                                      })
                                    }}
                                    value={getValues('thankyou')}
                                  />
                                  {/* editorStyle=
                                  {{
                                    border: '1px solid',
                                    minHeight: '175px',
                                  }}
                                  wrapperClassName='template-editor-wrapper'
                                  editorClassName='editor-class' */}
                                  {errors?.thankyou &&
                                    errors?.thankyou?.type === 'required' && (
                                      <span className='form-error'>
                                        Body is required
                                      </span>
                                    )}
                                </div>
                              </>
                            )}
                          </div>
                          <div className='permission-row-wrapper from-details'>
                            <div className='permission-row pb-0 mb-0 mt-1'>
                              <div className='inner-wrapper'>
                                <div className='permission-title'>
                                  Create Task On Submit
                                </div>
                                <div className='switch-checkbox'>
                                  <FormField
                                    type='switch'
                                    errors={errors}
                                    control={control}
                                    name='createTaskOnSubmit'
                                    defaultValue={getValues(
                                      'createTaskOnSubmit'
                                    )}
                                    key={getValues('createTaskOnSubmit')}
                                  />
                                  <span className='switch-design'></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* After Form Submitted end */}

                      {/* Form Assignments */}
                      <div
                        id='form_assignments'
                        className={`accordian-loyal-box form-assignments ${
                          activeAccordions.form_assignments && 'active'
                        }`}
                      >
                        <div
                          className='accordian-loyal-header'
                          onClick={() => {
                            if (getValues('isFormAssignments')) {
                              setAccordion('form_assignments')
                            }
                          }}
                        >
                          <div className='d-flex inner-wrapper'>
                            <h3 className='title me-1'>Form Assignments</h3>
                            <div id={'allowFormAssign'}>
                              <FormField
                                type='checkbox'
                                errors={errors}
                                control={control}
                                name='isFormAssignments'
                                defaultValue={getValues('isFormAssignments')}
                                key={getValues('isFormAssignments')}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  if (!e.target.checked) {
                                    setActiveAccordions({
                                      ...activeAccordions,
                                      form_assignments: false,
                                    })
                                    setValue('status', null)
                                    setValue('category', null)
                                    setValue('tags', null)
                                    setValue('pipeline', null)
                                    setValue('stage', null)
                                    setValue('group', null)
                                  }
                                  setValue(
                                    'isFormAssignments',
                                    e.target.checked
                                  )
                                }}
                              />
                              <UncontrolledTooltip
                                placement='top'
                                autohide={true}
                                target={`allowFormAssign`}
                              >
                                Allow form submission to convert into contact
                              </UncontrolledTooltip>
                            </div>
                            <button
                              className='down-arrow'
                              type='button'
                            ></button>
                          </div>
                        </div>
                        <div className='accordian-loyal-body mb-2'>
                          <Row>
                            <Col md='4' className='mb-1 form-filed-wrapper'>
                              <FormField
                                name='group'
                                label='Assign Group'
                                placeholder='Select Group'
                                type='select'
                                errors={errors}
                                control={control}
                                options={groups}
                                onChange={handleGroupChange}
                              />
                            </Col>
                            {group && group.value && (
                              <>
                                <Col md='4' className='mb-1 form-filed-wrapper'>
                                  <FormField
                                    name='category'
                                    label='Assign Category'
                                    placeholder='Select Category'
                                    type='select'
                                    errors={errors}
                                    control={control}
                                    options={categoryList ? categoryList : []}
                                    key={getValues('category')}
                                  />
                                </Col>
                                <Col md='4' className='mb-1 form-filed-wrapper'>
                                  <FormField
                                    name='status'
                                    label='Assign Status'
                                    placeholder='Select Status'
                                    type='select'
                                    errors={errors}
                                    control={control}
                                    options={statusList ? statusList : []}
                                    key={getValues('status')}
                                  />
                                </Col>
                              </>
                            )}
                          </Row>
                          {group && group.value && (
                            <Row>
                              <Col md='4' className='mb-1 form-filed-wrapper'>
                                <FormField
                                  name='tags'
                                  label='Assign Tags'
                                  placeholder='Select Tags'
                                  type='select'
                                  errors={errors}
                                  control={control}
                                  isMulti={'true'}
                                  options={tagList ? tagList : []}
                                  key={getValues('tags')}
                                />
                              </Col>
                              <Col md='4' className='mb-1 form-filed-wrapper'>
                                <FormField
                                  name='pipeline'
                                  label='Assign Pipeline'
                                  placeholder='Select Pipeline'
                                  type='select'
                                  errors={errors}
                                  control={control}
                                  onChange={handlePipelineChange}
                                  options={pipelineList ? pipelineList : []}
                                  key={getValues('pipeline')}
                                />
                              </Col>
                              <Col md='4' className='mb-1 form-filed-wrapper'>
                                <FormField
                                  name='stage'
                                  label='Assign Stage'
                                  placeholder='Select Stage'
                                  type='select'
                                  errors={errors}
                                  control={control}
                                  options={stageList ? stageList : []}
                                  key={getValues('stage')}
                                />
                              </Col>
                            </Row>
                          )}
                        </div>
                      </div>
                      {/* Form Assignments end */}

                      {/* emails */}
                      <div
                        id='emails'
                        className={`accordian-loyal-box emails ${
                          activeAccordions.emails && 'active'
                        }`}
                      >
                        <div
                          className='accordian-loyal-header'
                          onClick={() => setAccordion('emails')}
                        >
                          <div className='inner-wrapper'>
                            <h3 className='title'>Emails</h3>
                            <button
                              className='down-arrow'
                              type='button'
                            ></button>
                          </div>
                        </div>
                        <div className='accordian-loyal-body mb-2'>
                          <div className='header-text'>
                            <p>
                              Select the emails that will be sent after a form
                              is filled out. The Autoresponder email will go to
                              the visitor. The Notification email(s) can be sent
                              to anyone with a valid email address.
                            </p>
                            <h5 className='title'>
                              Available annotations for these emails:{' '}
                              <span>
                                {fields?.map((field, index) =>
                                  index === fields?.length - 1
                                    ? `@${field.label}`
                                    : `@${field.label}, `
                                )}
                              </span>
                            </h5>
                          </div>
                          <Row className='autoresponder-notification-row'>
                            <Col sm='6'>
                              <div
                                className={`toggle-form-inner-wrapper ${
                                  autoresponderOptional ? 'active' : ''
                                }`}
                              >
                                <div className='d-flex justify-content-between align-items-center'>
                                  <div className='d-flex'>
                                    <div className='checkbox-switch-toggle-btn-wrapper'>
                                      <div className='checkbox-btn-wrapper d-flex flex-inline'>
                                        <div
                                          id={'autoresponderOptional'}
                                          className='form-check checkbox-btn-repeater me-2'
                                        >
                                          <FormField
                                            type='checkbox'
                                            errors={errors}
                                            control={control}
                                            name='autoresponderOptional'
                                            defaultValue={getValues(
                                              'autoresponderOptional'
                                            )}
                                            key={getValues(
                                              'autoresponderOptional'
                                            )}
                                            onChange={(e) => {
                                              if (
                                                (getValues('autoresponder') ===
                                                  null ||
                                                  isEmpty(
                                                    getValues('autoresponder')
                                                  )) &&
                                                e.target.checked
                                              ) {
                                                setIsUpdateNotification({
                                                  ...isUpdateNotification,
                                                  autoresponder: true,
                                                })
                                              }
                                              setValue(
                                                'autoresponderOptional',
                                                e.target.checked
                                              )
                                            }}
                                          />
                                          <div className='form-check-label form-label'>
                                            Autoresponder
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <UncontrolledTooltip
                                      placement='top'
                                      autohide={true}
                                      target={`autoresponderOptional`}
                                    >
                                      Optional
                                    </UncontrolledTooltip>
                                  </div>
                                </div>
                                {autoresponderOptional ? (
                                  <>
                                    {isUpdateNotification.autoresponder ? (
                                      <>
                                        <Row className='d-flex align-items-end'>
                                          <Col
                                            md='12'
                                            lg='6'
                                            sm='6'
                                            className=''
                                          >
                                            <div className='form-field-group'>
                                              <FormField
                                                name='autoresponderTemplate'
                                                label='Template'
                                                placeholder='Select Template'
                                                type='select'
                                                errors={errors}
                                                control={control}
                                                isClearable={true}
                                                options={emailTemplates?.map(
                                                  (template) => ({
                                                    id: template?._id,
                                                    value: template?._id,
                                                    label: template?.name,
                                                  })
                                                )}
                                                onChange={(value) =>
                                                  setTemplateValueFunc(
                                                    value,
                                                    'autoresponder'
                                                  )
                                                }
                                              />
                                            </div>
                                          </Col>
                                          <Col
                                            md='12'
                                            lg='6'
                                            sm='12'
                                            className=''
                                          >
                                            <div className='form-field-group'>
                                              <Label
                                                className='form-label ellipsis-form-label'
                                                id='autoResponderDelay'
                                              >
                                                How soon do you want the
                                                autoresponder email sent after
                                                the web form is submitted?
                                              </Label>
                                              <UncontrolledTooltip
                                                placement='top'
                                                autohide={true}
                                                target='autoResponderDelay'
                                              >
                                                How soon do you want the
                                                autoresponder email sent after
                                                the web form is submitted?
                                              </UncontrolledTooltip>
                                              <FormField
                                                defaultValue={{
                                                  value: '0',
                                                  label: 'Instantly',
                                                }}
                                                name='autoResponderDelay'
                                                placeholder='Select Timer'
                                                type='select'
                                                errors={errors}
                                                control={control}
                                                options={FORM_SCHEDULE_TIMER}
                                              />
                                            </div>
                                          </Col>
                                          <Col
                                            md='12'
                                            lg='12'
                                            sm='12'
                                            className=''
                                          >
                                            <div className='form-field-group'>
                                              <Label for='fname'>Subject</Label>
                                              <MentionInput
                                                placeholder='Enter Subject'
                                                key={formSetRenderKey}
                                                defaultValue={getValues(
                                                  'autoresponder.subject'
                                                )}
                                                name='autoresponder.subject'
                                                setValue={setValue}
                                                mention={fields
                                                  .filter(
                                                    (obj) =>
                                                      !(
                                                        obj?.type?.value ===
                                                        'file'
                                                      )
                                                  )
                                                  .map((obj) => {
                                                    return {
                                                      id: obj.label,
                                                      display: obj.label,
                                                    }
                                                  })}
                                              />
                                            </div>
                                          </Col>
                                        </Row>
                                        <div>
                                          <Col sm='12'>
                                            <SaveButton
                                              type='button'
                                              width='100%'
                                              outline={true}
                                              loading={false}
                                              className='align-items-center justify-content-center mt-1'
                                              // name={'Update Template'}
                                              name={
                                                getValues(
                                                  'autoresponder.jsonBody'
                                                )
                                                  ? 'Edit Autoresponder Template'
                                                  : 'Create Autoresponder Template'
                                              }
                                              onClick={() =>
                                                openTemplateEditor(
                                                  'autoresponder'
                                                )
                                              }
                                            />
                                            {errors?.['autoresponder']?.[
                                              'jsonBody'
                                            ] &&
                                              errors?.['autoresponder']?.[
                                                'jsonBody'
                                              ]?.type === 'required' && (
                                                <span
                                                  className='text-danger block'
                                                  style={{
                                                    fontSize: '0.857rem',
                                                  }}
                                                >
                                                  Template is required
                                                </span>
                                              )}
                                          </Col>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {getValues('autoresponder') !== null &&
                                        !isEmpty(getValues('autoresponder')) ? (
                                          <>
                                            <TemplateCard
                                              item={getValues('autoresponder')}
                                              title={'Autoresponder'}
                                              type={'autoresponder'}
                                            />
                                          </>
                                        ) : null}
                                      </>
                                    )}
                                  </>
                                ) : null}
                              </div>
                            </Col>
                            <Col sm='6'>
                              <div
                                className={`toggle-form-inner-wrapper ${
                                  notificationOptional ? 'active' : ''
                                }`}
                              >
                                <div className='d-flex justify-content-between align-items-center'>
                                  <div className='d-flex'>
                                    <div className='checkbox-switch-toggle-btn-wrapper'>
                                      <div className='checkbox-btn-wrapper d-flex flex-inline'>
                                        <div
                                          id={'notificationOptional'}
                                          className='form-check checkbox-btn-repeater me-2'
                                        >
                                          <FormField
                                            errors={errors}
                                            control={control}
                                            name='notificationOptional'
                                            defaultValue={getValues(
                                              'notificationOptional'
                                            )}
                                            key={getValues(
                                              'notificationOptional'
                                            )}
                                            type='checkbox'
                                            onChange={(e) => {
                                              if (
                                                getValues('notification') ===
                                                  null &&
                                                e.target.checked
                                              ) {
                                                setIsUpdateNotification({
                                                  ...isUpdateNotification,
                                                  notification: true,
                                                })
                                              }
                                              setValue(
                                                'notificationOptional',
                                                e.target.checked
                                              )
                                            }}
                                          />
                                          <div className='form-check-label form-label'>
                                            Notification Emails
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <UncontrolledTooltip
                                      placement='top'
                                      autohide={true}
                                      target={`notificationOptional`}
                                    >
                                      Optional
                                    </UncontrolledTooltip>
                                  </div>
                                </div>
                                {/* <div className='mb-1 add-user-btn'>Notifications Emails</div> */}
                                {notificationOptional ? (
                                  <>
                                    {isUpdateNotification.notification ? (
                                      <>
                                        <Row className=''>
                                          <Col
                                            md='12'
                                            lg='12'
                                            sm='12'
                                            className='template-select-wrapper mt-1'
                                          >
                                            <div className='form-field-group'>
                                              <FormField
                                                name='notificationTemplate'
                                                placeholder='Select Template'
                                                type='select'
                                                errors={errors}
                                                control={control}
                                                isClearable={true}
                                                options={emailTemplates?.map(
                                                  (template) => ({
                                                    id: template?._id,
                                                    value: template?._id,
                                                    label: template?.name,
                                                  })
                                                )}
                                                onChange={(value) =>
                                                  setTemplateValueFunc(
                                                    value,
                                                    'notification'
                                                  )
                                                }
                                              />
                                            </div>
                                          </Col>
                                          <Col md='12' lg='6' sm='6'>
                                            <div className='form-field-group'>
                                              <Label for='fname'>
                                                Recipients
                                              </Label>
                                              <FormField
                                                name='notification.emails'
                                                placeholder='Add Emails'
                                                type='creatableselect'
                                                errors={errors}
                                                control={control}
                                                options={[]}
                                                isMulti={'true'}
                                                onChange={handleEmails}
                                              />
                                            </div>
                                          </Col>
                                          <Col md='12' lg='6' sm='6'>
                                            <div className='form-field-group'>
                                              <Label for='fname'>Subject</Label>
                                              <MentionInput
                                                placeholder='Enter Subject'
                                                key={formSetRenderKey}
                                                defaultValue={getValues(
                                                  'notification.subject'
                                                )}
                                                name='notification.subject'
                                                setValue={setValue}
                                                mention={fields
                                                  .filter(
                                                    (obj) =>
                                                      !(
                                                        obj?.type?.value ===
                                                        'file'
                                                      )
                                                  )
                                                  .map((obj) => {
                                                    return {
                                                      id: obj.label,
                                                      display: obj.label,
                                                    }
                                                  })}
                                              />
                                            </div>
                                          </Col>
                                        </Row>
                                        <div className='mb-2'>
                                          <Col sm='12'>
                                            <SaveButton
                                              type='button'
                                              width='100%'
                                              outline={true}
                                              loading={false}
                                              className='align-items-center justify-content-center mt-1'
                                              // name={'Update Template'}
                                              name={
                                                getValues(
                                                  'notification.jsonBody'
                                                )
                                                  ? 'Edit Notification Template'
                                                  : 'Create Notification Template'
                                              }
                                              onClick={() =>
                                                openTemplateEditor(
                                                  'notification'
                                                )
                                              }
                                            />

                                            {errors?.['notification']?.[
                                              'jsonBody'
                                            ] &&
                                              errors?.['notification']?.[
                                                'jsonBody'
                                              ]?.type === 'required' && (
                                                <span
                                                  className='text-danger block'
                                                  style={{
                                                    fontSize: '0.857rem',
                                                  }}
                                                >
                                                  Body is required
                                                </span>
                                              )}
                                          </Col>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {getValues('notification') !== null ? (
                                          <>
                                            <TemplateCard
                                              item={getValues('notification')}
                                              title={'Notification Emails'}
                                              type={'notification'}
                                            />
                                          </>
                                        ) : null}
                                      </>
                                    )}
                                  </>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                      {/* emails end */}
                    </div>
                    <div
                      className='submit-btn-wrapper'
                      // added
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <SaveButton
                        width='20%'
                        type='submit'
                        loading={buttonLoading.submitLoading}
                        name={params.id !== 'add' ? 'Update Form' : 'Add Form'}
                        className='mt-1 align-items-center justify-content-center'
                      ></SaveButton>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <div className='company-form-preview'>
                    <FormPreview
                      getValues={getValues}
                      user={user}
                      setValue={setValue}
                      showThankYou={showThankYou}
                      fields={fields}
                      onFormPreviewSubmit={onFormPreviewSubmit}
                      errors={errors}
                      control={control}
                      register={register}
                      setShowThankYou={setShowThankYou}
                    />
                  </div>
                  {errors && Object.keys(errors).length > 0 && (
                    <div
                      className='mt-2'
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        className='text-danger block'
                        style={{
                          fontSize: '1rem',
                        }}
                      >
                        There are some error/s in the form details. Please fix
                        them before submitting.
                      </span>
                    </div>
                  )}

                  <div
                    className='submit-btn-wrapper'
                    // added
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <SaveButton
                      width='20%'
                      type='button'
                      onClick={handleSubmit(onSubmit)}
                      loading={buttonLoading.submitLoading}
                      name={params.id !== 'add' ? 'Update Form' : 'Add Form'}
                      className='mt-1 align-items-center justify-content-center'
                    ></SaveButton>
                  </div>
                </>
              )}
              <div>
                {openModal ? (
                  <FieldModal
                    openModal={openModal}
                    resetField={resetField}
                    editFieldsId={editFieldsId}
                    // fieldHandleSubmit={fieldHandleSubmit}
                    onFieldSubmit={onFieldSubmit}
                    // uniqueFormFieldValidate={uniqueFormFieldValidate}
                    // fieldErrors={fieldErrors}
                    // fieldControl={fieldControl}
                    // isFormFieldUnique={isFormFieldUnique}
                    availableFieldType={availableFieldType}
                    // handleTypeChange={handleTypeChange}
                    // showOptionField={showOptionField}
                    handleOptionChange={handleOptionChange}
                    register={register}
                    fields={fields}
                    availableGroups={groups}
                    // getFieldValues={getFieldValues}
                  />
                ) : null}
              </div>
            </div>
          </CardBody>
        </Card>
        {openEmailModal ? (
          <SendTemplateModal
            openEmailModal
            onSendTemplateModalClose={onSendTemplateModalClose}
            currentEmail={currentEmail}
            showError={showError}
            setShowError={setShowError}
            setcurrentEmail={setcurrentEmail}
            sendTestMail={sendTestMail}
          />
        ) : null}
        <Modal
          className='modal-dialog-centered email-template-preview'
          isOpen={templateModal}
          toggle={() => setTemplateModal(!templateModal)}
          size='xl'
          backdrop='static'
        >
          <ModalHeader toggle={() => setTemplateModal(!templateModal)}>
            {(editTemplateType === 'autoresponder' &&
              getValues('autoresponder.jsonBody')) ||
            (editTemplateType === 'notification' &&
              getValues('notification.jsonBody'))
              ? 'Update Template'
              : 'Create Template'}
            {/* {params.id !== 'add' ? 'Update Template' : 'Create Template'} */}
          </ModalHeader>
          <ModalBody>
            <EmailEditors
              onDone={onTemplateDone}
              tags={
                fields
                  ? fields.length &&
                    fields.map((obj) => ({
                      name: obj.label,
                      value: `@${obj.label}`,
                    }))
                  : []
              }
              values={
                editTemplateType === 'autoresponder'
                  ? getValues('autoresponder')
                  : getValues('notification')
              }
              saveBtnText='Save Autoresponder Template'
            />
          </ModalBody>
        </Modal>
        {templatePreviewModal ? (
          <TemplatePreviewModal
            templatePreviewModal={templatePreviewModal}
            templatePreview={templatePreview}
            getValues={getValues}
            onTemplatePreviewModalClose={onTemplatePreviewModalClose}
          />
        ) : null}
      </UILoader>
    </div>
  )
}

export default Forms
