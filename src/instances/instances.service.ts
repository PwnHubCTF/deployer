import { InjectQueue } from '@nestjs/bull';
import { HttpException, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { LessThanOrEqual, Repository } from 'typeorm';
import { DeployInstanceDto } from './dto/deploy-instance.dto';
import { SetDestroyCooldownDto } from './dto/set-destroy-cooldown.dto';
import { InstanceMultiple } from './entities/instance-multiple.entity';

@Injectable()
export class InstancesService {
    constructor(
        @InjectQueue('destroy') private destroyQueue: Queue,
        @InjectQueue('build') private buildQueue: Queue,
        @InjectRepository(InstanceMultiple) private readonly instanceRepository: Repository<InstanceMultiple>,
    ) { }


    async getInstances () {
        return await this.getInstancesAndQueues()
    }
    
    async getInstancesFromChallengeId (id: string) {
        return await this.getInstancesAndQueues({ challengeId: id })
    }

    async getInstanceFromOwnerAndChallenge (owner_id: string, challenge_id: string) {
        return await this.getInstancesAndQueues({ challengeId: challenge_id, owner: owner_id })
    }

    async getInstancesFromOwner (id: string) {
        return await this.getInstancesAndQueues({ owner: id })
    }

    async getInstancesAndQueues (search?: any) {
        const instances = await this.instanceRepository.find({ where: search })
        let inBuild = await this.buildQueue.getJobs(['active', 'waiting'])
        let inDestroy = await this.destroyQueue.getJobs(['active', 'waiting'])

        if(search?.challengeId){
            inBuild = inBuild.filter(j => j.data.challengeId == search.challengeId)
            inDestroy = inDestroy.filter(j => j.data.challengeId == search.challengeId)
        }

        if(search?.owner){
            inBuild = inBuild.filter(j => j.data.owner == search.owner)
            inDestroy = inDestroy.filter(j => j.data.owner == search.owner)
        }
        
        return [...instances, ...[...inBuild, ...inDestroy].map(j => { return { ...j.data, progress: j.progress() } })]
    }

    async destroyInstance (id: string) {
        let instance = await this.instanceRepository.findOne({ where: { id } })
        if (!instance) throw new HttpException("Instance undefined", 404)

        let activeJobs = await this.destroyQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.instanceId === id).length
        if (activeJobsCount >= 1) throw new HttpException("This instance is already being destroyed. Please wait few minutes", 403)

        let waitingJobs = await this.destroyQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.instanceId === id).length
        if (waitingJobsCount >= 1) throw new HttpException('This instance is already being destroyed. Please wait few minutes (in queue)', 403)

        // destroy task
        await this.destroyQueue.add({
            projectName: instance.composeProjectName,
            instanceId: id
        })
        return { "status": "Destroy enqueued" }
    }

    async createInstance (payload: DeployInstanceDto) {
        if(!payload.challengeId || !payload.githubUrl || !payload.owner) throw new HttpException("Missing informations", 403)

        let currentChallengeInstances = await this.instanceRepository.find({ where: { owner: payload.owner, challengeId: payload.challengeId} })
        if (currentChallengeInstances.length >= 1) throw new HttpException("You already have an instance of this challenge deployed", 403)

        let activeChallengeJobs = await this.buildQueue.getJobs(['active'])
        let activeChallengeJobsCount = activeChallengeJobs.filter(j => j.data.owner === payload.owner && j.data.challengeId === payload.challengeId).length
        if (activeChallengeJobsCount >= 1) throw new HttpException("You already have an instance of this challenge in build", 403)


        let waitingChallengeJobs = await this.buildQueue.getJobs(['waiting'])
        let waitingChallengeJobsCount = waitingChallengeJobs.filter(j => j.data.owner === payload.owner && j.data.challengeId === payload.challengeId).length
        if (waitingChallengeJobsCount >= 1) throw new HttpException("You already have a build of this challenge in queue", 403)


        return await this.buildQueue.add({
            owner: payload.owner,
            githubUrl: payload.githubUrl,
            challengeId: payload.challengeId,
            customEnv: payload.customEnv
        })
    }

    async getInstancesCountForOwner(owner: string){
        let currentInstances = await this.instanceRepository.find({ where: { owner: owner} })

        let activeJobs = await this.buildQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.owner === owner).length


        let waitingJobs = await this.buildQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.owner === owner).length

        return currentInstances.length + waitingJobsCount + activeJobsCount
    }

    async setDestroyCooldown(id: string, payload: SetDestroyCooldownDto){
        const instance = await this.instanceRepository.findOne({ where: { id } })
        if (!instance) throw new HttpException("Instance undefined", 404)

        instance.destroyAt = new Date(Date.now() + payload.cooldown * 1000)
        return await instance.save()
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cleanupInstances() {
        const expireds = await this.instanceRepository.find({
            where: {
                destroyAt: LessThanOrEqual(new Date())
            }
        })
        for(const i of expireds) this.destroyInstance(i.id)
    }
}

