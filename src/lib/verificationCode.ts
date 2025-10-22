import bcrypt from "bcryptjs";

export const generateVerificationCode = async () => {
  const code = await bcrypt.hash(
    String(Math.floor(100000 + Math.random() * 900000)),
    10
  );

  return String(Math.floor(100000 + Math.random() * 900000));
};

export const verifyCode = async (code: string, verificationCode: string) => {
  // return await bcrypt.compare(code, verificationCode);
  return code === verificationCode;
};
