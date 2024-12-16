import { Body, Controller } from '@nestjs/common';
import { SummaryService } from './text-summary.service';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { SummaryShortCreate, SummaryUrlShortCreate } from 'rabbit-mq-contracts';

@Controller()
export class RmqController {
  constructor(private readonly summary: SummaryService) { }

  @RMQValidate()
  @RMQRoute(SummaryShortCreate.topic)
  async getShortSummary(
    @Body() massageDto: SummaryShortCreate.Request,
  ): Promise<SummaryShortCreate.Response> {
    const res = await this.summary.getSummaryForText(massageDto.originalText);
    console.log(res);
    return {
      summary: res,
      messageId: massageDto.messageId,
    };
  }

  @RMQValidate()
  @RMQRoute(SummaryUrlShortCreate.topic)
  async getShortUrlSummary(
    @Body() massageDto: SummaryUrlShortCreate.Request,
  ): Promise<SummaryUrlShortCreate.Response> {
    const res = await this.summary.getSummaryForText(massageDto.url);
    console.log(res);
    return {
      summary: res,
      messageId: massageDto.messageId,
    };
  }
}
