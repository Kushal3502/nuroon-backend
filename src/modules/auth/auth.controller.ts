import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import {
  getAccessToken,
  getRefreshToken,
  verifyToken,
} from '../../lib/generateTokens';
import { sentVerificationEmail } from '../../lib/sendVerificationEmail';
import {
  verifyCode as compareCode,
  generateVerificationCode,
} from '../../lib/verificationCode';
import { ApiError, ApiResponse, asyncHandler } from '../../utils';
import { createNewUser, findUserByEmail, findUserById } from './auth.service';

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      throw new ApiError(400, 'All fields are required');

    // check if email is already registered or not
    const isEmailAlreadyExists = await findUserByEmail(email);

    if (isEmailAlreadyExists)
      throw new ApiError(409, 'Email already registered. Try Login instead.');

    const verificationCode = await generateVerificationCode();

    // send email here
    await sentVerificationEmail(email, verificationCode);

    // create new user
    const newUser = await createNewUser({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.status(200).json(
      new ApiResponse(201, 'Verification Code sent to the registered email.', {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      }),
    );
  },
);

export const verifyCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode)
    throw new ApiError(400, 'Please provide verification code');

  const user = await findUserByEmail(email);

  if (!user) throw new ApiError(404, 'Invalid email address');

  // check expiry
  if (user.verificationCodeExpiry && user.verificationCodeExpiry < new Date())
    throw new ApiError(404, 'Verification code is expired');

  // compare
  const isValid = await compareCode(
    verificationCode,
    String(user.verificationCode),
  );

  if (!isValid) throw new ApiError(400, 'Invalid verification code');

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;

  await user.save();

  res.status(200).json(new ApiResponse(200, 'Email verified successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) throw new ApiError(404, 'User not found. Please register.');

  if (!user.isVerified)
    throw new ApiError(401, 'Please verify your account first.');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect)
    throw new ApiError(401, 'Invalid username or password.');

  const refreshToken = getRefreshToken({ _id: user._id });
  const accessToken = getAccessToken({ _id: user._id, email: user.email });

  user.refreshToken = refreshToken;

  await user.save();

  res
    .status(200)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(200, 'Login successful', {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      }),
    );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const email = req.user?.email;

  if (!userId || !email) {
    throw new ApiError(401, 'Unauthorized – user not found in request');
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.refreshToken = undefined;
  await user.save();

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(new ApiResponse(200, 'Logout successful'));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const email = req.user?.email;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'User fetched successfully', {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    }),
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    throw new ApiError(401, 'Unauthorized access! No refresh token found.');

  const decodedToken = verifyToken(
    refreshToken,
    String(process.env.REFRESH_TOKEN_SECRET),
  ) as { _id: string };

  if (!decodedToken || !decodedToken._id) {
    throw new ApiError(403, 'Invalid or expired refresh token.');
  }

  const user = await findUserById(decodedToken._id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.refreshToken !== refreshToken)
    throw new ApiError(403, 'Refresh token mismatch.');

  const newAccessToken = getAccessToken({
    _id: user._id,
    email: user.email,
  });

  res
    .status(200)
    .cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .json(new ApiResponse(200, 'Access token refreshed successfully'));
});
