import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';
import { exec } from 'child_process';

const logger = new Logger("DestroyProcessor");

export default async function (job: Job, cb: DoneCallback) {
  /*
   * job.data ->
   * {
        owner: string -> ID of the user who want to destroy the chall 
   * }
   */
  logger.debug(`[${process.pid}] ${JSON.stringify(job.data)}`);


  if (job.data.projectName) {
    await removeDockerProject(job.data.projectName)
    cb(null, "destroyed");
  }
  else { cb(new Error('Unable to destroy the challenge. projectName not found')); }
}

async function removeDockerProject (projectName) {
  const ids = (await customExec(`docker ps -a --filter label="com.docker.compose.project=${projectName}" -q`)).split('\n').filter(c => c != '')

  for (const id of ids) {
    const cmd = `docker rm -f ${id}`
    await customExec(cmd)
  }
  return true
}

function customExec (cmd, cwd?): Promise<string> {
  return new Promise((resolve, reject) => {
    exec((cmd), { cwd: cwd }, (error, stdout, stderr) => {
      // console.log('error:  ', error, 'stdout: ', stdout, 'stderr: ', stderr);
      if (error) {
        reject(new Error(`error: ${error.message}`));
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  })
}