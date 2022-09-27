import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';

const logger = new Logger("BuildProcessor");

export default async function (job: Job, cb: DoneCallback) {
  /*
 * job.data ->
 * {
      githubUrl: string -> repo and path of the challenge to deploy
      owner: string -> ID of the user who deploy the chall (unique, a user can't deploy multiple challenges)
      team: string -> ID of the team who deploy the chall
 * }
 */
  logger.debug(`[${process.pid}] ${JSON.stringify(job.data)}`);




  cb(null, {
    port: 5280
  });
}
