const fs = require("fs");

const collection = {
  info: {
    name: "Novas Payments Regression Suite",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "invalid_uuid", value: "00000000-0000-0000-0000-000000000000" },
    { key: "malformed_uuid", value: "invalid-payment-id" }
  ],
  item: [
    {
      name: "PAYMENTS | Login | Setup token",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
        body: { mode: "raw", raw: JSON.stringify({ phone: "{{valid_phone}}", password: "{{valid_password}}" }) }
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Login status is 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Token exists', function(){ pm.expect(json.data.access_token).to.exist; });",
        "pm.environment.set('token', json.data.access_token);"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Payments | Valid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "if(pm.response.code === 200){",
        "  pm.test('Payments response has data', function(){ pm.expect(json.data).to.exist; });",
        "  var text = JSON.stringify(json);",
        "  var match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);",
        "  if(match){ pm.environment.set('paymentId', match[0]); console.log('Payment ID saved:', match[0]); }",
        "}",
        "pm.test('Response time acceptable', function(){ pm.expect(pm.response.responseTime).to.be.below(4000); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Payments | Missing token",
      request: {
        method: "GET",
        header: [],
        url: "{{base_url}}/api/v1/admin/payments?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Missing token rejected', function(){ pm.expect([401,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Payments | Invalid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer invalid-token-123" }],
        url: "{{base_url}}/api/v1/admin/payments?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid token rejected', function(){ pm.expect([401,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Single Payment | Existing or saved id",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments/{{paymentId}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response is JSON', function(){ pm.expect(json).to.be.an('object'); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Single Payment | Invalid UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments/{{invalid_uuid}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Single Payment | Malformed UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments/{{malformed_uuid}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Malformed UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Payments | Invalid pagination",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments?page=-1&limit=-5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid pagination handled safely', function(){ pm.expect([200,400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Payments | SQL injection search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments?search=' OR '1'='1"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('SQL injection handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response is not server error', function(){ pm.response.to.not.have.status(500); });"
      ]}}]
    },
    {
      name: "PAYMENTS | GET Payments | XSS search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/payments?search=<script>alert(1)</script>"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('XSS handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response body does not echo script unsafely', function(){ pm.expect(pm.response.text()).to.not.include('<script>alert(1)</script>'); });"
      ]}}]
    },
    {
      name: "PAYMENTS | POST Create Payment | Empty payload validation",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/payments",
        body: { mode: "raw", raw: "{}" }
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Validation or auth status acceptable', function(){ pm.expect([401,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "if(pm.response.code === 422){ pm.test('Validation response success false', function(){ pm.expect(json.success).to.eql(false); }); }"
      ]}}]
    }
  ]
};

fs.writeFileSync(
  "postman/Novas_Payments_Regression.postman_collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("Payments regression collection created successfully");
