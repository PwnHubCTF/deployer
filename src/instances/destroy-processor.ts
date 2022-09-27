import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';

const logger = new Logger("DestroyProcessor");

export default async function (job: Job, cb: DoneCallback) {
  logger.debug(`[${process.pid}] ${JSON.stringify(job.data)}`);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  await delay(2000)
  cb(null, "destroyed");
}
