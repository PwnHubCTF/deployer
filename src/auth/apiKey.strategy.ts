import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private authService: AuthService) {
        super({ header: 'X-API-KEY', prefix: '' }, true, (apikey, done, req) => {
            return done(authService.validateApiKey(apikey));
        });
    }
}