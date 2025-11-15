import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id: id });
  }

  findBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.repository.findOneBy({ supabaseId: supabaseId });
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}