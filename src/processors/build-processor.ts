import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { mkdir } from 'fs/promises';
import { fromUrl } from "hosted-git-info"
import { simpleGit, SimpleGit } from 'simple-git';
import { parse } from 'yaml'
var fs = require('fs');

require('dotenv').config()

const logger = new Logger("BuildProcessor");

export default async function (job: Job, cb: DoneCallback) {
  /*
 * job.data ->
 * {
      githubUrl: string -> repo and path of the challenge to deploy. ex: https://github.com/PwnHubCTF/challenges/tree/main/prog/nop
      owner: string -> ID of the user who deploy the chall (unique, a user can't deploy multiple challenges)
      team: string -> ID of the team who deploy the chall
 * }
 */
  logger.debug(`[${process.pid}] ${JSON.stringify(job.data)}`);

  // Download the project from github
  job.progress('cloning')
  const projectPath = await getFromGithub(job)

  // Parse config file
  if (!fs.existsSync(`${projectPath}/config.yaml`)) throw new Error("config.yaml not found in project")

  const configFile = parse(fs.readFileSync(`${projectPath}/config.yaml`, 'utf8'))
  console.log(configFile);

  // Parse config

  // Build docker
  job.progress('building')



  cb(new Error('test'))
  // Return the port of the deployed challenge
  // cb(null, {
  //   port: 5280
  // });
}

interface GithubInfos {
  domain: string,
  treepath: string,
  editpath: string,
  type: string,
  user: string,
  project: string,
  committish: string,
  default: string,
  projectPath: string,
  url: string,
}
/*
  * Infos example:
  {
    domain: 'github.com',
    treepath: 'tree',
    editpath: 'edit',
    type: 'github',
    user: 'PwnHubCTF',
    project: 'challenges',
    committish: 'main',
    default: 'https',
    projectPath: 'prog/nop',
    url: 'https://github.com/PwnHubCTF/challenges'
  }
  */

function getInfosfromUrl (url): GithubInfos {
  let infos = fromUrl(url)
  if (!infos.treepath) throw new Error('Invalid project path')
  if (!infos.committish) throw new Error('Invalid project path')
  // Get the challenge path, from Github Url. ex: prog/nop
  let projectPath = url.split('/')
  infos.projectPath = projectPath.slice(projectPath.indexOf(infos.committish) + 1).join('/')
  infos.url = projectPath.slice(0, projectPath.indexOf(infos.committish) - 1).join('/')

  return infos
}

async function createDocker (githubUrl: string, src: string) {
  try {
    // Get infos from repository URL
    let infos = fromUrl(githubUrl)

    let path = `${__dirname}/projects/${infos.user}/${infos.project}`
    // Create folders
    let res = await mkdir(path, { recursive: true })
    // If a folder is created, it means project doesn't exists. We have to clone it
    if (res) {
      console.log('New project added', path, githubUrl)
      await systemGitPartialClone(path, githubUrl)
    }
    // checkout target folder
    console.log('Checkout folder', src);
    let cc = await systemGitCheckoutFolder(path, src)
    console.log(cc);


    let dockerComposeFile = 'test'
    // Create project
    // let output = await systemDockerCompose(dockerComposeFile, payload.projectName)
    // console.log(output);
    return infos
  } catch (error) {
    return error.message
  }
}

function executeDockerCompose (dockercomposePath) {
  exec(`docker-compose up -f ${dockercomposePath} -d`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

/**
 * 
 * @param path Path to the challenge in repo. Ex: "tree/main/prog/nop"
 * @param url Url of gihub repo. Ex: "https://github.com/PwnHubCTF/challenges" 
 */
async function systemGitPartialClone (path, url) {
  let connectUrl = `https://${process.env.GITHUB_TOKEN}@${url.slice(8)}.git`
  const cmd = `
      git clone \
      --depth 1  \
      --filter=blob:none \
      --sparse \
      ${connectUrl} \
      ${path};  
  `
  console.log(cmd);

  return await customExec(cmd)
}

/**
 * 
 * @param path Path to the challenge in repo. Ex: "tree/main/prog/nop"
 * @param url Url of gihub repo. Ex: "https://github.com/PwnHubCTF/challenges" 
 */
function systemGitCheckoutFolder (path, src) {
  const cmd = `git sparse-checkout set ${src}`
  return customExec(cmd, path)
}

function systemDockerCompose (file, projectName) {
  const cmd = `docker-compose -f ${file} --project-name ${projectName} up -d`

  return new Promise((resolve, reject) => {
    // docker-compose is always logging to STDERR. Can't use customExec
    exec((cmd), (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`error: ${error.message}`));
        return;
      }
      if (stderr.includes('error')) {
        reject(new Error(`stderr: ${stderr}`));
      } else {
        resolve(stderr)
      }
    });
  })
}


function customExec (cmd, cwd?) {
  return new Promise((resolve, reject) => {
    exec((cmd), { cwd: cwd }, (error, stdout, stderr) => {
      console.log('error: ', error, 'stdout: ', stdout, 'stderr: ', stderr);
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


function systemGetDockerProject (projectName) {
  const cmd = `docker container ls --filter label="com.docker.compose.project=${projectName}"`
  return customExec(cmd)
}

async function getFromGithub (job: Job) {
  // Get git infos from Github Url
  let infos = getInfosfromUrl(job.data.githubUrl)

  // Path where the project will be cloned
  let path = `${__dirname}/../cloned_repositories/${infos.user}/${infos.projectPath.split('/').join('-')}`

  // Create directory for the project
  let res = await mkdir(path, { recursive: true })

  // Setup github module from infos
  const git: SimpleGit = simpleGit(path, { config: ['core.sparsecheckout=true'] });


  // If res, a dir has been created -> project doesn't exists and need to be setup
  if (res) {
    // Set remote
    job.progress('cloning.init')
    await git.init()
    await git.addRemote('origin', `https://${process.env.GITHUB_TOKEN}@${infos.url.slice(8)}.git`)
  } else {
    job.progress('cloning.fetch')
    // Else, just fetch the repo to update it
    await git.fetch()
  }

  // Sparse checkout -> clone only the folder we need
  await customExec(`echo ${infos.projectPath}/ > ${path}/.git/info/sparse-checkout`)

  // Pull project
  job.progress('cloning.pull')
  await git.pull('origin', infos.committish)

  return `${path}/${infos.projectPath}`
}
