const stripeAPI = require('stripe');
const paypal = require('paypal-rest-sdk');
const fetch = require('node-fetch');
require('dotenv').config();

paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: process.env.PAYPAL_CLIENTID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

let stripeGateway = stripeAPI(process.env.STRIPE_API_KEY);

const exchangeRate = async (from, to) => {
    return await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(async (response) => {
            const result = await response.json();
            if (result.result == 'success') {
                let rate = result.rates[to.toUpperCase()];
                // console.log(rate)
                return rate;
            }

            return 0;
        })
        .catch((err) => {
            return 0;
        });
};

// Params: options
// {
//     items (name, price, quantity, image?) - [Danh sách sản phẩm],
//     success_url, cancel_url - [Callback url]
// }
const createStripeSession = async (options) => {
    try {
        const { items, success_url, cancel_url } = options;

        const lineItems = items.map((item) => {
            const unitAmount = Math.round(item.price * 100);
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.image || 'https://react.semantic-ui.com/images/wireframe/square-image.png'],
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        // console.log(lineItems);

        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            line_items: lineItems,
            //  Asking address in Stripe
            billing_address_collection: 'required',
        });

        // console.log('Stripe Payment Created');

        return session.url;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

// Params: options
// {
//     items (name, price, quantity) - [Danh sách sản phẩm]
//     total - [Tống tiền]
//     success_url, cancel_url - [Callback url]
// }
const createPaypalSession = async (options) => {
    try {
        const { success_url, cancel_url, items, total } = options;
        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: success_url,
                cancel_url: cancel_url,
            },
            transactions: [
                {
                    item_list: {
                        items: items.map(item => {
                            return {
                                ...item,
                                price: item.price.toFixed(2),
                                currency: 'USD'
                            }
                        }),
                    },
                    amount: {
                        currency: 'USD',
                        total: total.toFixed(2),
                    },
                    description: 'SUD payment gateway test',
                },
            ],
        };

        const payment = await new Promise((resolve, reject) => {
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    reject(error);
                } else {
                    resolve(payment);
                }
            });
        });
        

        for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
                return payment.links[i].href;
            }
        }
 
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

async function testStripe() {
    const rate = await exchangeRate('vnd', 'usd');
    let result = await createStripeSession({
        items: [
            {
                name: 'Product test',
                price: 215000 * rate,
                quantity: 2,
                image: 'https://tressays.files.wordpress.com/2015/09/test-clip-art-cpa-school-test.png',
            },
        ],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/fail',
    });

    console.log(result);
}

async function testPaypal() {
    const rate = await exchangeRate('vnd', 'usd');
    let result = await createPaypalSession({
        items: [
            {
                name: 'Product test',
                price: 200000 * rate,
                quantity: 2,
            },
        ],
        total: 400000 * rate,
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/fail',
    });

    console.log(result);
}

// testPaypal();
// testStripe();

module.exports = { exchangeRate, createStripeSession, createPaypalSession };
