import report from "multiple-cucumber-html-reporter";
import fs from "fs-extra";

fs.removeSync("./reports/features");

report.generate({
  jsonDir: "reports",
  reportPath: "./reports",
  reportName: "Automation Test Report",
  pageTitle: "TaskMind test report",
  displayDuration: false,
  metadata: {
    browser: {
      name: "chrome",
      version: "112",
    },
    device: "PC",
    platform: {
      name: "Windows",
      version: "11",
    },
  },
  customData: {
    title: "Test Info",
    data: [
      { label: "Project", value: "TaskMind Application" },
      { label: "Release", value: "1.2.3" },
      { label: "Cycle", value: "Smoke-1" },
    ],
  },
});
