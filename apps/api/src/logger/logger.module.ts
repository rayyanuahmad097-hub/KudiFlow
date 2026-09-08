import { Module, Global } from '@nestjs/common';
import { KudiFlowLogger } from './logger.service';

@Global()
@Module({
  providers: [KudiFlowLogger],
  exports: [KudiFlowLogger],
})
export class LoggerModule {}
