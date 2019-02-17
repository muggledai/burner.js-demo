/** React **/
import React from 'react';
import { render } from 'react-dom';

/** Third Party **/
import querystring from 'query-string';

/** Components **/
import ExternalWindowPortal from './components/ExternalWindowPortal';

/** HARDCODED **/
const REDIRECT_URL = 'http://localhost:5555';
const ADDRESS = 'abcd1234';

const COMPANY_LOGO_URL = "http://flavorwire.files.wordpress.com/2011/08/office.jpeg?w=1920";
const COMPANY_NAME = "Dunder Mifflin";
const BASE_COMPANY_TX_ID = "12231";

/** Definitions **/
class App extends React.Component {
    state = {
        showExternalDaiWindow: false,
        transactionStatus: null,
        currentTransactionId: BASE_COMPANY_TX_ID,
    };

    closeWindow = () => this.setState({ showExternalDaiWindow: false });
    payWithBurnerHandler = () => {
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

    redirectOnLoad = (redirectUrl, address) => {

        const qsparams = {
            burnerjs: true,
            redirectBack: redirectUrl,
            address,
            companyLogoUrl: COMPANY_LOGO_URL,
            companyName: COMPANY_NAME,
            companyTxId: this.state.currentTransactionId,
            transactionDateTime: new Date(),
            total: 14.50,
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
        if (queryStringParams && queryStringParams.action === 'cancel' && queryStringParams.status === 'noop') {
            transactionStatus = 'User cancelled payment';
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

        const payWithBurnerButtonTitle = this.state.showExternalDaiWindow ? 'Cancel Transaction' : 'Pay with Burner';

        return (
            <div style={{
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div>
                    <img src={COMPANY_LOGO_URL} width="325px"/>
                </div>
                <div style={{
                    padding: '20px 0',
                }}>
                    <button
                        onClick={this.state.showExternalDaiWindow ? this.cancelTransaction : this.payWithBurnerHandler}
                    >
                        {payWithBurnerButtonTitle}
                    </button>
                </div>

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
                                return this.redirectOnLoad(REDIRECT_URL, ADDRESS);
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
