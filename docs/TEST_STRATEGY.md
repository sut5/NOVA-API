# Nova API Test Strategy

## Scope
The source collection contains 198 requests: 95 GET, 47 POST, 27 PUT, 2 PATCH, and 27 DELETE.

## Test layers
1. Smoke: login plus read-only endpoints.
2. Contract: status codes, JSON format, response envelope, response time.
3. Dependency flow: create -> capture ID -> read -> update -> delete.
4. Negative validation: missing auth, invalid IDs, invalid body values, invalid enum values, pagination edge cases.
5. Cleanup: delete only same-run IDs.

## High-value scenarios to add once backend rules are confirmed
- Auth: valid login, invalid password, missing phone, refresh token rotation, logout invalidates token.
- Booking: available room booking, invalid date range, check-out before check-in, over-capacity, duplicate room/date overlap, unsupported currency, missing consent flags.
- Discount: percentage boundaries 0/100/101, fixed amount, start date after end date, expired/scheduled/active filtering.
- Cancellation policy: percentage/fixed fee validation, cutoff boundaries, inactive policies not offered.
- Admin master data: localized name object required, duplicate names rejected, status toggle, pagination and search.
- RBAC: customer cannot call admin endpoints; partner can only access owned branch data; super admin can access all.

## Data safety
Mutation requests are guarded. DELETE/PUT/PATCH are blocked unless the target ID exists in `createdIds` from the same run.