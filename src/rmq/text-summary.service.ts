import { Injectable } from '@nestjs/common';
import { PuppeteerService } from 'services/puppeteer/puppeteer.service';
import { OnModuleInit } from '@nestjs/common';
import { Authorization } from 'helpers/authorization';
import { Summary } from 'helpers/summary';

interface SummaryServices {
  summary: Summary;
  authorization: Authorization;
}

@Injectable()
export class SummaryService implements OnModuleInit {
  private static readonly SUMMARY_PAGE_URL = 'https://300.ya.ru/';
  private services: SummaryServices | null = null;

  constructor(private readonly browserService: PuppeteerService) {}

  async onModuleInit(): Promise<void> {
    await this.initializeServices();
  }

  async getSummaryForText(text: string): Promise<string[]> {
    this.validateServicesInitialization();
    
    try {
      await this.prepareBrowserForSummary();
      await this.processSummaryRequest(text);
      
      return await this.services!.summary.summarizeContent();
    } catch (error) {
      throw this.handleSummaryError(error);
    }
  }

  private async initializeServices(): Promise<void> {
    await this.browserService.initialize();
    
    this.services = {
      authorization: new Authorization(this.browserService),
      summary: new Summary(this.browserService)
    };
  }

  private validateServicesInitialization(): void {
    if (!this.services) {
      throw new Error('Text summary services are not properly initialized');
    }
  }

  private async prepareBrowserForSummary(): Promise<void> {
    await this.browserService.initialize();
    await this.browserService.navigateToPage(SummaryService.SUMMARY_PAGE_URL);
    await this.waitForPageLoad();
  }

  private async waitForPageLoad(): Promise<void> {
    await this.browserService.page.waitForFunction(
      () => document.readyState === 'complete'
    );
  }

  private async processSummaryRequest(text: string): Promise<void> {
    await this.services!.summary.enterContent(text);
    await this.services!.authorization.authorization();
  }

  private handleSummaryError(error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`Failed to generate text summary: ${errorMessage}`);
  }
}