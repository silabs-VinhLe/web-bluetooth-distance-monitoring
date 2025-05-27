(function() {
  'use strict';

  const DISTANCE_MONITORING_SERVICE = "a64ffbcc-b127-407b-aebc-17f2f65e45dd";
  const DISTANCE_MONITORING_CHARACTERISTIC = "9fe3215c-4c31-4b37-a9e6-59c944dcf905";

  class distanceMonitoring {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }
    connect() {
      return navigator.bluetooth.requestDevice({filters:[
        {name:[ 'channel_sounding' ]},
        {services: [DISTANCE_MONITORING_SERVICE]}
      ]})
      .then(device => {
        console.log('> Found ' + device.name);
        console.log('Connecting to GATT Server...');
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return server.getPrimaryService(DISTANCE_MONITORING_SERVICE);
      })
      .then(service => {
        console.log('> Found service: ' + service.uuid);
        return this._cacheCharacteristic(service, DISTANCE_MONITORING_CHARACTERISTIC);
      })
    }

    /* Proximity Tracking Service */

    startNotificationsDistanceMonitoring() {
      return this._startNotifications(DISTANCE_MONITORING_CHARACTERISTIC);
    }
    stopNotificationsDistanceMonitoring() {
      return this._stopNotifications(DISTANCE_MONITORING_CHARACTERISTIC);
    }
    parseDistanceMonitoring(value) {
      console.log('value: ' + value);
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let result = {};
      result.distance = value.getFloat32(0, true);
      return result;
    }

    /* Utils */

    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        console.log('> Found characteristic: ' + characteristic.uuid);
        this._characteristics.set(characteristicUuid, characteristic);
      });
    }
    _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      .then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.distanceMonitoring = new distanceMonitoring();

})();
