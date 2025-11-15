import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import type { SupabaseClientRequest } from '../types/supabase-client-request.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) { }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<SupabaseClientRequest>();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (token) {
      request.supabase = this.supabase.getClientForToken(token);
      return true
    }

    throw new UnauthorizedException();
  }
}
