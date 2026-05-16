# Nova API Automation Suite

Generated from your Postman collection and environment.

## What is included

- `postman/Nova_API_Automation_Enhanced.postman_collection.json` — full enhanced suite for all 198 requests.
- `postman/Nova_API_Automation_Smoke.postman_collection.json` — fast read-safe smoke suite.
- `postman/Novas_QA_Partner.generated.postman_environment.json` — environment template with extra runtime variables.
- `reports/` — Newman HTML, JSON, and JUnit reports are written here.
- `docs/endpoint_inventory.csv` — endpoint inventory and mutation guard marker.

## Safety rules built into the collection

DELETE, PUT, and PATCH requests have a pre-request safety guard. By default, the request is blocked unless the target ID was created in the same Newman run and recorded in `createdIds`.

Do not set `safe_delete_mode=false` unless the backend database is disposable.

## Step-by-step local setup

### 1. Install Node.js
Install Node.js LTS from the official Node.js website. Then verify:

```bash
node -v
npm -v
```

### 2. Install dependencies
From this folder:

```bash
npm install
```

### 3. Configure environment
Open:

```text
postman/Novas_QA_Partner.generated.postman_environment.json
```

Set at minimum:

- `base_url` — QA API base URL, for example `https://qa.example.com`.
- `qa_admin_phone` and `qa_admin_password` if login credentials differ.

The original exported environment had empty values for runtime variables such as `base_url`, `token`, `refresh_token`, `branchId`, `roomTypeId`, `bookingId`, `discountId`, and `cancellationPolicyId`; this generated file keeps those variables and adds safe automation variables.

### 4. Run smoke tests first

```bash
npm run test:smoke
```

### 5. Run the full safe suite

```bash
npm run test:full
```

### 6. View reports

Open:

```text
reports/full-report.html
reports/smoke-report.html
```

JUnit XML is also generated for CI/CD tools.

## Recommended execution order

1. Authentication login.
2. Read-only lookup/master-data APIs: locales, regions, cities, banks, property types, branches, room types.
3. Creation APIs: booking, discount, cancellation policy, user listing, admin CRUD where request body is valid.
4. Read-back validation using IDs saved from create responses.
5. Update APIs only for same-run created IDs.
6. Delete cleanup only for same-run created IDs.

## Important notes

Some exported request bodies contain placeholders, comments, empty arrays, hardcoded IDs, local file paths, and sample values. The enhanced suite adds strong generic assertions and safety guards, but business-level assertions may need backend contract confirmation for each endpoint.

For file-upload APIs, replace local `src` paths with files that exist on your machine before running those cases.