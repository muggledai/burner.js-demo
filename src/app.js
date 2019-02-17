/** React **/
import React from 'react';
import { render } from 'react-dom';

/** Third Party **/
import querystring from 'query-string';

/** Components **/
import ExternalWindowPortal from './components/ExternalWindowPortal';

/** HARDCODED **/
const REDIRECT_URL = 'http://localhost:5555';
const SOURCE = 'merchant';
const ADDRESS = 'abcd1234';
const AMOUNT = 5;

/** Definitions **/
class App extends React.Component {
    state = {
        showExternalDaiWindow: false,
        transactionStatus: null,
    };

    closeWindow = () => this.setState({ showExternalDaiWindow: false });
    addToBalanceHandler = () => {
        this.setState({
            showExternalDaiWindow: true,
            transactionStatus: 'Having user confirm transaction in burner wallet.',
        });
    }

    cancelTransaction = () => {
        this.setState({
            showExternalDaiWindow: false,
            transactionStatus: 'Cancelled transaction here.',
        });
    }

    redirectOnLoad = (redirectUrl, source, address, amount) => {

        const qsparams = {
            burnerjs: true,
            redirectBack: redirectUrl,
            source,
            address,
            amount,
        };

        return `http://localhost:3000?${querystring.stringify(qsparams)}`;
    }

    onMessageReceive = async (event) => {
        if (!event || !event.data) {
            return;
        }

        let queryStringParams = event.data.qs;
        if (!queryStringParams) {
            this.setState({
                error: 'An error occurred.',
            });
            return;
        }

        queryStringParams = querystring.parse(queryStringParams);

        let transactionStatus = null;
        if (queryStringParams && queryStringParams.action === 'close' && queryStringParams.status === 'noop') {
            transactionStatus = 'User exited burner wallet before confirming transaction.';
        }

        this.setState({
            transactionStatus,
        });
        this.closeWindow();
    }

    componentDidMount() {
        window.addEventListener('message', this.onMessageReceive);

        document.body.onload = () => {
            if (!window || !window.opener) {
                return;
            }
            window.opener.postMessage({
                    qs: window.location.search,
                },
                window.opener.location
            );
            window.close();
        };
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.onMessageReceive);
    }

    render() {

        const queryStringParams = querystring.parse(window.location.search);
        if (queryStringParams && queryStringParams['action']) {
            return 'Returning back to merchant.';
        }

        const addBalanceButtonTitle = this.state.showExternalDaiWindow ? 'Cancel Transaction' : 'Add to Balance';

        return (
            <div>
                <h1>Merchant</h1>
                <div>Amount to spend: {AMOUNT}</div>
                <div>Merchant Address: {ADDRESS}</div>
                <button
                    onClick={this.state.showExternalDaiWindow ? this.cancelTransaction : this.addToBalanceHandler}
                >
                    {addBalanceButtonTitle}
                </button>

                {this.state.transactionStatus && (
                    <div style={{ marginTop: '20px'}}>
                        <h4>Transaction Status</h4>
                        <div>
                            {this.state.transactionStatus}
                        </div>
                    </div>
                )}

                {
                    this.state.showExternalDaiWindow && (
                        <ExternalWindowPortal
                            onClose={this.closeWindow}
                            redirectOnLoad={() => {
                                return this.redirectOnLoad(REDIRECT_URL, SOURCE, ADDRESS, AMOUNT);
                            }}
                        >
                            <div>Loading xdai.io</div>
                        </ExternalWindowPortal>
                    )
                }
            </div>
        );
    }
}

/** Render to Page **/
render(<App />, document.getElementById('app'));
