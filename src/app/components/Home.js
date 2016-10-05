import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import util from 'util';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import Message from './Message';
import { request } from '../actions/actions';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import themeDecorator from 'material-ui/lib/styles/theme-decorator';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import config from 'config';
import CheckdeskNetworkLayer from '../CheckdeskNetworkLayer';
import BrowserSupport from './BrowserSupport'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.blue500,
    primary2Color: Colors.blue500,
    primary3Color: Colors.blue500,
    accent1Color: Colors.blue600,
    accent2Color: Colors.blue700,
    accent3Color: Colors.blue800
  }
});

class Home extends Component {
  setUpGraphql(token) {
    Relay.injectNetworkLayer(new CheckdeskNetworkLayer(config.relayPath, {
      get headers() {
        var headers = config.relayHeaders;
        if (token) {
          // TODO make the header name a configuration option
          headers['X-Check-Token'] = token;
        }
        return headers;
      }
    }));
  }

  startSession(state) {
    if (state.token || state.error) {
      return;
    }

    const storedToken = window.storage.getValue('token');
    if (storedToken) {
      state.token = storedToken;
      return that.forceUpdate();
    }

    const that = this;
    var failureCallback = function(errorMessage) {
      state.message = errorMessage;
      state.error = true;
      that.forceUpdate();
    };
    var successCallback = function(userData) {
      if (userData) {
        state.token = userData.token;
      }
      else {
        state.error = true;
      }

      window.Checkdesk.currentUser = userData;
      that.maybeRedirect(that.props.location.pathname, userData);
      that.setContext();
      that.forceUpdate();
    }
    request('get', 'me', failureCallback, successCallback);
  }

  getSubdomain() {
    const host = window.location.host;
    const regexp = new RegExp('^([a-zA-Z0-9\\-]+)\\.' + config.selfHost);
    var subdomain = null;
    if (regexp.test(host)) {
      subdomain = host.match(regexp)[1];
    }
    return subdomain;
  }

  // Get context team and project from URL
  setContext() {
    if (this.props.params) {
      const subdomain = this.getSubdomain();
      if (subdomain != null && !Checkdesk.context.team) {
        Checkdesk.context.team = { subdomain: subdomain };
      }
      if (this.props.params.projectId && !Checkdesk.context.project) {
        Checkdesk.context.project = { dbid: parseInt(this.props.params.projectId) };
      }
    }
  }

  // Set context team and project from information from the backend
  setContextAndRedirect(team, project) {
    var path = window.location.protocol + '//';
    if (team) {
      Checkdesk.context.team = team;
      path += team.subdomain + '.';
    }
    path += config.selfHost;
    if (project) {
      Checkdesk.context.project = project;
      path += '/project/' + project.dbid;
    }
    window.location.href = path;
  }

  maybeRedirect(location, userData) {
    if (location !== '/' || !userData) { return; }

    const userCurrentTeam = userData.current_team;
    if (!userCurrentTeam && location !== '/teams/new') {
      return Checkdesk.history.push('/teams/new');
    }

    if (!this.getSubdomain()) {
      const project = userCurrentTeam.projects[0];
      if (project && project.dbid) {
        this.setContextAndRedirect(userCurrentTeam, project);
      }
      else {
        this.setContextAndRedirect(userCurrentTeam, null);
      }
    }
  }

  render() {
    const { state, children } = this.props;
    this.startSession(state.app);
    this.setUpGraphql(state.app.token);

    const routeIsPublic = children && children.props.route.public;
    if (!routeIsPublic && !state.app.token) {
      if (state.app.error) {
        if (!state.app.message && children.props.route.path === 'join') {
          state.app.message = 'First you need to register. Once registered, you can request to join the team.';
        }
        return (<LoginMenu {...this.props} />);
      }
      return null;
    }

    const routeIsFullscreen = children && children.props.route.fullscreen;
    if (routeIsFullscreen) {
      return (<div className='home home--fullscreen'>{children}</div>);
    }

    return (
      <span>
        <BrowserSupport />
        <div className='home'>
          <span className='home__disclaimer'>Beta</span>
          <Header {...this.props} />
          <main className='home__content'>
            <div className='home__global-message global-message'><Message message={state.app.message} /></div>
            <div className='home__main'>{children}</div>
          </main>
          <FooterRelay {...this.props} />
        </div>
      </span>
    );
  }
}

export default themeDecorator(muiTheme)(Home);
