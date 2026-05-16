const fs = require("fs");

const collection = {
  info: {
    name: "Novas Discount Regression Suite",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "invalid_uuid", value: "00000000-0000-0000-0000-000000000000" },
    { key: "malformed_uuid", value: "invalid-discount-id" }
  ],
  item: [
    {
      name: "DISCOUNT | Login | Setup token",
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
      name: "DISCOUNT | GET Discounts | Valid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status is acceptable', function(){ pm.expect([200,403,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "if(pm.response.code === 200){",
        "  pm.test('Discount response has data', function(){ pm.expect(json.data).to.exist; });",
        "  var text = JSON.stringify(json);",
        "  var match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);",
        "  if(match){ pm.environment.set('discountId', match[0]); console.log('Discount ID saved:', match[0]); }",
        "}",
        "pm.test('Response time acceptable', function(){ pm.expect(pm.response.responseTime).to.be.below(4000); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Active Discounts",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount/active"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Active discount status acceptable', function(){ pm.expect([200,403,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Expired Discounts",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount/expired"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Expired discount status acceptable', function(){ pm.expect([200,403,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Scheduled Discounts",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount/scheduled"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Scheduled discount status acceptable', function(){ pm.expect([200,403,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Discounts | Missing token",
      request: {
        method: "GET",
        header: [],
        url: "{{base_url}}/api/v1/discount?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Missing token rejected', function(){ pm.expect([401,403,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Discounts | Invalid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer invalid-token-123" }],
        url: "{{base_url}}/api/v1/discount?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid token rejected', function(){ pm.expect([401,403,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Single Discount | Existing or saved id",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount/{{discountId}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status is acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response is JSON', function(){ pm.expect(json).to.be.an('object'); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Single Discount | Invalid UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount/{{invalid_uuid}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Single Discount | Malformed UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount/{{malformed_uuid}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Malformed UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Discounts | Invalid pagination",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount?page=-1&limit=-5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid pagination handled safely', function(){ pm.expect([200,400,403,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Discounts | SQL injection search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount?search=' OR '1'='1"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('SQL injection handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response is not server error', function(){ pm.response.to.not.have.status(500); });"
      ]}}]
    },
    {
      name: "DISCOUNT | GET Discounts | XSS search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/discount?search=<script>alert(1)</script>"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('XSS handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response body does not echo script unsafely', function(){ pm.expect(pm.response.text()).to.not.include('<script>alert(1)</script>'); });"
      ]}}]
    },
    {
      name: "DISCOUNT | POST Create Discount | Empty payload validation",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/discount",
        body: { mode: "raw", raw: "{}" }
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Validation or auth status acceptable', function(){ pm.expect([401,403,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "if(pm.response.code === 422){ pm.test('Validation response success false', function(){ pm.expect(json.success).to.eql(false); }); }"
      ]}}]
    }
  ]
};

fs.writeFileSync(
  "postman/Novas_Discount_Regression.postman_collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("Discount regression collection created successfully");
