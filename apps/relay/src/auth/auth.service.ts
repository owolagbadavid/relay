import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // dummy login
  async login(email: string): Promise<string> {
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, returnDocument: 'after' },
    );

    return await this.jwtService.signAsync(
      { email, sub: user._id },
      { expiresIn: '1h' },
    );
  }
}
