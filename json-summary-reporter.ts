import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

class JsonSummaryReporter implements Reporter {
  private results: { testName: string; status: string }[] = [];
  private summary = { total: 0, passed: 0, failed: 0, skipped: 0 };

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    this.results.push({ testName: test.title, status });

    this.summary.total++;
    if (status === 'passed') this.summary.passed++;
    else if (status === 'failed') this.summary.failed++;
    else if (status === 'skipped') this.summary.skipped++;
  }

  async onEnd(result: FullResult) {
    const jsonReport = {
      tests: this.results,
      summary: this.summary
    };

    const jsonOutputPath = path.join(__dirname, 'test-summary.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonReport, null, 2), 'utf-8');
    console.log(`✅ Test summary written to ${jsonOutputPath}`);

    // Generate HTML report from the JSON summary
    await this.generateHtmlReport(jsonReport);
  }

  private async generateHtmlReport(jsonReport: { tests: { testName: string; status: string }[]; summary: { total: number; passed: number; failed: number; skipped: number } }) {
    // Initialize HTML content with header and summary details
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Test Summary Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          background-color: white;
          border: 1px solid #ccc;
          width: 600px;
          margin: auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #512b8b;
          color: white;
          padding: 10px 20px;
          font-size: 20px;
          font-weight: bold;
        }
        .content {
          padding: 20px;
        }
        .content p {
          margin: 5px 0;
        }
        .label {
          font-weight: bold;
        }
        .green { color: green; }
        .red { color: red; }
        .orange { color: orange; }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th {
          background-color: #512b8b;
          color: white;
          padding: 10px;
        }
        .table td {
          padding: 10px;
          border-top: 1px solid #ccc;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Test Summary</div>
        <div class="content">
          <p><span class="label">Total Tests:</span> ${jsonReport.summary.total}</p>
          <p>
            <span class="label green">Passed:</span> ${jsonReport.summary.passed} &nbsp;
            <span class="label red">Failed:</span> ${jsonReport.summary.failed} &nbsp;
            <span class="label orange">Skipped:</span> ${jsonReport.summary.skipped}
          </p>
          <table class="table">
            <tr>
              <th>Test Case</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>`;

    // Loop through the test results and populate the table rows
    jsonReport.tests.forEach(test => {
      let statusClass = 'green'; // Default to passed
      if (test.status === 'failed') statusClass = 'red';
      else if (test.status === 'skipped') statusClass = 'orange';

      htmlContent += `
      <tr>
        <td>${test.testName}</td>
        <td class="${statusClass}">${test.status}</td>
        <td>0.00</td> <!-- Assuming no duration is available -->
      </tr>`;
    });

    htmlContent += `
          </table>
        </div>
      </div>
    </body>
    </html>`;

    // Write the HTML content to a file
    const htmlOutputPath = path.join(__dirname, 'report.html');
    fs.writeFileSync(htmlOutputPath, htmlContent, 'utf-8');
    console.log(`✅ HTML report written to ${htmlOutputPath}`);
  }
}

export default JsonSummaryReporter;
