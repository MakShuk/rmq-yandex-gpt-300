import { Page } from 'puppeteer';
import { PuppeteerService } from 'services/puppeteer/puppeteer.service';
import * as fs from 'fs';
import { rm, mkdir } from 'node:fs/promises';
import path from 'path';

export class Authorization {
  page: Page;
  constructor(private readonly browser: PuppeteerService) {
    this.page = this.browser.page;
  }

  private static readonly SCREENSHOTS_FOLDER = path.join(
    process.cwd(),
    process.env.SCREENSHOTS_FOLDER || 'screenshots',
  );

  async authorization(): Promise<void> {
    try {
      if (await this.isAuthorization(this.page)) {
        return;
      } else {

        await this.clearDirectory();

        await this.acceptCookies();
        await this.takeScreenshotAndSave('1.acceptCookies');

        await this.login();
        await this.takeScreenshotAndSave('2.login');
        await this.browser.page.waitForFunction(() => document.readyState === 'complete');
        await this.delay(2000);

        await this.setLogin(process.env.YA_LOGIN || '');
        await this.takeScreenshotAndSave('3.setLogin');
        await this.delay(2000);

        await this.login();
        await this.takeScreenshotAndSave('4.login2');
        await this.delay(2000);

        await this.setPassword(process.env.YA_PASSWORD || '');
        await this.takeScreenshotAndSave('5.setPassword');

        await this.final();
        await this.takeScreenshotAndSave('6.final');

        await this.delay(2000);
        await this.takeScreenshotAndSave('7.result');
        await this.browser.cleanup();
      }
    } catch (error) {
      await this.takeScreenshotAndSave('error');
      console.error('An error occurred:', error);
      await this.browser.cleanup();
    }
  }

  private async acceptCookies() {
    try {
      await this.page.focus('text/Allow all');
      await this.page.keyboard.press('Enter');
    } catch (error) {
      console.log(`error: ${error}`);
    }
  }

  private async login() {
    await this.page.focus('text/Войти');
    await this.page.keyboard.press('Enter');
  }

  private async setLogin(login: string) {
    const inputSelector = 'input[placeholder="Логин или email"]';
    await this.page.focus(inputSelector);
    await this.page.keyboard.type(login);
  }

  private async setPassword(password: string) {
    const inputSelector = 'input[placeholder="Введите пароль"]';
    await this.page.focus(inputSelector);
    await this.page.keyboard.type(password);
  }

  private async final() {
    await this.page.focus('text/Продолжить');
    await this.page.keyboard.press('Enter');
  }

  private async isAuthorization(page: Page): Promise<boolean> {
    try {
      const inputSelector = `a.avatar-link.svelte-rymmbg`;
      await page.focus(inputSelector);
      await this.takeScreenshotAndSave('check-authorization');
      return true;
    } catch (error) {
      return false;
    }
  }

  private async takeScreenshotAndSave(screenshotName: string): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const screenshotsDir = Authorization.SCREENSHOTS_FOLDER;

      // Проверяем и создаем директорию
      try {
        await fs.promises.mkdir(screenshotsDir, { recursive: true });
      } catch (error) {
        console.error('Error creating screenshots directory:', error);
        throw error;
      }

      const screenshotPath = `${screenshotsDir}/${screenshotName}.png`;

      try {
        const screenshot = await this.browser.takeScreenshot();
        const buffer = Buffer.from(screenshot.buffer);
        await fs.promises.writeFile(screenshotPath, buffer);
      } catch (error) {
        console.error('Error taking or saving screenshot:', error);
        throw error;
      }
    }
  }

  private async clearDirectory(): Promise<void> {
    try {
      const screenshotsDir = Authorization.SCREENSHOTS_FOLDER;
      await rm(screenshotsDir, { recursive: true, force: true });
      await mkdir(screenshotsDir, { recursive: true });
    } catch (error) {
      console.error('Ошибка при очистке директории:', error);
      throw error;
    }
  }

  private async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
