import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import { browserHistory } from 'react-router';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import IconPlay from '@material-ui/icons/PlayArrow';
import IconPause from '@material-ui/icons/Pause';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ReportDesignerCopyToClipboard from './ReportDesignerCopyToClipboard';
import ReportDesignerConfirmableButton from './ReportDesignerConfirmableButton';
import ReportDesignerEditButton from './ReportDesignerEditButton';
import { MediaVerificationStatus } from '../MediaVerificationStatus';
import { completedGreen, inProgressYellow } from '../../../styles/js/shared';

const useStyles = makeStyles(() => ({
  publish: {
    background: completedGreen,
    color: 'white',
  },
  pause: {
    background: inProgressYellow,
    color: 'white',
  },
}));

const ReportDesignerTopBar = (props) => {
  const classes = useStyles();
  const {
    media,
    state,
    editing,
    data,
    readOnly,
  } = props;

  const url = window.location.href.replace(/\/report$/, `?t=${new Date().getTime()}`);
  const embedTag = `<script src="${config.penderUrl}/api/medias.js?url=${encodeURIComponent(url)}"></script>`;
  const metadata = JSON.parse(media.oembed_metadata);
  const itemUrl = metadata.permalink.replace(/^https?:\/\/[^/]+/, '');
  const shareUrl = metadata.embed_url;

  const handleGoBack = () => {
    browserHistory.push(itemUrl);
  };

  return (
    <Toolbar>
      <Box display="flex" justifyContent="space-between" width="1">
        <Box>
          <Button startIcon={<IconArrowBack />} onClick={handleGoBack}>
            <FormattedMessage
              id="reportDesigner.back"
              defaultMessage="Back to annotation"
            />
          </Button>
          <ReportDesignerCopyToClipboard
            className="report-designer__copy-embed-code"
            value={embedTag}
            label={
              <FormattedMessage
                id="reportDesigner.copyEmbedCode"
                defaultMessage="Copy embed code"
              />
            }
          />
          <ReportDesignerCopyToClipboard
            className="report-designer__copy-share-url"
            value={shareUrl}
            label={
              <FormattedMessage
                id="reportDesigner.copyShareUrl"
                defaultMessage="Copy share URL"
              />
            }
          />
        </Box>
        <Box display="flex">
          { editing ?
            <ReportDesignerEditButton
              disabled={readOnly}
              onClick={props.onSave}
              label={
                <FormattedMessage
                  id="reportDesigner.save"
                  defaultMessage="Save"
                />
              }
            /> :
            <ReportDesignerEditButton
              disabled={readOnly || state === 'published'}
              onClick={props.onEdit}
              label={
                <FormattedMessage
                  id="reportDesigner.edit"
                  defaultMessage="Edit"
                />
              }
            /> }
          { !editing && state === 'paused' ?
            <ReportDesignerConfirmableButton
              className={classes.publish}
              disabled={readOnly || !props.canPublish}
              label={
                <FormattedMessage
                  id="reportDesigner.publish"
                  defaultMessage="Publish"
                />
              }
              icon={<IconPlay />}
              tooltip={
                props.canPublish ?
                  <FormattedMessage
                    id="reportDesigner.canPublish"
                    defaultMessage="Publish report"
                  /> :
                  <FormattedMessage
                    id="reportDesigner.cannotPublish"
                    defaultMessage="Fill in at least the report text or image to publish your report. Make sure to create a report for the primary language ({language})."
                    values={{
                      language: props.defaultLanguage,
                    }}
                  />
              }
              title={
                data.last_published ?
                  <FormattedMessage
                    id="reportDesigner.confirmRepublishTitle"
                    defaultMessage="Ready to publish your changes?"
                  /> :
                  <FormattedMessage
                    id="reportDesigner.confirmPublishTitle"
                    defaultMessage="Ready to publish your report?"
                  />
              }
              content={
                <Box>
                  { !data.last_published && media.demand > 0 ?
                    <Typography>
                      <FormattedMessage
                        id="reportDesigner.confirmPublishText"
                        defaultMessage="{demand, plural, one {You are about to send this report to the user who requested this item.} other {You are about to send this report to the # users who requested this item.}}"
                        values={{ demand: media.demand }}
                      />
                    </Typography> : null }
                  { data.last_published && media.demand > 0 ?
                    <Typography>
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishResendText"
                        defaultMessage="{demand, plural, one {Your correction will be sent to the user who has received the previous report.} other {Your correction will be sent to the # users who have received the previous report.}}"
                        values={{ demand: media.demand }}
                      />
                    </Typography> : null }
                  <Typography>
                    <FormattedMessage
                      id="reportDesigner.confirmPublishText2"
                      defaultMessage="In the future, users who request this item will receive your report while it remains published."
                    />
                  </Typography>
                </Box>
              }
              onConfirm={() => {
                if (data.last_published) {
                  props.onStateChange('republish_and_resend', 'published');
                } else {
                  props.onStateChange('publish', 'published');
                }
              }}
            /> : null }
          { !editing && state === 'published' ?
            <ReportDesignerConfirmableButton
              className={classes.pause}
              disabled={readOnly}
              label={
                <FormattedMessage
                  id="reportDesigner.pause"
                  defaultMessage="Pause"
                />
              }
              icon={<IconPause />}
              tooltip={
                <FormattedMessage
                  id="reportDesigner.pauseReport"
                  defaultMessage="Pause report"
                />
              }
              title={
                <FormattedMessage
                  id="reportDesigner.confirmPauseTitle"
                  defaultMessage="You are about to pause the report"
                />
              }
              content={
                <Typography>
                  <FormattedMessage
                    id="reportDesigner.confirmPauseText"
                    defaultMessage="This report will not be sent to users until it is published again. Do you want to continue?"
                  />
                </Typography>
              }
              onConfirm={() => {
                props.onStateChange('pause', 'paused');
              }}
            /> : null }
          <MediaVerificationStatus
            media={media}
            team={media.team}
            readonly={readOnly || state === 'published'}
            callback={props.onStatusChange}
          />
        </Box>
      </Box>
    </Toolbar>
  );
};

ReportDesignerTopBar.defaultProps = {
  readOnly: false,
};

ReportDesignerTopBar.propTypes = {
  state: PropTypes.oneOf(['paused', 'published']).isRequired,
  editing: PropTypes.bool.isRequired,
  canPublish: PropTypes.bool.isRequired,
  media: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onStateChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default ReportDesignerTopBar;
