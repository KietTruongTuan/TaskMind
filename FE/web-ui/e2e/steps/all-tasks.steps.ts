import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "./shared.steps";

const STATUS_LABEL_TO_COLUMN_ID: Record<string, string> = {
  "To do": "ToDo",
  "In progress": "InProgress",
  "Completed": "Completed",
  "On hold": "OnHold",
  "Cancelled": "Cancelled",
  "Overdue": "Overdue",
};

When(
  'I drag {string} to {string} column',
  { timeout: 60000 },
  async function (this: CustomWorld, taskName: string, targetColumnLabel: string) {
    const page = this.page;

    const columnId = STATUS_LABEL_TO_COLUMN_ID[targetColumnLabel];
    if (!columnId) {
      throw new Error(
        `Unknown column label "${targetColumnLabel}". ` +
        `Valid labels: ${Object.keys(STATUS_LABEL_TO_COLUMN_ID).join(', ')}`
      );
    }

    const card = page
      .locator('[data-testid^="kanban-item-"]')
      .filter({ hasText: taskName })
      .first();
    await card.waitFor({ state: 'visible', timeout: 45000 });
    await card.scrollIntoViewIfNeeded();

    // Target the column by its data-testid to avoid matching status badge text
    const targetColumn = page.getByTestId(`${columnId}-column`);
    await targetColumn.waitFor({ state: 'visible', timeout: 45000 });

    // Get bounding boxes
    const cardBox = await card.boundingBox();
    if (!cardBox) throw new Error(`Cannot get bounding box for card "${taskName}"`);
    const columnBox = await targetColumn.boundingBox();
    if (!columnBox) throw new Error(`Cannot get bounding box for column "${targetColumnLabel}"`);

    // Drag from the top quarter of the card (task name text area) to avoid
    // the disabled StatusDropDown <button> child that sits in the centre
    const sourceX = cardBox.x + cardBox.width / 2;
    const sourceY = cardBox.y + cardBox.height * 0.25;
    const targetX = columnBox.x + columnBox.width / 2;
    const targetY = columnBox.y + columnBox.height / 2;

    // Position mouse and wait before pressing — gives dnd-kit time to mount
    await page.mouse.move(sourceX, sourceY);
    await page.waitForTimeout(100);

    await page.mouse.down();
    await page.waitForTimeout(100);

    // Small horizontal jolt so PointerSensor's activation distance is exceeded
    await page.mouse.move(sourceX + 5, sourceY, { steps: 5 });
    await page.waitForTimeout(200);

    // Glide to the target column centre in small steps
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      const x = sourceX + 5 + ((targetX - sourceX - 5) * i) / steps;
      const y = sourceY + ((targetY - sourceY) * i) / steps;
      await page.mouse.move(x, y, { steps: 1 });
      await page.waitForTimeout(30);
    }

    await page.mouse.up();

    // Wait for taskService.update() and Next.js router.refresh() to complete
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }
);

Then(
  '{string} status should be {string}',
  async function (this: CustomWorld, taskName: string, expectedStatusLabel: string) {
    const page = this.page;

    const columnHeader = page.getByText(expectedStatusLabel, { exact: true }).first();
    await columnHeader.waitFor({ state: 'visible', timeout: 45000 });

    const card = page
      .locator('[data-testid^="kanban-item-"]')
      .filter({ hasText: taskName })
      .first();

    await card.waitFor({ state: 'visible', timeout: 45000 });

    const statusBadge = card.getByTestId('status-dropdown');
    await expect(statusBadge).toContainText(expectedStatusLabel, { timeout: 45000 });
  }
);
