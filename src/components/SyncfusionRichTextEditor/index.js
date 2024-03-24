import React, { useEffect, useRef } from 'react';
import {
  HtmlEditor,
  Image,
  Inject,
  Link,
  MarkdownEditor,
  QuickToolbar,
  RichTextEditorComponent,
  Table,
  Toolbar,
} from '@syncfusion/ej2-react-richtexteditor';
import { MentionComponent } from '@syncfusion/ej2-react-dropdowns';

function itemTemplate(data) {
  return (
    <table>
      <tbody>
        <tr>
          <td className='mentionNameList'>
            <span>{data.label}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function displayTemplate(data) {
  return (
    <span>
      <a className='syncfusion-editor-mentioned-item' title={data.value}>
        @{data.label}
      </a>
    </span>
  );
}

const SyncfusionRichTextEditor = ({
  onChange,
  value,
  editorRef = null,
  mentionOption = [],
  name = 'rte',
  list = '#rte_rte-edit-view',
  mentionEnable = false,
  ...rest
}) => {
  const innerRef = editorRef || useRef(null);

  useEffect(() => {
    innerRef?.current?.focusIn?.();
  }, []);

  function actionBegineHandler(args) {
    if (args.requestType === 'EnterAction') {
      args.cancel = true;
    }
  }

  return (
    <>
      <div>
        <RichTextEditorComponent
          value={value}
          ref={innerRef}
          {...(mentionEnable && { id: name })}
          actionBegin={actionBegineHandler}
          saveInterval={0}
          autoSaveOnIdle
          change={onChange}
          quickToolbarSettings={{ actionOnScroll: 'none' }}
          toolbarSettings={{
            items: [
              'CreateTable',
              'Bold',
              'Italic',
              'Underline',
              'StrikeThrough',
              'FontName',
              'FontSize',
              'FontColor',
              'BackgroundColor',
              '-',
              'LowerCase',
              'UpperCase',
              'Formats',
              'Alignments',
              'NumberFormatList',
              'BulletFormatList',
              'Indent',
              'Outdent',
              '-',
              'CreateLink',
              'Image',
              'ClearFormat',
              'Print',
              'SourceCode',
              'FullScreen',
              'Undo',
              'Redo',
            ],
          }}
          fontFamily={{
            items: [
              {
                text: 'BeFontN3 Regular',
                value: 'BeFontN3 Regular',
                cssClass: 'sync-font-BeFontN3-Regular',
              },
              {
                text: 'Bridgette Font Regular',
                value: 'BridgetteFont4 Regular',
                cssClass: 'sync-font-BridgetteFont4-Regular',
              },
              {
                text: 'Segoe UI',
                value: 'Segoe UI',
                cssClass: 'sync-font-segoe-ui',
              },
              {
                text: 'Arial',
                value: 'Arial,Helvetica,sans-serif',
                cssClass: 'sync-font-arial',
              },
              {
                text: 'Courier New',
                value: 'Courier New,Courier,monospace',
                cssClass: 'sync-font-courier-new',
              },
              {
                text: 'Georgia',
                value: 'Georgia,serif',
                cssClass: 'sync-font-georgia',
              },
              {
                text: 'Impact',
                value: 'Impact,Charcoal,sans-serif',
                cssClass: 'sync-font-impact',
              },
              {
                text: 'Tahoma',
                value: 'Tahoma,Geneva,sans-serif',
                cssClass: 'sync-font-tahoma',
              },
              {
                text: 'Times New Roman',
                value: 'Times New Roman,Times,serif',
                cssClass: 'sync-font-times-new-roman',
              },
              {
                text: 'Verdana',
                value: 'Verdana,Geneva,sans-serif',
                cssClass: 'sync-font-verdana',
              },
            ],
          }}
          format={{ width: 'auto' }}
          insertImageSettings={{
            saveFormat: 'Base64',
          }}
          // fontColor={{
          //   colorCode: {
          //     Custom: [
          //       '#ffff00',
          //       '#008000',
          //       '#800080',
          //       '#800000',
          //       '#808000',
          //       '#c0c0c0',
          //       '#000000',
          //       '',
          //     ],
          //   },
          // }}
          {...rest}
        >
          <Inject
            services={[
              Toolbar,
              Image,
              Link,
              HtmlEditor,
              QuickToolbar,
              MarkdownEditor,
              Table,
            ]}
          />
        </RichTextEditorComponent>
        {mentionEnable && (
          <MentionComponent
            id='mentionEditor'
            target={list}
            suggestionCount={8}
            showMentionChar={false}
            allowSpaces={true}
            dataSource={mentionOption}
            fields={{ text: 'label' }}
            popupWidth='250px'
            popupHeight='200px'
            itemTemplate={itemTemplate}
            displayTemplate={displayTemplate}
          ></MentionComponent>
        )}
      </div>
    </>
  );
};

export default SyncfusionRichTextEditor;
