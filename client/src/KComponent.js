import K from "kefir";
import { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

export default class KComponent extends Component {
  componentWillMount() {
    const o = this.observables();
    const keys = Object.keys(o);
    this.observable = K.combine(keys.map((k) => o[k]));
    this.subscriber = (args) => {
      const newState = {};
      args.forEach((arg, i) => { newState[keys[i]] = arg; });
      this.setState(newState);
    };
    this.observable.onValue(this.subscriber);
  }

  componentWillUnmount() {
      this.observable.offValue(this.subscriber);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
}