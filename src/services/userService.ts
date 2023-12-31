import axios from 'axios';
import User, { ProfileData, IUser } from '../models/User';
import { UserType } from '../types';
import authenticateWithAuth0 from '../utils/authenticateWithAuth0';

class UserService {
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<IUser> {
    const auth0Response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        password,
        connection: 'Username-Password-Authentication'
      }
    );

    const newUser = new User({
      email,
      firstName,
      lastName,
      auth0Id: auth0Response.data._id
    });
    await newUser.save();

    return newUser;
  }

  async completeProfile(auth0Id: string, profileData: ProfileData): Promise<IUser | null> {
    return await User.findOneAndUpdate({ auth0Id }, profileData, { new: true });
  }

  async getUsersByType(userType: UserType): Promise<IUser[]> {
    return await User.find({ userType });
  }

  async authenticate(email: string, password: string): Promise<any> {
    console.log("authenticate")
    return await authenticateWithAuth0(email, password);
  }
}

export default new UserService();
