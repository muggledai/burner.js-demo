/** React **/
import React from 'react';
import { render } from 'react-dom';

/** Third Party **/
import querystring from 'query-string';

/** Components **/
import ExternalWindowPortal from './components/ExternalWindowPortal';

/** Assets **/
import pwaImg from '../pwa.png';
import checkmarkImg from '../checkmark.jpeg';
import burnerwallet from '../burnerwallet.png';

/** HARDCODED **/
const REDIRECT_URL = 'http://localhost:5555';

const COMPANY_LOGO_URL = "http://flavorwire.files.wordpress.com/2011/08/office.jpeg?w=1920";
const COMPANY_NAME = "Dunder Mifflin";
const BASE_COMPANY_TX_ID = "12231";

const COMPANY_ADDRESS = process.env.MERCHANT_ADDRESS;

/** Definitions **/
class App extends React.Component {
    state = {
        showExternalDaiWindow: false,
        transactionStatus: null,
        txSuccess: false,
        txInProgress: false,
        currentTransactionId: BASE_COMPANY_TX_ID,
        costValue: '1.50',
        showEditView: false,
    };

    closeWindow = () => this.setState({ showExternalDaiWindow: false });
    payWithBurnerHandler = () => {
        this.setState({
            txInProgress: true,
            showExternalDaiWindow: true,
            // transactionStatus: 'Having user confirm transaction in burner wallet.',
        });
    }

    toggleEditView = () => this.setState(currState => ({ showEditView: !currState.showEditView }));

    onCostValueChange = (e) => {
        this.setState({
            costValue: e.target.value,
        });
    }

    onTxIdChange = (e) => {
        this.setState({
            currentTransactionId: e.target.value,
        });
    }

    cancelTransaction = () => {
        this.setState({
            showExternalDaiWindow: false,
            transactionStatus: 'Cancelled transaction here.',
        });
    }

    redirectOnLoad = () => {

        let total = null;

        try {
            total = parseFloat(this.state.costValue);
        } catch (e) {
            this.setState({
                transactionStatus: 'Not a valid amount',
            });
            return;
        }

        const qsparams = {
            burnerjs: true,
            redirectBack: REDIRECT_URL,
            address: COMPANY_ADDRESS,
            companyLogoUrl: COMPANY_LOGO_URL,
            companyName: COMPANY_NAME,
            companyTxId: this.state.currentTransactionId,
            transactionDateTime: new Date(),
            total,
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
            this.closeWindow();
            this.setState({
                transactionStatus,
                txSuccess: false,
                txInProgress: false,
            });
        }

        if (queryStringParams && queryStringParams.action === 'confirm' && queryStringParams.status === 'success') {
            transactionStatus = 'Payment confirmed. Tx Hash: ' + queryStringParams.txhash;
            this.closeWindow();
            this.setState({
                transactionStatus,
                txSuccess: true,
                txInProgress: false,
            });
        }



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
                alignItems: 'center',
                margin: '0 20px',
            }}>
                <div>
                    <img src={COMPANY_LOGO_URL} width="325px"/>
                </div>

                <div style={{
                    width: '100%',
                    margin: '10px 0 0 0',
                    padding: '30px',
                    borderRadius: '5px',
                    backgroundColor: '#f0f0f0',
                    boxSizing: 'border-box',
                }}>
                    <h3 style={{ margin: 0, padding: '5px 0',}}
                        onClick={this.toggleEditView}>
                        Order Summary</h3>
                    <hr />
                    {this.state.showEditView && (<div>
                        <h5>This is for showing dynamic usage of burner.js to burner wallet.</h5>
                        <div style={{ padding: '5px 0', display: 'flex', fontSize: '17px', alignItems: 'center'}}>
                        Order #: <input
                            style={{
                                marginLeft: '10px',
                                border: 'none',
                                outline: 'none',
                                width: '70%',
                                borderRadius: '4px',
                                color: '#32325d',
                                fontWeight: '400',
                                fontSize: '17px',
                                lineHeight: '26px',
                                padding: '5px 20px 8px 8px',
                                transition: 'background-color .1s ease-in,color .1s ease-in',
                            }}
                            value={this.state.currentTransactionId}
                            disabled={this.state.showExternalDaiWindow}
                            onChange={this.onTxIdChange}
                        />
                    </div>
                    <div style={{ padding: '5px 0', display: 'flex', fontSize: '17px', alignItems: 'center'}}>
                        Total: <input
                            style={{
                                marginLeft: '10px',
                                border: 'none',
                                outline: 'none',
                                width: '70%',
                                borderRadius: '4px',
                                color: '#32325d',
                                fontWeight: '400',
                                fontSize: '17px',
                                lineHeight: '26px',
                                padding: '5px 20px 8px 8px',
                                transition: 'background-color .1s ease-in,color .1s ease-in',
                            }}
                            value={this.state.costValue}
                            disabled={this.state.showExternalDaiWindow}
                            onChange={this.onCostValueChange}
                        />
                    </div>
                    <hr />
                    </div>
                )}

                <table style={{width: '100%'}}>
                <tbody>
                <tr>
                <td style={{fontWeight: 'bold'}}>Order Number</td><td>{this.state.currentTransactionId}</td>
                </tr>
                <tr>
                <td style={{fontWeight: 'bold'}}>Total Amount Due</td>
                <td>${parseFloat(this.state.costValue).toFixed(2)}</td>
                </tr>
                </tbody>
                </table>
                </div>

                <div style={{
                    padding: '20px 0',
                }}>
                    {!this.state.txInProgress && this.state.txSuccess && (
                        <div style={{ padding: '5px 0', display: 'flex'}}>
                            <div>
                            <img src={checkmarkImg} width="50px" />
                            </div>
                            <div style={{ paddingLeft: '20px', fontSize: '20px'}}>
                                Payment has been captured. Thank you!
                            </div>

                        </div>
                    )}
                    {!this.state.txSuccess && (
                        <div style={{ padding: '5px 0'}}>
                            <button
                                style={{
                                    backgroundImage: 'linear-gradient(rgb(41, 41, 41), rgb(25, 25, 25))',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    fontSize: '17px',
                                    padding: '10px 15px',
                                }}
                                onClick={this.state.showExternalDaiWindow ? this.cancelTransaction : this.payWithBurnerHandler}
                            >
                                <img src={burnerwallet} width="20px" />
                                <span style={{paddingLeft: '10px'}}>{payWithBurnerButtonTitle}</span>
                            </button>
                        </div>
                    )}
                    {!this.state.txInProgress && !this.state.txSuccess && (
                    <div style={{ padding: '5px 0'}}>
                        <img src={pwaImg} width="180px"/>
                    </div>
                    )}
                </div>

                {this.state.transactionStatus && (
                    <div style={{ marginTop: '20px', wordBreak: 'break-all'}}>
                        <h4>Technical Details</h4>
                        <div>
                            {this.state.transactionStatus}
                        </div>
                    </div>
                )}

                {
                    this.state.showExternalDaiWindow && (
                        <ExternalWindowPortal
                            onClose={this.closeWindow}
                            redirectOnLoad={this.redirectOnLoad}
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
