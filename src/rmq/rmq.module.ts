import { Module } from '@nestjs/common';

import { RmqController } from './rmq.controller';
import { PuppeteerService } from 'services/puppeteer/puppeteer.service';
import { SummaryService } from './text-summary.service';


@Module({
  controllers: [RmqController],
  providers: [SummaryService, PuppeteerService],
})
export class RmqModule {}
