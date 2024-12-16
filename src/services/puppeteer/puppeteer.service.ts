import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Cookie, Page } from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BrowserConfig } from './puppeteer.interface';

@Injectable()
export class PuppeteerService {
  private browser: Browser | null = null;
  private _page: Page | null = null;

  get page() {
    if (!this._page) {
      throw new Error('Browser page not initialized');
    }
    return this._page;
  }

  private static readonly CONFIG: BrowserConfig = {
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
      '--disable-dev-shm-usage'],
    defaultViewport: { width: 1080, height: 1024 },
  };

  private static readonly COOKIE_PATH = path.join(
    process.cwd(),
    process.env.COOKIE_FOLDER || 'cookies',
    'cookie.json',
  );

  async initialize(): Promise<void> {
    try {
      await this.initializeBrowser();
    } catch (error) {
      throw this.createError('initialization', error);
    }
  }

  async navigateToPage(url: string): Promise<void> {
    this.validatePageInitialized();
    await this.loadCookies();
    try {
      await this.page!.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
    } catch (error) {
      throw this.createError('page navigation', error);
    }
  }

  async closePage(): Promise<void> {
    this.validatePageInitialized();
    try {
      await this.saveCookies();
      await this.page!.close();
      this._page = null;
    } catch (error) {
      throw this.createError('page closing', error);
    }
  }

  async takeScreenshot(): Promise<Uint8Array> {
    this.validatePageInitialized();

    try {
      const screenshot = await this.page!.screenshot({
        fullPage: true,
        quality: 80,
        type: 'jpeg',
      });

      if (!screenshot) {
        throw new Error('Screenshot capture failed');
      }

      return screenshot;
    } catch (error) {
      throw this.createError('screenshot capture', error);
    }
  }

  private async initializeBrowser(): Promise<void> {
    if (this.browser && this.page) {
      return;
    }

    this.browser = await puppeteer.launch({
      headless: PuppeteerService.CONFIG.headless,
      args: PuppeteerService.CONFIG.args,
    });

    this._page = await this.browser.newPage();
    await this.page.setViewport(PuppeteerService.CONFIG.defaultViewport);
  }

  private async loadCookies(): Promise<void> {
    try {
      const cookieData = await fs.readFile(PuppeteerService.COOKIE_PATH, 'utf-8');
      const cookies = JSON.parse(cookieData) as Cookie[];

      this.validatePageInitialized();
      await this.page!.setCookie(...cookies);
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return;
      }
      throw this.createError('cookie loading', error);
    }
  }

  async saveCookies(): Promise<void> {
    try {
      this.validatePageInitialized();
      await this.ensureCookieFolderExists();
      const cookies = await this.page!.cookies();
      await fs.writeFile(PuppeteerService.COOKIE_PATH, JSON.stringify(cookies, null, 2));
    } catch (error) {
      throw this.createError('cookie saving', error);
    }
  }
  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.saveCookies();
      }
      await this.browser?.close();
    } finally {
      this._page = null;
      this.browser = null;
    }
  }

  private validatePageInitialized(): void {
    if (!this.page) {
      throw new Error('Browser page not initialized');
    }
  }

  private createError(operation: string, error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`Failed during ${operation}: ${message}`);
  }

  private isFileNotFoundError(error: unknown): boolean {
    return (error as NodeJS.ErrnoException).code === 'ENOENT';
  }

  private async ensureCookieFolderExists(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(PuppeteerService.COOKIE_PATH), { recursive: true });
    } catch (error) {
      throw this.createError('cookie folder creation', error);
    }
  }
}
