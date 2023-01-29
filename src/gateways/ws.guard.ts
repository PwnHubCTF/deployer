import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class WsGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext) {
        const client = context.switchToWs().getClient();
        let key = client.handshake.headers['x-api-key']
        return await this.authService.validateApiKey(key);
    }
}