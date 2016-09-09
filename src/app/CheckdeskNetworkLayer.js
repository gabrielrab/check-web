import Relay from 'react-relay';

class CheckdeskNetworkLayer extends Relay.DefaultNetworkLayer {
  sendQueries(requests: Array<RelayQueryRequest>): ?Promise<any> {
    return Promise.all(requests.map(request => (
      this._sendQuery(request).then(
        result => {
          if (result.status === 404) {
            Checkdesk.history.push('/404');
          }
          return result.json();
        }).then(payload => {
          if (payload.hasOwnProperty('errors')) {
            const error = createRequestError(request, '200', payload);
            request.reject(error);
          } else if (!payload.hasOwnProperty('data')) {
            request.reject(new Error(
                'Server response was missing for query ' +
                `\`${request.getDebugName()}\`.`
                ));
          } else {
            request.resolve({response: payload.data});
          }
        }).catch(
          error => {
            request.reject(error);
          }
        )
      )));
  }

  _sendQuery(request: RelayQueryRequest): Promise<any> {
    return fetch(this._uri, {
      ...this._init,
      body: JSON.stringify({
        query: request.getQueryString(),
        variables: request.getVariables(),
      }),
      headers: {
        ...this._init.headers,
       'Accept': '*/*',
       'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }
};

export default CheckdeskNetworkLayer;
