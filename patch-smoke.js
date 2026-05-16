const fs = require("fs");

const file = "postman/Nova_API_Automation_Smoke.postman_collection.json";
const collection = JSON.parse(fs.readFileSync(file, "utf8"));

function walk(items) {
  for (const item of items || []) {
    for (const event of item.event || []) {
      if (event.script && Array.isArray(event.script.exec)) {
        event.script.exec = event.script.exec.map(line =>
          line
            .replace(/\b(const|let)\s+data\s*=/g, "var data =")
            .replace(/\b(const|let)\s+res\s*=/g, "var res =")
            .replace(/\b(const|let)\s+response\s*=/g, "var response =")
        );
      }
    }
    walk(item.item);
  }
}

walk(collection.item);
fs.writeFileSync(file, JSON.stringify(collection, null, 2));
console.log("Smoke collection scripts patched successfully");
