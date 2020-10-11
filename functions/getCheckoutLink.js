const squareConnect = require("square-connect");
const crypto = require("crypto");

const squareClient = squareConnect.ApiClient.instance
const oauth2 = squareClient.authentications["oauth2"];

oauth2.accessToken = process.env.SANDBOX_ACCESS_TOKEN;
// oauth2.accessToken = process.env.ACCESS_TOKEN;
squareClient.basePath = "https://connect.squareupsandbox.com"
// squareClient.basePath = "https://connect.squareup.com"

exports.handler = async function (event, context, callback) {
  const data = JSON.parse(event.body);
  const { cartTotal, nonce, buyerVerificationToken } = data

  console.log({ cartTotal, nonce, buyerVerificationToken });

  const idempotencyKey = crypto.randomBytes(23).toString('hex');

  const paymentsAPI = new squareConnect.PaymentsApi();
  const requestBody = {
    source_id: nonce,
    verification_token: buyerVerificationToken,
    amount_money: {
      amount: cartTotal,
      currency: 'USD'
    },
    idempotency_key: idempotencyKey
  };

  try {
    const response = await paymentsAPI.createPayment(requestBody);
    const json = JSON.stringify(response);
    console.log('API called successfully. Returned data: ' + data);

    callback(null, {
      statusCode: 200,
      body: json
    });

  } catch (error) {
    console.error(error);
    callback(err);
  }
};
