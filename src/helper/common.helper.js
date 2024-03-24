import _ from 'lodash'
import { saveAs } from 'file-saver'
import heic2any from 'heic2any'
export const supportedTypes = [
  'pdf',
  'xlsx',
  'csv',
  'jpg',
  'jpeg',
  'svg',
  'png',
  'mp3',
  'heic',
  'docx',
  'pptx',
  'ppt',
  'doc',
  'mp4',
  'mov',
]

export const getFileType = (url) => {
  const fileNameArray = url?.toLowerCase()?.split('.')
  const tempFileType = fileNameArray?.[fileNameArray?.length - 1]
  if (supportedTypes.includes(tempFileType)) {
    if (['png', 'jpg', 'jpeg', 'svg'].includes(tempFileType)) {
      return 'image'
    } else if (['mp4', 'mov'].includes(tempFileType)) {
      return 'video'
    } else if (
      ['doc', 'docx', 'txt', 'ods', 'ppt', 'pptx'].includes(tempFileType)
    ) {
      return 'document'
    } else if (['xlsx', 'xls', 'csv'].includes(tempFileType)) {
      return 'csv'
    } else if (tempFileType === 'pdf') {
      return 'pdf'
    }
  }
}
export const getFileName = (url) => {
  const fileNameArray = url.toLowerCase().replaceAll('\\', '/').split('/')
  return fileNameArray[fileNameArray.length - 1]
}

export const downloadFile = (path) => {
  try {
    saveAs(path, getFileName(path))
  } catch (error) {
    console.log({ error })
  }
}

export const convertHeicFile = async (file) => {
  try {
    const jpgFileBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      // quality: 0.7,
    })

    const fileName = `${file.name?.split('.heic')[0] || Date.now()}.jpg`

    return new File([jpgFileBlob], fileName, {
      type: 'image/jpeg',
    })
  } catch (error) {
    console.log('Convert HEIC error', error)
  }
}

// set mention input value
export const mentionInputValueSet = (fields, text) => {
  fields.forEach((obj) => {
    text = text?.replaceAll(`@[${obj?.label}](${obj?.label})`, `@${obj?.label}`)
  })
  return text ? text : ''
}

export const downloadBlobFile = async (url) => {
  const fileUrl = url
  const linkTag = document.createElement('a')
  linkTag.download = getFileName(url)
  const response = await fetch(fileUrl)
  const blob = await response.blob()
  linkTag.href = window.URL.createObjectURL(blob)

  document.body.appendChild(linkTag)
  linkTag.click()
  document.body.removeChild(linkTag)
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}

export const encrypt = (data) => window.btoa(data)

export const decrypt = (data) => {
  try {
    return window.atob(data)
  } catch (error) {
    return null
  }
}

export const ArrayItemExists = (arr, callBack) => {
  const exists = arr.indexOf(callBack)
  return exists < 0 ? false : true
}

export const unAssignedItemExists = (arr) => {
  return ArrayItemExists(arr, (el) => el.id === 'UnassignedItem')
}

export const secondsToTime = (secs) => {
  const hours = Math.floor(secs / (60 * 60))

  const divisor_for_minutes = secs % (60 * 60)
  const minutes = Math.floor(divisor_for_minutes / 60)

  const divisor_for_seconds = divisor_for_minutes % 60
  const seconds = Math.ceil(divisor_for_seconds)

  const obj = {
    h: hours,
    m: minutes,
    s: seconds,
  }
  return obj
}

export function getAdjacentIndex(currentIndex, arrLength, direction) {
  if (direction === -1) return (currentIndex - 1 + arrLength) % arrLength
  else if (direction === 1) return (currentIndex + 1) % arrLength
}

export const getPositionAffectedItems = (oldIndex, newIndex, items) => {
  const direction = newIndex > oldIndex ? -1 : 1
  const minPosition = Math.min(oldIndex, newIndex)
  const maxPosition = Math.max(oldIndex, newIndex)
  const filteredItems = items.filter(
    (item, index) =>
      index >= minPosition && index <= maxPosition && !item.isNotDraggable
  )
  const arrLength = filteredItems.length
  const newArray = filteredItems.reduce((result, currentItem, currentIndex) => {
    const adjacentIndex = getAdjacentIndex(currentIndex, arrLength, direction)
    const adjacentItem = filteredItems[adjacentIndex]
    if (adjacentItem !== undefined) {
      result.push({
        _id: currentItem._id || currentItem.id,
        position: adjacentItem.position,
      })
    }

    return result
  }, [])

  return newArray
}

export const updateItemPostion = (initialArray, itemsToUpdate) => {
  const itemsMap = new Map(initialArray.map((item) => [item._id, item]))
  itemsToUpdate.forEach((updatedItem) => {
    const existingItem = itemsMap.get(updatedItem._id)

    if (existingItem) {
      const updatedExistingItem = _.cloneDeep(existingItem)
      updatedExistingItem.position = updatedItem.position
      itemsMap.set(updatedItem._id, updatedExistingItem)
    }
  })
  return [...itemsMap.values()]
}

export const isContentEmpty = (text) => {
  text = text
    ?.replaceAll('&nbsp;', '')
    ?.replaceAll(' ', '')
    ?.replaceAll('<p>', '')
    ?.replaceAll('</p>', '')
    ?.trim()

  return text?.length === 0 ? true : false
}

export const removeSpecialCharactersFromString = (labelString) => {
  return labelString.replace(/[',!"']/g, '')
}

export const highlightedString = (text, query) => {
  if (!query) {
    return text
  }

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<span class="highlight-text-color">$1</span>')
}
