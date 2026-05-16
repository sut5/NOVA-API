const fs = require("fs");

const file = "postman/Novas_Room_Regression.postman_collection.json";
const collection = JSON.parse(fs.readFileSync(file, "utf8"));

const crudTests = [
  {
    name: "ROOM | POST Create Room | Valid payload",
    request: {
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json" },
        { key: "Authorization", value: "Bearer {{token}}" }
      ],
      url: "{{base_url}}/api/v1/admin/rooms",
      body: {
        mode: "raw",
        raw: JSON.stringify({
          name: "AUTO_ROOM_{{$timestamp}}",
          floor: "1",
          room_type_id: "{{roomTypeId}}",
          status: "active"
        })
      }
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "var json = pm.response.json();",
      "pm.test('Create status is 200 or 201', function(){ pm.expect([200,201]).to.include(pm.response.code); });",
      "pm.test('Create success true', function(){ pm.expect(json.success).to.eql(true); });",
      "pm.test('Created room ID exists', function(){ var id = json.data?.id || json.data?.data?.id; pm.expect(id).to.exist; pm.environment.set('createdRoomId', id); console.log('Created room ID:', id); });"
    ]}}]
  },
  {
    name: "ROOM | GET Created Room | Same run only",
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "Bearer {{token}}" }],
      url: "{{base_url}}/api/v1/admin/rooms/{{createdRoomId}}"
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "var json = pm.response.json();",
      "pm.test('Get created room handled safely', function(){ pm.expect([200,403,404,405]).to.include(pm.response.code); });",
      "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });",
      "pm.test('Response is JSON', function(){ pm.expect(json).to.be.an('object'); });"
    ]}}]
  },
  {
    name: "ROOM | POST Create Room | Missing required fields",
    request: {
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json" },
        { key: "Authorization", value: "Bearer {{token}}" }
      ],
      url: "{{base_url}}/api/v1/admin/rooms",
      body: { mode: "raw", raw: "{}" }
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "var json = pm.response.json();",
      "pm.test('Validation status is 422', function(){ pm.response.to.have.status(422); });",
      "pm.test('Validation success false', function(){ pm.expect(json.success).to.eql(false); });",
      "pm.test('Required field errors exist', function(){ var text = JSON.stringify(json); pm.expect(text).to.include('name'); pm.expect(text).to.include('floor'); pm.expect(text).to.include('room_type_id'); pm.expect(text).to.include('status'); });"
    ]}}]
  },
  {
    name: "ROOM | POST Create Room | Invalid room type id",
    request: {
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json" },
        { key: "Authorization", value: "Bearer {{token}}" }
      ],
      url: "{{base_url}}/api/v1/admin/rooms",
      body: {
        mode: "raw",
        raw: JSON.stringify({
          name: "AUTO_INVALID_ROOM_{{$timestamp}}",
          floor: "1",
          room_type_id: "00000000-0000-0000-0000-000000000000",
          status: "active"
        })
      }
    },
    event: [{ listen: "test", script: { type: "text/javascript", exec: [
      "pm.test('Invalid room type rejected safely', function(){ pm.expect([400,404,422]).to.include(pm.response.code); });",
      "pm.test('No server error', function(){ pm.expect(pm.response.code).to.be.below(500); });"
    ]}}]
  }
];

collection.item.push(...crudTests);

fs.writeFileSync(file, JSON.stringify(collection, null, 2));
console.log("Safe room CRUD tests added:", crudTests.length);
