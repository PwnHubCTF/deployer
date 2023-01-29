import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  ConnectedSocket
} from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'socket.io';
import { DeployAdminInstanceDto } from 'src/instance-single/dto/deploy-admin-instance.dto';
import { InstanceSingleService } from 'src/instance-single/instance-single.service';
import { DeployInstanceDto } from 'src/instances/dto/deploy-instance.dto';
import { InstancesService } from 'src/instances/instances.service';
import { WsGuard } from './ws.guard';

@UseGuards(WsGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BuildEventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private instanceSingleService: InstanceSingleService,
    private instanceService: InstancesService,
  ) { }



  @SubscribeMessage('build')
  async build (@MessageBody() data: DeployInstanceDto, @ConnectedSocket() socket: Socket) {
    try {
      const job = await this.instanceService.createInstance(data)
      while (!await job.isCompleted()) {
        await new Promise(r => setTimeout(r, 500));
        socket.emit("progress", await job.progress())
      }
      socket.emit("progress", 'completed')
    } catch (error) {
      throw new WsException(error.message)
    }
  }

  @SubscribeMessage('build-admin')
  async buildAdmin (@MessageBody() data: DeployAdminInstanceDto, @ConnectedSocket() socket: Socket) {
    try {
      const job = await this.instanceSingleService.createAdminInstance(data)
      while (!await job.isCompleted()) {
        await new Promise(r => setTimeout(r, 500));
        socket.emit("progress", await job.progress())
      }
      socket.emit("progress", 'completed')
    } catch (error) {
      throw new WsException(error.message)
    }
  }
}
