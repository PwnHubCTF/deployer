import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { InstanceSingleModule } from "src/instance-single/instance-single.module";
import { InstancesModule } from "src/instances/instances.module";
import { BuildEventsGateway } from "./build-events.gateway";
import { WsGuard } from "./ws.guard";

@Module({
    providers: [BuildEventsGateway, WsGuard],
    imports: [AuthModule, InstanceSingleModule, InstancesModule]
})
export class BuildEventsModule { }