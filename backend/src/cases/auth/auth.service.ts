import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthDTO } from './dtos/auth.dto'
import { UserService } from '../users/user.service'
import type { SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient,
    private readonly userService: UserService
  ) { }

  // verifica MFA e decide o próximo passo
  async login(credential: AuthDTO) {
    const { data, error } = await this.supabase.auth.signInWithPassword(
      credential
    )

    if (error) {
      if (error.status === 401 || error.message.includes('Invalid login')) {
        throw new UnauthorizedException('Credenciais inválidas.')
      }

      throw new InternalServerErrorException(error.message)
    }

    const supabaseUser = data.user

    if (!supabaseUser) {
      throw new InternalServerErrorException('No user returned')
    }

    const userFound = await this.userService.findBySupabaseId(supabaseUser.id)

    if (!userFound) {
      throw new NotFoundException('User not found')
    }

    // se o usuário tem MFA ativo, iniciar o desafio
    if (userFound.hasMFA) {
      const { data: list, error: listError } =
        await this.supabase.auth.mfa.listFactors()

      if (listError) throw new InternalServerErrorException(listError.message)
      const totp = list.totp?.[0]

      if (!totp) {
        userFound.hasMFA = false
        await this.userService.save(userFound)
      } else {
        const { error: challengeError } =
          await this.supabase.auth.mfa.challenge({ factorId: totp.id })

        if (challengeError) {
          throw new InternalServerErrorException(challengeError.message)
        }

        return {
          token: data.session.access_token,
          user: {
            id: userFound.id,
            email: supabaseUser.email,
            hasMFA: true,
            isFirstMfaAccess: !userFound.isMfaSetupComplete,
            isMfaValidated: false,
            factorId: totp.id,
          },
        }
      }
    }

    // sem MFA passa pro login normal e verifica se é o primeiro acesso pra dai entao configurar MFA
    return {
      token: data.session.access_token,
      user: {
        ...userFound,
        email: supabaseUser.email,
        isMfaValidated: true,
        isFirstMfaAccess: !userFound.isMfaSetupComplete,
      },
    }
  }

  // verifica código TOTP após login
  async verifyMfa(factorId: string, code: string, supabaseUserClient: SupabaseClient) {
    const { data: challenge, error: challengeError } = await supabaseUserClient.auth.mfa.challenge({ factorId })

    if (challengeError) {
      throw new InternalServerErrorException('Erro ao criar desafio MFA: ' + challengeError.message)
    }

    const { data, error } = await supabaseUserClient.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })

    if (error) {
      if (error.status === 400) {
        throw new UnauthorizedException('Código MFA inválido.')
      }

      throw new InternalServerErrorException(error.message)
    }

    const { data: sessionData, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError) {
      throw new InternalServerErrorException(sessionError.message)
    }

    const supabaseUser = sessionData.session?.user

    if (!supabaseUser) {
      throw new InternalServerErrorException('Usuário não encontrado após MFA')
    }

    const found = await this.userService.findBySupabaseId(supabaseUser.id)

    if (!found) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    if (!found.isMfaSetupComplete) {
      found.hasMFA = true
      found.isMfaSetupComplete = true
      await this.userService.save(found)
    }

    return {
      token: data.access_token,
      user: {
        ...found,
        email: supabaseUser.email,
        isMfaValidated: true,
      },
    }
  }

  // gera QRCode
  async configure(accessToken: string, supabaseUserClient: SupabaseClient) {
    const FRIENDLY_NAME = 'SEG-2025';

    const { data: factorsData, error: listError } = await supabaseUserClient.auth.mfa.listFactors();

    if (listError) {
      throw new InternalServerErrorException(listError.message);
    }

    const existingFactor = factorsData?.all?.find(
      (f) => f.friendly_name === FRIENDLY_NAME
    );

    if (existingFactor) {
      const { error: unenrollError } = await supabaseUserClient.auth.mfa.unenroll({
        factorId: existingFactor.id,
      });

      if (unenrollError && unenrollError.code !== 'mfa_factor_not_found') {
        throw new InternalServerErrorException(
          'Erro ao remover MFA antigo: ' + unenrollError.message,
        );
      }
    }

    // cria novo fator
    const { data, error } = await supabaseUserClient.auth.mfa.enroll({
      factorType: 'totp',
      issuer: FRIENDLY_NAME,
      friendlyName: FRIENDLY_NAME,
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: sessionData } =
      await supabaseUserClient.auth.getUser(accessToken)
    const supabaseUser = sessionData?.user

    if (supabaseUser) {
      const found = await this.userService.findBySupabaseId(supabaseUser.id)

      if (found) {
        found.mfaFactorId = data.id
        await this.userService.save(found)
      }
    }

    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  }

  // Desativa MFA
  async unenrollMfa(factorId: string, accessToken: string, supabaseUserClient: SupabaseClient) {
    const { error } = await supabaseUserClient.auth.mfa.unenroll({
      factorId,
    })

    if (error) {
      throw new InternalServerErrorException(error.message)
    }

    const { data: sessionData } =
      await supabaseUserClient.auth.getUser(accessToken)
    const supabaseUser = sessionData?.user

    if (supabaseUser) {
      const found = await this.userService.findBySupabaseId(supabaseUser.id)

      if (found) {
        found.hasMFA = false
        found.isMfaSetupComplete = false
        found.mfaFactorId = ''
        await this.userService.save(found)
      }
    }

    return { success: true }
  }

  async listMfaFactors(supabaseUserClient: SupabaseClient) {
    const { data, error } = await supabaseUserClient.auth.mfa.listFactors()

    if (error) {
      throw new InternalServerErrorException(error.message)
    }

    return data.all.map((factor) => ({
      id: factor.id,
      type: factor.factor_type,
      name: factor.friendly_name,
      status: factor.status,
    }))
  }

  async getSupabaseUser(accessToken: string, supabaseUserClient: SupabaseClient) {
    const { data: sessionData } =
      await supabaseUserClient.auth.getUser(accessToken)
    const supabaseUser = sessionData?.user

    return supabaseUser;
  }
}