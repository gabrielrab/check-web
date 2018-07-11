import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { Map, Marker, TileLayer } from 'react-leaflet';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { black54, caption } from '../../styles/js/shared';

const messages = defineMessages({
  searching: {
    id: 'geoLocationRespondTask.searching',
    defaultMessage: 'Searching...',
  },
  notFound: {
    id: 'geoLocationRespondTask.notFound',
    defaultMessage: 'Sorry, place not found!',
  },
});

class GeolocationRespondTask extends Component {
  static canSubmit() {
    // TODO Use React ref
    const { value } = document.getElementById('task__response-geolocation-name');
    return value && value.length;
  }

  constructor(props) {
    super(props);

    const { response } = this.props;
    let name = '';
    let coordinatesString = '';
    let lat = 0;
    let lng = 0;
    if (response) {
      const geoJSON = JSON.parse(this.props.response);
      ({ name } = geoJSON.properties);
      const { coordinates } = geoJSON.geometry;
      if (coordinates[0] || coordinates[1]) {
        lat = parseFloat(coordinates[0]).toFixed(7);
        lng = parseFloat(coordinates[1]).toFixed(7);
        coordinatesString = `${lat}, ${lng}`;
      }
    }

    this.state = {
      taskAnswerDisabled: true,
      zoom: 5,
      draggable: true,
      lat,
      lng,
      name,
      coordinatesString,
      original: {
        lat,
        lng,
        name,
        coordinatesString,
      },
      searchResult: [],
    };

    this.timer = null;
  }

  componentDidMount() {
    this.reloadMap();
  }

  componentDidUpdate() {
    this.reloadMap();
  }

  getCoordinates() {
    let coordinates = [0, 0];
    try {
      const { coordinatesString } = this.state;
      if (coordinatesString && coordinatesString !== '') {
        const pair = coordinatesString.split(/, ?/);
        coordinates = [parseFloat(pair[0]), parseFloat(pair[1])];
      }
    } catch (e) {
      coordinates = [0, 0];
    }
    return coordinates;
  }

  toggleDraggable() {
    this.setState({ draggable: !this.state.draggable });
  }

  updatePosition() {
    const { lat, lng } = this.marker.leafletElement.getLatLng();
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(lng).toFixed(7)}`;
    this.setState({
      lat, lng, zoom, coordinatesString, focus: true,
    });
  }

  updatePositionOnClick(e) {
    const { lat, lng } = e.latlng;
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(lng).toFixed(7)}`;
    this.setState({
      lat, lng, zoom, coordinatesString, focus: true,
    });
  }

  handlePressButton() {
    if (GeolocationRespondTask.canSubmit()) {
      this.handleSubmit();
    }
  }

  handleChange(e) {
    this.setState({
      taskAnswerDisabled: !GeolocationRespondTask.canSubmit(),
      name: e.target.value,
      message: '',
    });
  }

  handleSearchText(query) {
    const keystrokeWait = 1000;

    this.setState({ message: '' });

    clearTimeout(this.timer);

    if (query) {
      this.setState({ message: this.props.intl.formatMessage(messages.searching) });
      this.timer = setTimeout(() => this.geoCodeQueryOpenCage(query), keystrokeWait);
    }
  }

  handleChangeCoordinates(e) {
    this.setState({
      taskAnswerDisabled: !GeolocationRespondTask.canSubmit(),
      coordinatesString: e.target.value,
    });
  }

  handleBlur() {
    const coordinates = this.getCoordinates();
    this.setState({
      taskAnswerDisabled: !GeolocationRespondTask.canSubmit(),
      lat: coordinates[0],
      lng: coordinates[1],
    });
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled) {
      const name = document.getElementById('task__response-geolocation-name').value;
      const coordinates = this.getCoordinates();

      const response = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {
          name,
        },
      });

      this.setState({ taskAnswerDisabled: true });
      this.props.onSubmit(response, false);
    }
  }

  reloadMap() {
    if (this.marker && this.marker.leafletElement) {
      // eslint-disable-next-line no-underscore-dangle
      this.marker.leafletElement._map.invalidateSize();
    }
  }

  handleCancel() {
    const ori = this.state.original;
    this.setState({
      focus: false,
      name: ori.name,
      lat: ori.lat,
      lng: ori.lng,
      coordinatesString: ori.coordinatesString,
    });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  geoCodeQueryOpenCage = (query) => {
    const apiKey = config.opencageApiKey;
    const providerUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${query}&no_annotations=1`;

    fetch(providerUrl)
      .then(response => response.json())
      .catch(error => console.error('Error:', error))
      .then((response) => {
        const searchResult = response.results || [];
        let message = '';
        if (!searchResult.length) {
          message = this.props.intl.formatMessage(messages.notFound);
        }
        this.setState({ searchResult, message });
      });
  };

  render() {
    const position = [this.state.lat, this.state.lng];

    const actionBtns = (
      <p className="task__resolver">
        <FlatButton
          className="task__cancel"
          label={
            <FormattedMessage id="geolocationRespondTask.cancelTask" defaultMessage="Cancel" />
          }
          onClick={this.handleCancel.bind(this)}
        />
        <FlatButton
          disabled={this.state.taskAnswerDisabled}
          className="task__save"
          label={
            <FormattedMessage
              id="geolocationRespondTask.resolveTask"
              defaultMessage="Resolve task"
            />
          }
          primary
          onClick={this.handlePressButton.bind(this)}
        />
      </p>
    );

    const selectCallback = (obj) => {
      const { lat, lng } = obj.geometry;
      this.setState(
        {
          name: obj.formatted,
          coordinatesString: `${lat}, ${lng}`,
        },
        this.handleBlur,
      );
    };

    const dataSourceConfig = {
      text: 'formatted',
      value: 'geometry',
    };

    return (
      <div>
        <AutoComplete
          id="geolocationsearch"
          floatingLabelText={
            <FormattedMessage
              id="geolocationRespondTask.searchMap"
              defaultMessage="Search the map"
            />
          }
          name="geolocationsearch"
          dataSource={this.state.searchResult}
          dataSourceConfig={dataSourceConfig}
          filter={AutoComplete.noFilter}
          onNewRequest={selectCallback}
          onUpdateInput={this.handleSearchText.bind(this)}
          fullWidth
        />
        <div style={{ font: caption, color: black54 }}>
          {this.state.message }
        </div>
        <TextField
          id="task__response-geolocation-name"
          className="task__response-input"
          floatingLabelText={
            <FormattedMessage
              id="geolocationRespondTask.placeName"
              defaultMessage="Customize place name"
            />
          }
          name="response"
          value={this.state.name}
          onChange={this.handleChange.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          fullWidth
          multiLine
        />
        <TextField
          id="task__response-geolocation-coordinates"
          className="task__response-note-input"
          floatingLabelText={
            <FormattedMessage
              id="geolocationRespondTask.coordinates"
              defaultMessage="Latitude, Longitude"
            />
          }
          name="coordinates"
          onChange={this.handleChangeCoordinates.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          onBlur={this.handleBlur.bind(this)}
          value={this.state.coordinatesString}
          fullWidth
          multiLine
        />
        <div>
          <Map
            style={{ height: '400px' }}
            center={position}
            zoom={this.state.zoom}
            onClick={this.updatePositionOnClick.bind(this)}
          >
            <TileLayer
              attribution="2017 <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a>"
              url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            />
            <Marker
              draggable={this.state.draggable}
              onDragend={this.updatePosition.bind(this)}
              position={position}
              ref={(m) => { this.marker = m; }}
            />
          </Map>
        </div>
        { this.state.focus || this.props.response ? actionBtns : null }
      </div>
    );
  }
}

export default injectIntl(GeolocationRespondTask);
