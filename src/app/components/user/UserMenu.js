import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import UserUtil from './UserUtil';
import UserMenuItems from '../UserMenuItems';
import UserAvatar from '../UserAvatar';
import CheckContext from '../../CheckContext';
import {
  black54,
  units,
} from '../../styles/js/shared';

const styles = {
  UserMenuStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: units(4),
    height: units(4),
    padding: 0,
    margin: `0 ${units(1)}`,
  },
};

class UserMenu extends React.Component {
  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  render() {
    const { currentUserIsMember, inTeamContext, loggedIn, user } = this.props;
    const { currentUser } = this.getContext().getContextStore();

    if (!loggedIn) {
      return null;
    }

    const userRoleText = inTeamContext && currentUserIsMember &&
      <span className="user-menu__role" style={{ color: black54 }}>
        {`(${UserUtil.userRole(user, currentUser.current_team)})`}
      </span>;

    return (
      <IconMenu
        className="header__user-menu"
        iconButtonElement={
          <IconButton
            style={styles.UserMenuStyle}
            >
            <UserAvatar size={units(4)} {...this.props} />
          </IconButton>
        }
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        >
        <MenuItem
          containerElement={<Link to={`/check/me`} />}
          secondaryText={userRoleText}
          >
          {user && user.name}
        </MenuItem>
        <UserMenuItems {...this.props} />
      </IconMenu>
    );
  }
}

UserMenu.contextTypes = {
  store: React.PropTypes.object,
};

export default UserMenu;
