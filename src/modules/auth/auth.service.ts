import { User } from './auth.model';

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const createNewUser = async (payload: object) => {
  return await User.create(payload);
};

export const findUserById = async (id: string) => {
  return await User.findById(id);
};
