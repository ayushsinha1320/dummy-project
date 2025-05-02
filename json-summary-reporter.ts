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

    const outputPath = path.join(__dirname, 'test-summary.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonReport, null, 2), 'utf-8');
    console.log(`✅ Test summary written to ${outputPath}`);
  }
}

export default JsonSummaryReporter;
