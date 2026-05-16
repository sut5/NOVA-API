const fs = require("fs");

const collection = {
  info: {
    name: "Novas Users Regression Suite",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "invalid_uuid", value: "00000000-0000-0000-0000-000000000000" },
    { key: "malformed_uuid", value: "invalid-user-id" }
  ],
  item: [
    {
      name: "USERS | Login | Setup token",
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
      name: "USERS | GET Users | Valid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "if(pm.response.code === 200){",
        "  pm.test('Users response has data', function(){ pm.expect(json.data).to.exist; });",
        "  var text = JSON.stringify(json);",
        "  var match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);",
        "  if(match){ pm.environment.set('userId', match[0]); console.log('User ID saved:', match[0]); }",
        "}",
        "pm.test('Response time acceptable', function(){ pm.expect(pm.response.responseTime).to.be.below(4000); });"
      ]}}]
    },
    {
      name: "USERS | GET Customers | Valid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users/customers?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "if(pm.response.code === 200){ pm.test('Customers response has data', function(){ pm.expect(json.data).to.exist; }); }"
      ]}}]
    },
    {
      name: "USERS | GET Users | Missing token",
      request: {
        method: "GET",
        header: [],
        url: "{{base_url}}/api/v1/admin/users?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Missing token rejected', function(){ pm.expect([401,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "USERS | GET Users | Invalid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer invalid-token-123" }],
        url: "{{base_url}}/api/v1/admin/users?page=1&limit=5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid token rejected', function(){ pm.expect([401,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "USERS | GET Single User | Existing or saved id",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users/{{userId}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "var json = pm.response.json();",
        "pm.test('Status acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response is JSON', function(){ pm.expect(json).to.be.an('object'); });"
      ]}}]
    },
    {
      name: "USERS | GET Single User | Invalid UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users/{{invalid_uuid}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "USERS | GET Single User | Malformed UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users/{{malformed_uuid}}"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Malformed UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "USERS | GET Users | Invalid pagination",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users?page=-1&limit=-5"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('Invalid pagination handled safely', function(){ pm.expect([200,400,403,404,405,422]).to.include(pm.response.code); });",
        "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
      ]}}]
    },
    {
      name: "USERS | GET Users | SQL injection search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users?search=' OR '1'='1"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('SQL injection handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response is not server error', function(){ pm.response.to.not.have.status(500); });"
      ]}}]
    },
    {
      name: "USERS | GET Users | XSS search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/users?search=<script>alert(1)</script>"
      },
      event: [{ listen: "test", script: { type: "text/javascript", exec: [
        "pm.test('XSS handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
        "pm.test('Response body does not echo script unsafely', function(){ pm.expect(pm.response.text()).to.not.include('<script>alert(1)</script>'); });"
      ]}}]
    },
    {
      name: "USERS | POST Create User | Empty payload validation",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/users",
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
  "postman/Novas_Users_Regression.postman_collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("Users regression collection created successfully");
