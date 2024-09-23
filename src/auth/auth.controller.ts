// auth/auth.controller.ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; phoneNumber: string; password: string },
  ) {
    //console.log(body);
    return this.authService.register(
      body.email,
      body.phoneNumber,
      body.password,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.login(body.email, body.password);
    if (user) {
      return { user };
    }
    throw new BadRequestException('Invalid email/password');
    return { message: 'Invalid credentials' };
  }
}
