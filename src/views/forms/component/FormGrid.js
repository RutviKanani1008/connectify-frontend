import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  UncontrolledTooltip,
} from 'reactstrap'
import { useGetCompanyForms } from '../hooks/useApis'
import CopyToClipboard from 'react-copy-to-clipboard'
import {
  ChevronDown,
  Code,
  Copy,
  Edit2,
  Link as LinkIcon,
  RefreshCw,
  Trash,
} from 'react-feather'
import { useSelector } from 'react-redux'
import { userData } from '../../../redux/user'
import useGetBasicRoute from '../../../hooks/useGetBasicRoute'
import UILoader from '@components/ui-loader'
import { useHistory } from 'react-router-dom'
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound'

function FormGrid({
  archived = false,
  handleIconCardClick,
  handleFormPreview,
  cloneFormDetails,
  handleTrashForm,
  handleConfirmDelete,
}) {
  const [forms, setForms] = useState({
    results: [],
    total: 0,
  })
  const [currentFilters, setCurretFilters] = useState({
    limit: 12,
    page: 1,
  })

  const { getCompanyForms, isLoading: fetching } = useGetCompanyForms()

  const { basicRoute } = useGetBasicRoute()
  const user = useSelector(userData)
  const history = useHistory()

  useEffect(() => {
    getForms(currentFilters, archived)
  }, [archived])

  const getForms = async (filter, archived) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      })
      const { data } = await getCompanyForms({
        limit: filter.limit,
        page: filter.page,
        sort: filter.sort,
        search: filter.search,
        select:
          'title,archived,active,slug,designField,fields,showDescription,showTitle,showCompanyName,showLogo,createdAt',
        archived,
        companyId: user?.company._id,
      })
      setForms({
        results: [...forms.results, ...data?.results] || [],
        total: data?.pagination?.total || 0,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const TemplateCard = ({ item }) => {
    const { title, active, _id, slug, archived } = item
    return (
      <div className='company-form-card'>
        <div className='header-wrapper'>
          <h5 className='form-card-title' id={`title_${_id}`}>
            {title}
          </h5>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`title_${_id}`}
          >
            {title}
          </UncontrolledTooltip>
          <div className='action-btn-wrapper'>
            {!archived ? (
              <>
                <div className='action-btn clone-btn'>
                  <Copy
                    size={15}
                    className='cursor-pointer'
                    onClick={() => cloneFormDetails(_id)}
                    id={`clone_${slug}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`clone_${slug}`}
                  >
                    Clone Form
                  </UncontrolledTooltip>
                </div>
              </>
            ) : null}
            {active && !archived ? (
              <>
                <div className='action-btn copy-embed-btn'>
                  <CopyToClipboard
                    text={`<iframe id="my-frame" src='${process.env.REACT_APP_FORM_APP_URL}/embed/${slug}' title='MyForm' style="width:100%;" frameBorder='0'></iframe>   <script>
                  window.addEventListener('message', function (e) {
                    const { data } = e;
                    if (data.type === 'UI') {
                      document.getElementById('my-frame').style.height =
                        data.payload + 'px';
                    } else if (data.type === 'link') {
                      window.location = data.payload;
                    } else if (data.type === 'scroll') {
                      setTimeout(function () {
                        window.scrollTo(0, 300);
                      }, 2);
                    }
                  });
                  document.body.style.overflowY = 'auto';
                </script>`}
                  >
                    <Code
                      size={15}
                      className='cursor-pointer'
                      onClick={() => handleIconCardClick()}
                      id={`embed_${slug}`}
                    />
                  </CopyToClipboard>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`embed_${slug}`}
                  >
                    Copy Embed Link
                  </UncontrolledTooltip>
                </div>
                <div className='action-btn copy-btn'>
                  <CopyToClipboard
                    text={`${process.env.REACT_APP_FORM_APP_URL}/forms/${slug}`}
                  >
                    <LinkIcon
                      size={15}
                      className='cursor-pointer'
                      onClick={() => handleIconCardClick()}
                      id={`copyC_${slug}`}
                    />
                  </CopyToClipboard>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`copyC_${slug}`}
                  >
                    Copy Public Link
                  </UncontrolledTooltip>
                </div>
              </>
            ) : null}
            {!archived ? (
              <>
                <div className='action-btn edit-btn'>
                  <Edit2
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      history.push(`${basicRoute}/marketing/web-forms/${_id}`)
                    }}
                    id={`edit_${slug}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`edit_${slug}`}
                  >
                    Edit Form
                  </UncontrolledTooltip>
                </div>
              </>
            ) : null}
            {archived ? (
              <>
                <div className='action-btn recover-btn'>
                  <RefreshCw
                    size={15}
                    className='cursor-pointer'
                    id={`active_${slug}`}
                    onClick={() => {
                      handleTrashForm(item)
                    }}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`active_${slug}`}
                  >
                    Recover Form
                  </UncontrolledTooltip>
                </div>
              </>
            ) : null}
            <div className='action-btn delete-btn'>
              <Trash
                size={15}
                color='red'
                className='cursor-pointer'
                onClick={() => {
                  if (archived) {
                    handleConfirmDelete(_id)
                  } else {
                    handleTrashForm(item)
                  }
                }}
                id={`delete_${slug}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`delete_${slug}`}
              >
                {archived ? 'Delete Form' : 'Delete Form'}
              </UncontrolledTooltip>
            </div>
          </div>
        </div>
        <div className='body-wrapper'>
          <Button
            className='preview-btn'
            color='primary'
            onClick={() => {
              handleFormPreview(_id)
            }}
          >
            {/* <Send size={15} /> */}
            Preview
          </Button>
          <a
            className='view-submissions-link'
            onClick={() => {
              history.push(`${basicRoute}/marketing/web-forms/response/${_id}`)
            }}
          >
            View Submissions
          </a>
        </div>
      </div>
    )
  }

  return (
    <Col
      className={`marketing-form-col ${
        forms.results.length < forms.total && 'load-more-active'
      }`}
      sm={6}
      md={6}
      xs={6}
      lg={6}
      xl={6}
      xxl={6}
    >
      <UILoader blocking={fetching}>
        <Card className='company-form-inner-card com'>
          <CardHeader>
            <CardTitle tag='h4' className='text-primary'>
              {archived ? 'Deleted Forms' : 'Active Forms'}
            </CardTitle>
            <div
              className='mobile-toggle-header-btn'
              style={{ display: 'none' }}
            >
              <ChevronDown />
            </div>
          </CardHeader>
          <CardBody className='pb-0 hide-scrollbar'>
            <Row className='company-form-card-row'>
              {forms.results && forms.results.length > 0 ? (
                forms.results.map((item, key) => (
                  <Col className='company-form-card-col' md='6' key={key}>
                    <TemplateCard item={item} />
                  </Col>
                ))
              ) : (
                <>
                  <NoRecordFound />
                </>
              )}
            </Row>
          </CardBody>
          {forms.results.length < forms.total && (
            <div className='text-center loadMore-btn-wrapper'>
              <Button
                outline={true}
                color='primary'
                onClick={() => {
                  setCurretFilters({
                    ...currentFilters,
                    page: currentFilters.page + 1,
                  })
                  getForms(
                    {
                      ...currentFilters,
                      page: currentFilters.page + 1,
                    },
                    archived
                  )
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </Card>
      </UILoader>
    </Col>
  )
}

export default FormGrid
