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

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.blueGrey400,
    primary2Color: Colors.blueGrey600,
    primary3Color: Colors.blueGrey800,
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
          headers = {
            'X-Checkdesk-Token': token
          }
        }
        if (Checkdesk.context.team) {
          headers['X-Checkdesk-Context-Team'] = Checkdesk.context.team.dbid;
        }
        return headers;
      } 
    }));
  }

  startSession(state) {
    var that = this;
    if (!state.token && !state.error) {
      var token = window.storage.getValue('token');
      if (token) {
        state.token = token;
        that.forceUpdate();
      }
      else {
        var failureCallback = function(message) {
          state.message = message;
          state.error = true;
          that.forceUpdate();
        };
        var successCallback = function(data) {
          if (data) {
            state.token = data.token;
          }
          else {
            state.error = true;
          }
          window.Checkdesk.currentUser = data;
          var currentLocation = that.props.location.pathname;

          (function redirectIndex() {
            if (data) {
              const team = data.current_team;
              var project = Checkdesk.context.project;

              // If user has a team, redirect to a project if he tries to access the root
              if (team) {
                if (!project) {
                  project = team.projects[0];
                  Checkdesk.context.project = project;
                  Checkdesk.context.team = project.team;
                }
                if (currentLocation === '/') {
                  // Redirect to project
                  if (project && project.dbid) {
                    Checkdesk.history.push('/team/' + team.dbid + '/project/' + project.dbid);
                  }
                  // Ask to create a project
                  else {
                    Checkdesk.history.push('/team/' + team.dbid);
                  }
                }
              }

              // Ask to create a team
              else if (currentLocation != '/teams/new') {
                return Checkdesk.history.push('/teams/new');
              }
            }
          })();

          that.forceUpdate();
        }
        request('get', 'me', failureCallback, successCallback);
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
        return (<LoginMenu {...this.props} />);
      }
      return null;
    }

    const routeIsFullscreen = children && children.props.route.fullscreen;
    if (routeIsFullscreen) {
      return (<div className='home home--fullscreen'>{children}</div>);
    }

    return (
      <div className='home'>
        <Header {...this.props} />
        <main className='home__content'>
          <div className="home__global-message global-message"><Message message={state.app.message} /></div>
          <div className='home__main'>{children}</div>
        </main>
        <FooterRelay {...this.props} />
      </div>
    );
  }
}

export default themeDecorator(muiTheme)(Home);
