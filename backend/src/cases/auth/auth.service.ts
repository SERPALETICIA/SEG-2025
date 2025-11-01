import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common"
import { SupabaseService } from "src/supabase/supabase.service"
import { AuthDTO } from "./auth.dto"
import { UserService } from "./users/user.service";

@Injectable()
export class AuthService {

  constructor(
    private readonly supabase: SupabaseService,
    private readonly userService: UserService
  ) {}

  async login(credential: AuthDTO) {
    const client = this.supabase.getClient();
    const { data, error } = await client.auth.signInWithPassword(credential)
   
    if (error) {      
      if (error.status === 400 || error.message.includes('Invalid login')) {
        throw new UnauthorizedException(error.message)
      }

      throw new InternalServerErrorException(error.message)
    }

    //Busca dados do uusário
    const found = await this.userService.findBySupabaseId(data.user.id);

    return {
      token: data.session.access_token,
      user: {...found, email: data.user.email }
    }
  }
}