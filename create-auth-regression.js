const fs = require("fs");

const collection = {
  info: {
    name: "Novas Auth Regression Suite",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "valid_phone", value: "251913131313" },
    { key: "valid_password", value: "password" },
    { key: "invalid_phone", value: "251900000000" },
    { key: "invalid_password", value: "WrongPassword123!" }
  ],
  item: [
    {
      name: "AUTH | POST Login | Valid credentials",
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
            "pm.test('Status is 200', function(){ pm.response.to.have.status(200); });",
            "pm.test('Login success true', function(){ pm.expect(json.success).to.eql(true); });",
            "pm.test('Access token exists', function(){ pm.expect(json.data.access_token).to.exist; });",
            "pm.test('Refresh token exists', function(){ pm.expect(json.data.refresh_token).to.exist; });",
            "pm.environment.set('token', json.data.access_token);",
            "pm.environment.set('refresh_token', json.data.refresh_token);",
            "pm.environment.set('auth_user_id', json.data.data.id);",
            "pm.environment.set('auth_user_role', json.data.roles[0]);"
          ]
        }
      }]
    },
    {
      name: "AUTH | POST Login | Invalid phone",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
        body: {
          mode: "raw",
          raw: JSON.stringify({
            phone: "{{invalid_phone}}",
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
            "pm.test('Status is 403', function(){ pm.response.to.have.status(403); });",
            "pm.test('Login rejected', function(){ pm.expect(json.success).to.eql(false); });",
            "pm.test('Error message exists', function(){ pm.expect(json.message).to.exist; });"
          ]
        }
      }]
    },
    {
      name: "AUTH | POST Login | Invalid password",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
        body: {
          mode: "raw",
          raw: JSON.stringify({
            phone: "{{valid_phone}}",
            password: "{{invalid_password}}"
          })
        }
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "pm.test('Status is 403', function(){ pm.response.to.have.status(403); });",
            "pm.test('Login rejected', function(){ pm.expect(json.success).to.eql(false); });"
          ]
        }
      }]
    },
    {
      name: "AUTH | POST Login | Missing phone",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
        body: {
          mode: "raw",
          raw: JSON.stringify({
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
            "pm.test('Status is 422', function(){ pm.response.to.have.status(422); });",
            "pm.test('Validation failed', function(){ pm.expect(json.success).to.eql(false); });",
            "pm.test('Phone validation exists', function(){ pm.expect(JSON.stringify(json.data)).to.include('phone'); });"
          ]
        }
      }]
    },
    {
      name: "AUTH | POST Login | Missing password",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
        body: {
          mode: "raw",
          raw: JSON.stringify({
            phone: "{{valid_phone}}"
          })
        }
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "pm.test('Status is 422', function(){ pm.response.to.have.status(422); });",
            "pm.test('Validation failed', function(){ pm.expect(json.success).to.eql(false); });",
            "pm.test('Password validation exists', function(){ pm.expect(JSON.stringify(json.data)).to.include('password'); });"
          ]
        }
      }]
    },
    {
      name: "AUTH | POST Login | Empty body",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: "{{base_url}}/api/v1/auth/login",
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
            "var json = pm.response.json();",
            "pm.test('Status is 422', function(){ pm.response.to.have.status(422); });",
            "pm.test('Validation failed', function(){ pm.expect(json.success).to.eql(false); });"
          ]
        }
      }]
    },
    {
      name: "AUTH | GET Profile | Valid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/auth/profile"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "pm.test('Status is 200', function(){ pm.response.to.have.status(200); });",
            "pm.test('Profile returned', function(){ pm.expect(json.data).to.exist; });",
            "pm.test('User ID exists', function(){ pm.expect(json.data.id || json.data.data?.id).to.exist; });"
          ]
        }
      }]
    },
    {
      name: "AUTH | GET Profile | Invalid token",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer invalid-token-123" }],
        url: "{{base_url}}/api/v1/auth/profile"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Status is 401', function(){ pm.response.to.have.status(401); });"
          ]
        }
      }]
    },
    {
      name: "AUTH | DELETE Logout | Valid token",
      request: {
        method: "DELETE",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/auth/logout"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "pm.test('Status is 200', function(){ pm.response.to.have.status(200); });",
            "pm.test('Logout successful', function(){ pm.expect(JSON.stringify(json)).to.include('Logged out'); });"
          ]
        }
      }]
    },
    {
      name: "AUTH | GET Profile | After logout",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: "{{base_url}}/api/v1/auth/profile"
      },
      event: [{
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Status is 401 after logout', function(){ pm.response.to.have.status(401); });"
          ]
        }
      }]
    }
  ]
};

fs.writeFileSync(
  "postman/Novas_Auth_Regression.postman_collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("Auth regression collection created successfully");
