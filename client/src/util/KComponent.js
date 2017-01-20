import { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

export default class KComponent extends Component {
  subscribeWhileMounted(observable, subscriber) {
    observable.onValue(subscriber);
    this.miscSubscribers.push([observable, subscriber]);
  }

  componentWillMount() {
    this.miscSubscribers = [];

    const o = this.observables ? this.observables() : {};
    const keys = Object.keys(o);
    this.subscribers = {};
    for (const k of keys) {
      const s = (v) => this.setState({[k]: v});
      if (!o[k] || !o[k].onValue) {
        throw new Error(`Key is not an observable: ${k}`);
      }
      o[k].onValue(s);
      this.subscribers[k] = s;
    }
  }

  componentWillUnmount() {
    const o = this.observables();
    const keys = Object.keys(o);
    for (const k of keys) {
      o[k].offValue(this.subscribers[k]);
    }
    this.miscSubscribers.forEach(([obs, sub]) => {
      obs.offValue(sub);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
}
