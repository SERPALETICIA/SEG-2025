import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthGuard } from './guards/supabase.auth.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_URL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getOrThrow('SUPABASE_URL'),
    },
    {
      provide: 'SUPABASE_KEY',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getOrThrow('SUPABASE_KEY'),
    },
    {
      provide: 'SUPABASE_CLIENT',
      inject: ['SUPABASE_URL', 'SUPABASE_KEY'],
      useFactory: (url: string, key: string) => createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
        },
      }),
    },
    SupabaseService,
    SupabaseAuthGuard
  ],
  exports: ['SUPABASE_CLIENT', SupabaseService, SupabaseAuthGuard],
})
export class SupabaseModule { }