import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

// Интерфейс для конфигурации RabbitMQ
interface RMQConfig {
  exchangeName: string;
  login: string;
  password: string;
  host: string;
  queueName: string;
  prefetchCount: number;
  serviceName: string;
}

// Константы для значений по умолчанию
const DEFAULT_CONFIG = {
  PREFETCH_COUNT: 32,
  SERVICE_NAME: 'summary',
  DURABLE: true,
} as const;

// Функция для получения конфигурации
const getConfiguration = (configService: ConfigService): RMQConfig => ({
  exchangeName: configService.get('AMQP_EXCHANGE') ?? '',
  login: configService.get('AMQP_USER') ?? '',
  password: configService.get('AMQP_PASSWORD') ?? '',
  host: configService.get('AMQP_HOSTNAME') ?? '',
  queueName: configService.get('AMQP_QUEUE') ?? '',
  prefetchCount:
    configService.get('AMQP_PREFETCH_COUNT') ?? DEFAULT_CONFIG.PREFETCH_COUNT,
  serviceName:
    configService.get('AMQP_SERVICE_NAME') ?? DEFAULT_CONFIG.SERVICE_NAME,
});

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const config = getConfiguration(configService);

    return {
      exchangeName: config.exchangeName,
      connections: [
        {
          login: config.login,
          password: config.password,
          host: config.host,
        },
      ],
      queueName: config.queueName,
      durable: DEFAULT_CONFIG.DURABLE,
      prefetchCount: config.prefetchCount,
      serviceName: config.serviceName,
    };
  },
});
