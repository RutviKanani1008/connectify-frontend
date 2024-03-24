// ==================== Packages =======================
import { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import EmailEditor from 'react-email-editor';
// ====================================================
import { SaveButton } from '../../@core/components/save-button';
// import { uploadFile } from '../../api/auth';
import emailTemplateDefaultBody from '../../static/emailTemplateDefaultBody.json';
import { uploadFile } from '../../api/auth';
import { useSelector } from 'react-redux';
import { selectSocket } from '../../redux/common';

const EmailEditors = forwardRef(
  (
    { onDone, values, tags = [], showSaveBtn = true, saveBtnText = '' },
    ref
  ) => {
    EmailEditors.displayName = 'EmailEditors';
    const socket = useSelector(selectSocket);

    // ========================== Hooks =========================
    const emailEditorRef = useRef(null);

    // ============================== states ============================
    const [isReady, setIsReady] = useState(false);

    const exportHtml = () => {
      emailEditorRef.current.editor.exportHtml((data) => {
        const { design, html } = data;
        onDone({ design, html });
      });
    };

    const getEditorData = () => {
      return new Promise((resolve) =>
        emailEditorRef.current.editor.exportHtml((data) => resolve(data))
      );
    };

    // const uploadFileToS3 = async (file) => {
    //   const formData = new FormData();
    //   formData.append('filePath', 'template-image');
    //   formData.append('image', file?.accepted?.[0]);
    //   const uploadedFile = await uploadFile(formData);
    //   return process.env.REACT_APP_S3_BUCKET_BASE_URL + uploadedFile.data.data;
    // };

    const onLoad = () => {
      const modalElement =
        document.getElementsByClassName('email-editor-modal');
      if (modalElement?.[0]) {
        modalElement?.[0].classList.add('editor-open');
      }
      // emailEditorRef?.current?.editor.addEventListener(
      //   'onDesignLoad',
      //   onDesignLoad
      // );
      // if (values && values.jsonBody) {
      //   emailEditorRef?.current?.editor.loadDesign(JSON.parse(values.jsonBody));
      // }
      // emailEditorRef?.current?.editor?.loadBlank({
      //   backgroundColor: '#fff',
      // });
      // editor instance is created
      // you can load your template here;
      // const templateJson = {};
      // emailEditorRef.current.editor.loadDesign(templateJson);
    };

    const onReady = () => {
      setIsReady(true);
      emailEditorRef?.current?.editor?.loadBlank({
        backgroundColor: '#fff',
      });
      // editor is ready
      emailEditorRef?.current.editor.registerCallback(
        'image',
        async (file, done) => {
          const thisSessionId = Math.random().toString(36).substr(2, 9);
          if (socket) {
            socket.emit('initializeConnection', thisSessionId);
            socket.on('uploadProgress', (data) => {
              if (data !== 100) {
                done({ progress: Math.floor(data) });
              }
            });
          }

          const formData = new FormData();
          formData.append('filePath', `email-editor-upload`);
          formData.append('image', file?.attachments?.[0]);

          uploadFile(formData, thisSessionId).then((res) => {
            if (res?.data?.data) {
              done({
                progress: 100,
                url: `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${res?.data?.data}`,
              });
              socket && socket.emit('terminateConnection', thisSessionId);
            }
          });
        }
      );

      if (values && values.jsonBody) {
        emailEditorRef?.current?.editor.loadDesign(JSON.parse(values.jsonBody));
      } else {
        emailEditorRef?.current?.editor.loadDesign(emailTemplateDefaultBody);
      }
      if (tags && tags.length) {
        // const tempTag = [];
        // tags.forEach((tag) => {
        //   tempTag.push({
        //     name: tag.label,
        //     value: `@${tag.label}`,
        //   });
        // });
        // emailEditorRef?.current.setMergeTags(tempTag);
        emailEditorRef?.current?.editor?.setMergeTags(tags);
      }

      // -------------------- this code for removing brand logo -----------------------
      // setTimeout(() => {
      //   const iframe = document
      //     .getElementsByClassName('email-editor')[0]
      //     .getElementsByTagName('iframe')[0];
      //   const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      // }, 1000);
    };

    useImperativeHandle(ref, () => ({ getEditorData }));

    return (
      <>
        {isReady && showSaveBtn && (
          <div className='mb-1 d-flex justify-content-end'>
            <SaveButton
              type='button'
              width='260px'
              outline={true}
              className='align-items-center justify-content-center'
              name={saveBtnText || 'Save Template'}
              onClick={() => exportHtml()}
            />
          </div>
        )}
        <div className='email-editor'>
          <EmailEditor
            minHeight={'100%'}
            projectId={1234}
            ref={emailEditorRef}
            onLoad={onLoad}
            onReady={onReady}
          />
        </div>
      </>
    );
  }
);

export default EmailEditors;
