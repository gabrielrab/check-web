import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import App from './App';
import { IndexComponent, TermsOfService, NotFound } from '../components';
import { Sources, Source, User, Me } from '../components/source';

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const { store } = this.props;
    const history = syncHistoryWithStore(browserHistory, store);
    return (
      <Provider store={store}>
        <div>
          <Router history={history}>
            <Route path="/" component={App}>
              <IndexRoute component={IndexComponent} />
              <Route path="tos" component={TermsOfService} />
              <Route path="sources" component={Sources} />
              <Route path="source/:sourceId" component={Source} />
              <Route path="user/:userId" component={User} />
              <Route path="me" component={Me} />
              <Route path="*" component={NotFound} />
            </Route>
          </Router>
        </div>
      </Provider>
    );
  }
}
