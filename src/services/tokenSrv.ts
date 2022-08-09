import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import User from 'orm/entities/User';

// Create token
export const signToken = async (user: User) => {
  // set token expires
  const tokenExpires = dayjs().add(Number(process.env.JWT_EXPIRATION_DAY), 'day');

  const token = jwt.sign({ id: user.id, iat: dayjs().unix(), exp: tokenExpires.unix() }, process.env.JWT_SECRET_KEY, {
    algorithm: 'HS512',
  });

  return {
    tokenExpires: tokenExpires.format('YYYY-MM-DD HH:mm:ss'),
    token,
  };
};
