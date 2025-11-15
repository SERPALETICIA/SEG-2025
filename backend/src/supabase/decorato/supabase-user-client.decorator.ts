import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

export const SupabaseUserClient = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SupabaseClient | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.supabase ?? null;
  },
);