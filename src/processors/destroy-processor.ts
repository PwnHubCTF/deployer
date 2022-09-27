import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';

const logger = new Logger("DestroyProcessor");

export default async function (job: Job, cb: DoneCallback) {
  /*
   * job.data ->
   * {
        owner: string -> ID of the user who want to destroy the chall 
   * }
   */
  logger.debug(`[${process.pid}] ${JSON.stringify(job.data)}`);

  if (job.data.owner) { cb(null, "destroyed"); }
  else { cb(new Error('Unable to destroy the challenge. Owner not found')); }
}
