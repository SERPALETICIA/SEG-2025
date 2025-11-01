import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    const found = await this.service.findById(id);

    if (!found)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return found;
  }

  @Post()
  create(@Body() user: User): Promise<User> {
    return this.service.save(user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() user: User,
  ): Promise<User> {
    const found = await this.service.findById(id);

    if (!found)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    user.id = found.id;

    return this.service.save(user);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const found = await this.service.findById(id);

    if (!found)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.service.remove(id);
  }
}