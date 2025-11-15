import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { type AuthDTO } from './dtos/auth.dto'
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthGuard } from 'src/supabase/guards/supabase.auth.guard';
import { SupabaseUserClient } from 'src/supabase/decorato/supabase-user-client.decorator';
import { SupabaseAccessToken } from 'src/supabase/decorato/supabase-access-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // se o usuário tiver MFA ativo retorna factorId e pede o código.
  // caso contrário, retorna token e login completo.
  @Post('login')
  login(@Body() dto: AuthDTO) {
    return this.authService.login(dto)
  }

  // usa o factorId e o código TOTP digitado pelo usuário - 6 dígitos
  // retorna o token de sessão e marca o MFA como validado.
  @Post('mfa/verify')
  @UseGuards(SupabaseAuthGuard)
  verifyMfa(
    @SupabaseUserClient() supabase: SupabaseClient,
    @Body() body: { factorId: string; code: string }
  ) {
    return this.authService.verifyMfa(body.factorId, body.code, supabase)
  }

  // cria um novo fator TOTP e retorna QR Code(base64), secret (para apps autenticadores), factorId (para usar no verify)
  @Post('mfa/enroll')
  @UseGuards(SupabaseAuthGuard)
  enrollMfa(
    @SupabaseAccessToken() accessToken: string,
    @SupabaseUserClient() supabase: SupabaseClient
  ) {
    return this.authService.configure(accessToken, supabase)
  }

  // Desativa o MFA do usuário e limpa o estado no banco.
  @Delete('mfa/unenroll')
  @UseGuards(SupabaseAuthGuard)
  unenrollMfa(
    @Body() body: { factorId: string },
    @SupabaseAccessToken() accessToken: string,
    @SupabaseUserClient() supabase: SupabaseClient
  ) {
    return this.authService.unenrollMfa(body.factorId, accessToken, supabase)
  }

  @Get('mfa/factors')
  @UseGuards(SupabaseAuthGuard)
  async listMfaFactors(
    @SupabaseUserClient() supabase: SupabaseClient
  ) {
    return this.authService.listMfaFactors(supabase)
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getSupabaseUser(
    @SupabaseAccessToken() accessToken: string, // @Req() req: Express.Request,
    @SupabaseUserClient() supabase: SupabaseClient
  ) {
    return this.authService.getSupabaseUser(accessToken, supabase)
  }
}