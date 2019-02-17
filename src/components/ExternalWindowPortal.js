/** React **/
import React from 'react';
import ReactDOM from 'react-dom';

/** Component Definition **/
class ExternalWindowPortal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
    }

    render() {
        return ReactDOM.createPortal(this.props.children, this.containerEl);
    }

    componentDidMount() {
        this.externalWindow = window.open('', '', 'width=550,height=685,left=200,top=200');
        this.externalWindow.document.body.appendChild(this.containerEl);
        if (!this.props.redirectOnLoad || typeof(this.props.redirectOnLoad) !== 'function') {
            console.error('ASSERT: redirectOnLoad not set.')
            return;
        }
        this.externalWindow.location.href = this.props.redirectOnLoad();

        this.externalWindow.onbeforeunload = () => {
            // TODO: buggy; not working
            // this.props.onClose();
        }
    }

    componentWillUnmount() {
        // this.props.onClose();
    }
}

export default ExternalWindowPortal;
