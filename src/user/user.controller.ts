import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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

  @Post("reset-password")
  sendPasswordLink(@Body() body) {
    return this.userService.sendForgetPasswordLink(body)
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers()
  }

  @Patch("password/:user_id")
  updateUserPassword(@Param() object, @Body() body) {
    return this.userService.updateUserPassword(object.user_id, body)
  }

  @Patch("override-password")
  resetUserPassword(@Body() body) {
    return this.userService.resetUserPassword(body)
  }

  @Patch()
  @UseGuards(AuthGuard)
  updateUserDetails(@Param() object, @Body() body) {
    return this.userService.updateUserDetails(object.user_id, body)
  }

  @Delete("/:user_id")
  removeUser(@Param() object) {
    return this.userService.deleteUser(object.user_id)
  }

}
