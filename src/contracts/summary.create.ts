import { IsNotEmpty, IsNumber, IsString, IsUrl, MinLength } from 'class-validator';

export namespace SummaryShortCreate {
  export const topic = 'summary.short.query';

  export class Request {
    @IsNumber()
    @IsNotEmpty()
    // @ts-ignore
    messageId: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(300, {
      message: 'Text to summarize must be at least 300 characters long',
    })
    // @ts-ignore
    originalText: string;
  }

  export class Response {
    @IsNotEmpty()
    @IsString({ each: true })
    // @ts-ignore
    summary: string[];

    @IsNumber()
    // @ts-ignore
    messageId: number;
  }
}

export namespace SummaryUrlShortCreate {
  export const topic = 'summary.url-short.query';

  export class Request {
    @IsNumber()
    @IsNotEmpty()
    // @ts-ignore
    messageId: number;

    @IsUrl()
    @IsNotEmpty()

    // @ts-ignore
    url: string;
  }

  export class Response {
    @IsNotEmpty()
    @IsString({ each: true })
    // @ts-ignore
    summary: string[];

    @IsNumber()
    // @ts-ignore
    messageId: number;
  }
}
