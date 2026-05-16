const fs = require("fs");

const collection = {
  info: {
    name: "Novas Room Type Regression Suite",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "invalid_uuid", value: "00000000-0000-0000-0000-000000000000" },
    { key: "malformed_uuid", value: "invalid-room-type-id" }
  ],
  item: [
    {
      name: "ROOM TYPE | Login | Setup token",
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
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "pm.test('Login status is 200', function(){ pm.response.to.have.status(200); });",
            "pm.test('Token exists', function(){ pm.expect(json.data.access_token).to.exist; });",
            "pm.environment.set('token', json.data.access_token);"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Room Types | Valid token",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types?page=1&limit=5"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "pm.test('Status acceptable', function(){ pm.expect([200,403,405]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
            "if(pm.response.code === 200){",
            "  var text = JSON.stringify(json);",
            "  var match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);",
            "  if(match){",
            "    pm.environment.set('roomTypeId', match[0]);",
            "    console.log('Saved roomTypeId:', match[0]);",
            "  }",
            "}",
            "pm.test('Response time acceptable', function(){ pm.expect(pm.response.responseTime).to.be.below(4000); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Room Types | Missing token",
      request: {
        method: "GET",
        url: "{{base_url}}/api/v1/admin/room-types?page=1&limit=5"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Unauthorized request rejected', function(){ pm.expect([401,403,405]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Room Types | Invalid token",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer invalid-token" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types?page=1&limit=5"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Invalid token rejected', function(){ pm.expect([401,403,405]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Single Room Type | Existing id",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types/{{roomTypeId}}"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Status acceptable', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Single Room Type | Invalid UUID",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types/{{invalid_uuid}}"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Invalid UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Single Room Type | Malformed UUID",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types/{{malformed_uuid}}"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Malformed UUID handled safely', function(){ pm.expect([400,403,404,405,422]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Room Types | SQL Injection",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types?search=' OR '1'='1"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('SQL injection handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | GET Room Types | XSS",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types?search=<script>alert(1)</script>"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('XSS handled safely', function(){ pm.expect(pm.response.code).to.be.below(500); });",
            "pm.test('No reflected script', function(){ pm.expect(pm.response.text()).to.not.include('<script>alert(1)</script>'); });"
          ]
        }
      }]
    },

    {
      name: "ROOM TYPE | POST Create Room Type | Empty payload",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" },
          { key: "Content-Type", value: "application/json" }
        ],
        url: "{{base_url}}/api/v1/admin/room-types",
        body: {
          mode: "raw",
          raw: "{}"
        }
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Validation handled safely', function(){ pm.expect([401,403,405,422]).to.include(pm.response.code); });",
            "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
          ]
        }
      }]
    }
  ]
};

fs.writeFileSync(
  "postman/Novas_RoomType_Regression.postman_collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("Room Type regression collection created successfully");
