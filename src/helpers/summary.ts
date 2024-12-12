import { Page } from 'puppeteer';
import { PuppeteerService } from 'services/puppeteer/puppeteer.service';
import * as fs from 'fs';
import path from 'path';

interface ScreenshotConfig {
  readonly directory: string;
  readonly isDevelopment: boolean;
}

export class Summary {
  private readonly page: Page;
  private readonly screenshotConfig: ScreenshotConfig;

  constructor(private readonly browserService: PuppeteerService) {
    this.page = this.browserService.page;
    this.screenshotConfig = {
      directory: this.getScreenshotsDirectory(),
      isDevelopment: process.env.NODE_ENV === 'development',
    };
  }

  async summarizeContent(): Promise<string[]> {
    await this.submitContent();
    await this.waitForSummaryGeneration();
    return this.generateShortSummary();
  }

  async enterContent(content: string): Promise<void> {
    await this.page.keyboard.type(content);
    await this.captureScreenshot('content-entered');
  }

  private async submitContent(): Promise<void> {
    await this.captureScreenshot('before-submit');
    await this.page.click('[aria-label="Отправить"]');
    await this.captureScreenshot('after-submit');
  }

  private async waitForSummaryGeneration(): Promise<void> {
    await this.page.waitForSelector('div.summary-footer > div.row > div');
    await this.captureScreenshot('summary-generated');
  }

  private async generateShortSummary(): Promise<string[]> {
    await this.page.click('text/Кратко');
    const summaryContent = await this.extractSummaryText();
    await this.captureScreenshot('short-summary-generated');
    return summaryContent;
  }

  private async extractSummaryText(): Promise<string[]> {
    return this.page.$$eval('pre > p > span.text-wrapper', elements =>
      elements.map(
        element => element.textContent?.replace(/^[^a-zа-яё\d]+|[^a-zа-яё\d]+$/gi, '') || '',
      ),
    );
  }

  private async captureScreenshot(screenshotName: string): Promise<void> {
    if (!this.screenshotConfig.isDevelopment) {
      return;
    }

    try {
      await this.ensureScreenshotDirectoryExists();
      await this.saveScreenshot(screenshotName);
    } catch (error) {
      this.handleScreenshotError(error);
    }
  }

  private async ensureScreenshotDirectoryExists(): Promise<void> {
    try {
      await fs.promises.mkdir(this.screenshotConfig.directory, { recursive: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create screenshots directory: ${errorMessage}`);
    }
  }

  private async saveScreenshot(screenshotName: string): Promise<void> {
    const screenshotPath = path.join(this.screenshotConfig.directory, `${screenshotName}.png`);
    const screenshot = await this.browserService.takeScreenshot();
    await fs.promises.writeFile(screenshotPath, Buffer.from(screenshot.buffer));
  }

  private handleScreenshotError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Screenshot operation failed: ${errorMessage}`);
  }

  private getScreenshotsDirectory(): string {
    return path.join(process.cwd(), process.env.SCREENSHOTS_FOLDER || 'screenshots');
  }
}
