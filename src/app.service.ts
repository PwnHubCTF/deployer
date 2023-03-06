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
        exec(`df -hP | awk 'BEGIN {printf"{\"discarray\":["}{if($1=="Filesystem")next;if(a)printf",";printf"{\"mount\":\""$6"\",\"size\":\""$2"\",\"used\":\""$3"\",\"avail\":\""$4"\",\"use%\":\""$5"\"}";a++;}END{print"]}";}'`, (error, stdout, stderr) => {
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
