//backend/src/supabase/decorators/supabase-access-token.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

export const SupabaseAccessToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SupabaseClient | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.accessToken ?? null;
  },
);



