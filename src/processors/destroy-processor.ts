import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';

const logger = new Logger("DestroyProcessor");

export default async function (job: Job, cb: DoneCallback) {
  /*
   * job.data ->
   * {
        owner -> ID of the user who want to destroy the chall 
   * }
   */
  logger.debug(`[${process.pid}] ${JSON.stringify(job.data)}`);


  cb(null, "destroyed");
}
