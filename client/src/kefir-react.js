import React from 'react';
const T = React.PropTypes;
const h = React.createElement;

export class KefirReactComponent extends React.Component {
    static propTypes = {
        props$: T.any.isRequired, // Kefir.Observable
        render: T.func.isRequired // props => component
    };

    state = {
        values: null
    };

    _subscribe = props$ => {
        const handler = values => {
            this.setState({
                values
            });
        }
        props$.onValue(handler);
        this._unsubscribe = () => {
            props$.offValue(handler);
            this._unsubscribe = null;
        };
    }

    componentWillMount() {
        this._subscribe(this.props.props$);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.props$ !== this.props.props$) {
            this._unsubscribe();
            this._subscribe(nextProps.props$);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    render() {
        return this.props.render(this.state.values);
    }
}

export const KefirReact = (props$, Component, Loader = Component) => {
    return props => h(KefirReactComponent, {
        props$,
        render: values => values ? h(Component, {
            ...props,
            ...values
        }) : h(Loader, props)
    })
};