import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class AppService {
  getAppStatus () {
    return 'up';
  }

  async getDiskSize () {
    return new Promise((resolve, reject) => {
      try {
        exec(`df / -hP | awk '{if($1=="Filesystem")next;print "{\"size\":\""$2"\",","\"used\":\""$3"\",","\"available\":\""$4"\",","\"use\":\""$5"\"}"}'`, (error, stdout, stderr) => {
          if (error) {
            reject(stderr)
          } {
            try {
              resolve(JSON.parse(stdout))
            } catch (error) {
              reject(error)
            }
          }
        })
      } catch (error) {
        reject(error)
      }
    })

  }
  
}
