import { Controller, Headers, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
  ) { }

  @Post("signup")
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body)
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body)
  }

  @Post("verify")
  verifyUser(@Body() body) {
    return this.passwordService.verifyUser(body)
  }

  @Post("reset-password")
  sendForgetPassword(@Body() body) {
    return this.passwordService.sendForgetPassword(body)
  }

  @Patch("password")
  @UseGuards(AuthGuard)
  changePassword(@Headers() headers, @Body() body) {
    return this.passwordService.changePassword(headers, body)
  }

  @Patch("override-password")
  setUserPassword(@Body() body) {
    return this.passwordService.setUserPassword(body)
  }

  @Patch()
  @UseGuards(AuthGuard)
  updateUser(@Headers() headers, @Body() body) {
    return this.userService.updateUser(headers, body)
  }

  @Delete("/:user_id")
  deleteUser(@Param() object) {
    return this.userService.deleteUser(object.user_id)
  }

}
