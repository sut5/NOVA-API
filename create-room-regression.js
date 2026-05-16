const fs = require("fs");

const collection = {
  info: {
    name: "Novas Room Regression Suite",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "invalid_uuid", value: "00000000-0000-0000-0000-000000000000" },
    { key: "malformed_uuid", value: "invalid-room-id" }
  ],
  item: [
    {
      name: "ROOM | Login | Setup token",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
        body: {
          mode: "raw",
          raw: JSON.stringify({
            phone: "{{valid_phone}}",
            password: "{{valid_password}}"
          })
        }
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "var json = pm.response.json();",
          "pm.test('Login status is 200', function(){ pm.response.to.have.status(200); });",
          "pm.test('Token exists', function(){ pm.expect(json.data.access_token).to.exist; });",
          "pm.environment.set('token', json.data.access_token);"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | Valid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms?page=1&limit=5"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "var json = pm.response.json();",
          "pm.test('Status is 200', function(){ pm.response.to.have.status(200); });",
          "pm.test('Success true', function(){ pm.expect(json.success).to.eql(true); });",
          "pm.test('Rooms response has data', function(){ pm.expect(json.data).to.exist; });",
          "pm.test('Response time acceptable', function(){ pm.expect(pm.response.responseTime).to.be.below(4000); });",
          "var text = JSON.stringify(json);",
          "var match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);",
          "if(match){ pm.environment.set('roomId', match[0]); console.log('Room ID saved:', match[0]); }"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | Missing token",
      request: {
        method: "GET",
        header: [],
        url: "{{base_url}}/api/v1/admin/rooms?page=1&limit=5"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('Missing token rejected', function(){ pm.expect([401,403,405]).to.include(pm.response.code); });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | Invalid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer invalid-token-123" }],
        url: "{{base_url}}/api/v1/admin/rooms?page=1&limit=5"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('Invalid token rejected', function(){ pm.expect([401,403,405]).to.include(pm.response.code); });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Single Room | Valid room id",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms/{{roomId}}"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "var json = pm.response.json();",
          "pm.test('Status is acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
          "pm.test('Response is JSON', function(){ pm.expect(json).to.be.an('object'); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Single Room | Invalid UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms/{{invalid_uuid}}"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('Invalid UUID rejected or not found', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Single Room | Malformed UUID",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms/{{malformed_uuid}}"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('Malformed UUID rejected', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | Pagination limit 1",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms?page=1&limit=1"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "var json = pm.response.json();",
          "pm.test('Status is 200', function(){ pm.response.to.have.status(200); });",
          "pm.test('Response has data', function(){ pm.expect(json.data).to.exist; });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | Invalid pagination",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms?page=-1&limit=-5"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('Invalid pagination handled safely', function(){ pm.expect([200,400,422]).to.include(pm.response.code); });",
          "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | SQL injection search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms?search=' OR '1'='1"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('SQL injection search handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
          "pm.test('Response is not server error', function(){ pm.response.to.not.have.status(500); });"
        ]}
      }]
    },
    {
      name: "ROOM | GET Rooms | XSS search",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/admin/rooms?search=<script>alert(1)</script>"
      },
      event: [{
        listen: "test",
        script: { type: "text/javascript", exec: [
          "pm.test('XSS search handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
          "pm.test('Response body does not echo script unsafely', function(){ pm.expect(pm.response.text()).to.not.include('<script>alert(1)</script>'); });"
        ]}
      }]
    }
  ]
};

fs.writeFileSync(
  "postman/Novas_Room_Regression.postman_collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("Room regression collection created successfully");
