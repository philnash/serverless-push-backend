/**
 *  Requeset an Access Token
 *
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *
 *  Parameters
 *  - identity - required - unique user id, no PII
 *
 *
 *  Returns JSON
 *
 *  on Success:
 *  {
 *    "token": "eyJ6aXAiOiJERUYiLCJraWQiOiJTQVNfUzNfX19...."
 *  }
 *
 *  on Error:
 *  {
 *    "error" {
 *       "message": "Details about your error",
 *       "moreInfo": "Link to error"
 *    }
 *  }
 */
var crypto = require("crypto");

function generateSHA256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  // uncomment to support CORS
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof event.identity === "undefined") {
    response.setBody({
      error: {
        message: "Missing parameter; please provide a unique user identity.",
        moreInfo: "https://www.twilio.com/docs/verify/api/access-token",
      },
    });
    response.setStatusCode(400);
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const serviceSid = context.VERIFY_SERVICE_SID;
  const identity = context.HASH_IDENTITY
    ? generateSHA256(event.identity)
    : event.identity;
  const factorType = "push";

  client.verify
    .services(serviceSid)
    .accessTokens.create({ identity, factorType })
    .then((resp) => {
      response.setStatusCode(200);
      response.setBody({
        token: resp.token,
        identity,
        factorType,
      });
      callback(null, response);
    })
    .catch((error) => {
      console.log(error);
      response.setStatusCode(error.status);
      response.setBody({
        ...error,
      });
      callback(null, response);
    });
};
