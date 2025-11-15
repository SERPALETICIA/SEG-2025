import { Injectable, Inject } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
    @Inject('SUPABASE_URL') private readonly supabaseUrl: string,
    @Inject('SUPABASE_KEY') private readonly supabaseKey: string,
  ) { }

  // client public sem auth do usuario
  get clientPublic(): SupabaseClient {
    return this.client;
  }

  //  cria um client autenticado com o token do user
  getClientForToken(token: string): SupabaseClient {
    return createClient(this.supabaseUrl, this.supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  }
}