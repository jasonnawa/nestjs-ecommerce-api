import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { NotificationService } from 'src/notification/notification.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jwt-simple';

@Injectable({})
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  async register(
    email: string,
    phoneNumber: string,
    password: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
    });
    await newUser.save();

    const message = `Welcome user, you have registered successfully!`;
    await this.notificationService.sendNotification(phoneNumber, message);

    return newUser;
  }

  async login(email: string, password: string): Promise<any | null> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email };
      return { user: user, token: jwt.encode(payload, 'jwsnj3i9oidwoit') }; // Use environment variables for secrets
    }
    return null;
  }
}
