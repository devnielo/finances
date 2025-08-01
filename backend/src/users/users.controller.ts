import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/verify-email')
  async verifyEmail(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.verifyEmail(id);
  }

  @Patch(':id/preferences')
  async updatePreferences(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() preferences: any,
  ): Promise<User> {
    return this.usersService.updatePreferences(id, preferences);
  }

  @Get(':id/stats')
  async getUserStats(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.usersService.getUserStats(id);
  }

  @Post(':id/two-factor/enable')
  async enableTwoFactor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { secret: string; recoveryCodes: string[] },
  ): Promise<{ message: string }> {
    await this.usersService.enableTwoFactor(id, body.secret, body.recoveryCodes);
    return { message: 'Two-factor authentication enabled successfully' };
  }

  @Post(':id/two-factor/disable')
  async disableTwoFactor(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.disableTwoFactor(id);
    return { message: 'Two-factor authentication disabled successfully' };
  }

  @Post(':id/two-factor/recovery-code')
  async useRecoveryCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { code: string },
  ): Promise<{ success: boolean }> {
    const success = await this.usersService.useRecoveryCode(id, body.code);
    return { success };
  }
}