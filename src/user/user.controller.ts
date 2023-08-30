import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Post("signup")
  signUpUser(@Body() body: CreateUserDto) {
    return this.userService.signUpUser(body)
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.userService.login(body)
  }

  @Post("verify")
  verifyUser(@Body() body) {
    return this.userService.verifyUser(body)
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers()
  }

}
