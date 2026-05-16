const fs = require('fs');
const path = require('path');

const reports = [
  { name: 'Auth Report', file: 'auth-report.html' },
  { name: 'Branch Report', file: 'branch-report.html' },
  { name: 'Room Report', file: 'room-report.html' },
  { name: 'Room Type Report', file: 'roomtype-report.html' },
  { name: 'Booking Report', file: 'booking-report.html' },
  { name: 'Discount Report', file: 'discount-report.html' },
  { name: 'Cancellation Report', file: 'cancellation-report.html' },
  { name: 'Amenities Report', file: 'amenities-report.html' },
  { name: 'Guests Report', file: 'guests-report.html' },
  { name: 'Ratings Report', file: 'ratings-report.html' },
  { name: 'Users Report', file: 'users-report.html' },
  { name: 'RBAC Report', file: 'rbac-report.html' },
  { name: 'Partner Property Report', file: 'partner-property-report.html' },
  { name: 'Payments Report', file: 'payments-report.html' },
  { name: 'Security Report', file: 'security-report.html' }
];

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Novas Automation Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: white;
      padding: 40px;
    }

    h1 {
      margin-bottom: 30px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .card {
      background: #1e293b;
      border-radius: 12px;
      padding: 20px;
      transition: 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      background: #334155;
    }

    a {
      color: #38bdf8;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
    }

    p {
      margin-top: 10px;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <h1>Novas API Automation Dashboard</h1>

  <div class="grid">
    ${reports.map(r => `
      <div class="card">
        <a href="./${r.file}" target="_blank">${r.name}</a>
        <p>Open detailed regression execution report.</p>
      </div>
    `).join('')}
  </div>
</body>
</html>
`;

const outputPath = path.join(__dirname, '..', 'reports', 'dashboard.html');
fs.writeFileSync(outputPath, html);
console.log('Combined dashboard generated successfully at reports/dashboard.html');
