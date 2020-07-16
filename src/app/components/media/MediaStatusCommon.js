import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import LockIcon from '@material-ui/icons/Lock';
import styled from 'styled-components';
import { can } from '../Can';
import { getStatus, getErrorMessage, bemClass } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';

const StyledMediaStatus = styled.div`
  display: flex;
  align-items: center;
`;

// FIXME: move all this code into <MediaVerificationStatus>
class MediaStatusCommon extends Component {
  static currentStatusToClass(status) {
    if (status === '') return '';
    return `media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  state = {};

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'update Status');
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleStatusClick = (clickedStatus) => {
    const { media } = this.props;

    this.setState({ anchorEl: null });

    if (clickedStatus !== media.last_status) {
      this.props.setStatus(this, media, clickedStatus);
    }
  };

  fail = (transaction) => {
    const fallbackMessage = (
      <FormattedMessage
        id="mediaStatus.error"
        defaultMessage="Sorry, an error occurred while updating the status. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  };

  // eslint-disable-next-line class-methods-use-this
  success() {
    // Do nothing. This is here because the child status component calls it.
  }

  render() {
    const { team, media } = this.props;
    const { statuses } = team.verification_statuses;
    const currentStatus = getStatus(team.verification_statuses, media.last_status);

    return (
      <StyledMediaStatus className="media-status">
        <Button
          className={`media-status__label media-status__current ${MediaStatusCommon.currentStatusToClass(media.last_status)}`}
          style={{ backgroundColor: currentStatus.style.color, color: 'white' }}
          variant="contained"
          disableElevation
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
          disabled={!this.canUpdate()}
          endIcon={this.canUpdate() ? <KeyboardArrowDownIcon /> : <LockIcon />}
        >
          {currentStatus.label}
        </Button>
        <Popover
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          {statuses.map(status => (
            <MenuItem
              key={status.id}
              className={`${bemClass(
                'media-status__menu-item',
                media.last_status === status.id,
                '--current',
              )} media-status__menu-item--${status.id.replace('_', '-')}`}
              onClick={() => this.handleStatusClick(status.id)}
            >
              <span style={{ color: status.style.color }}>
                {status.label.toUpperCase()}
              </span>
            </MenuItem>
          ))}
        </Popover>
      </StyledMediaStatus>
    );
  }
}

MediaStatusCommon.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
};

export default withSetFlashMessage(MediaStatusCommon);
