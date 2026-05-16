const fs = require("fs");

const file = "postman/Novas_Auth_Regression.postman_collection.json";
const collection = JSON.parse(fs.readFileSync(file, "utf8"));

const extraTests = [
  {
    name: "AUTH | GET Profile | Missing token",
    request: {
      method: "GET",
      header: [],
      url: "{{base_url}}/api/v1/auth/profile"
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "pm.test('Status is 401 or 405', function(){ pm.expect([401,405]).to.include(pm.response.code); });"
    ]}}]
  },
  {
    name: "AUTH | GET Profile | Empty Bearer token",
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "Bearer " }],
      url: "{{base_url}}/api/v1/auth/profile"
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "pm.test('Status is 401 or 405', function(){ pm.expect([401,405]).to.include(pm.response.code); });"
    ]}}]
  },
  {
    name: "AUTH | POST Login | SQL injection phone",
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      url: "{{base_url}}/api/v1/auth/login",
      body: { mode: "raw", raw: JSON.stringify({ phone: "' OR '1'='1", password: "{{valid_password}}" }) }
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "var json = pm.response.json();",
      "pm.test('SQL injection is rejected', function(){ pm.expect([401,403,422]).to.include(pm.response.code); });",
      "pm.test('Login not successful', function(){ pm.expect(json.success).to.eql(false); });"
    ]}}]
  },
  {
    name: "AUTH | POST Login | XSS payload phone",
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      url: "{{base_url}}/api/v1/auth/login",
      body: { mode: "raw", raw: JSON.stringify({ phone: "<script>alert(1)</script>", password: "{{valid_password}}" }) }
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "var json = pm.response.json();",
      "pm.test('XSS payload is rejected', function(){ pm.expect([401,403,422]).to.include(pm.response.code); });",
      "pm.test('Login not successful', function(){ pm.expect(json.success).to.eql(false); });"
    ]}}]
  },
  {
    name: "AUTH | POST Login | Very long password",
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      url: "{{base_url}}/api/v1/auth/login",
      body: { mode: "raw", raw: JSON.stringify({ phone: "{{valid_phone}}", password: "A".repeat(1000) }) }
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "var json = pm.response.json();",
      "pm.test('Very long password rejected safely', function(){ pm.expect([401,403,422]).to.include(pm.response.code); });",
      "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
    ]}}]
  },
  {
    name: "AUTH | DELETE Logout | Missing token",
    request: {
      method: "DELETE",
      header: [],
      url: "{{base_url}}/api/v1/auth/logout"
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "pm.test('Logout without token rejected', function(){ pm.expect([401,405]).to.include(pm.response.code); });"
    ]}}]
  },
  {
    name: "AUTH | DELETE Logout | Double logout",
    request: {
      method: "DELETE",
      header: [{ key: "Authorization", value: "Bearer {{token}}" }],
      url: "{{base_url}}/api/v1/auth/logout"
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "pm.test('Double logout handled safely', function(){ pm.expect([200,401,405]).to.include(pm.response.code); });"
    ]}}]
  }
];

collection.item.push(...extraTests);

fs.writeFileSync(file, JSON.stringify(collection, null, 2));
console.log("Extended auth regression tests added:", extraTests.length);
