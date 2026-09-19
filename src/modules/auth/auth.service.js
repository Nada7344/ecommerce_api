import {
    createLoginCredentials,
    createRevokeToken,
    decodeToken,
} from "../../common/services/index.js";

import {
    createNumberOtp,
    emailEvent,
    generateHash,
    compareHash,
    verifyEmailTemplate,
    sendEmail,
} from "../../common/utils/index.js";

import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from "../../common/utils/index.js";

import {
    create,
    findOne,
    updateOne,
    UserModel,
} from "../../DB/index.js";

import {
    allKeysByPrefix,
    blockOtpKey,
    deleteKey,
    get,
    incr,
    maxAttempOtpKey,
    otpKey,
    set,
    ttl,
} from "../../common/services/redis.service.js";

import { SubjectEnum } from "../../common/enums/email.enum.js";
import { LogoutEnum, TokenTypeEnum } from "../../common/enums/index.js";



const sendEmailOtp = async ({ email, subject, title }) => {

    const blockTtl = await ttl({ key: blockOtpKey({ email, subject }) });

    if (blockTtl > 0) {
        throw new BadRequestException(
            `You have requested too many OTPs. Please try again after ${blockTtl} seconds`
        );
    }

    const activeOtpTtl = await ttl({ key: otpKey({ email, subject }) });

    if (activeOtpTtl > 0) {
        throw new BadRequestException(
            `An OTP is still active. Please try again after ${activeOtpTtl} seconds`
        );
    }

    const attempts = await get({ key: maxAttempOtpKey({ email, subject }) });

    if (attempts >= 3) {

        await set({
            key: blockOtpKey({ email, subject }),
            value: 1,
            ttl: 420,
        });

        throw new BadRequestException("You have reached the max OTP requests");
    }

    const code = createNumberOtp();

    await set({
        key: otpKey({ email, subject }),
        value: await generateHash({ plaintext: `${code}` }),
        ttl: 120,
    });


    emailEvent.emit("SendEmail", async () => {

        await sendEmail({
            to: email,
            subject: title,
            html: verifyEmailTemplate({ code, title }),
        });

        await incr({ key: maxAttempOtpKey({ email, subject }) });
    });
};



export const signup = async (inputs) => {

    const { name, email, password, phone, gender, DOB } = inputs;

    const existingUser = await findOne({
        model: UserModel,
        filter: { email },
    });

    if (existingUser) {
        throw new ConflictException("Email already exists");
    }

    const user = await create({
        model: UserModel,
        data: {
            name,
            email,
            password,
            phone,
            gender,
            DOB
        },
    });

    await sendEmailOtp({
        email,
        subject: SubjectEnum.ConfirmEmail,
        title: "Verify your email",
    });

    return user;
};


export const verifyEmail = async (inputs) => {

    const { email, otp } = inputs;

    const user = await findOne({
        model: UserModel,
        filter: { email, isVerified: false },
    });

    if (!user) {
        throw new NotFoundException(
            "No pending verification found for this account"
        );
    }

    const hashedOtp = await get({
        key: otpKey({ email, subject: SubjectEnum.ConfirmEmail }),
    });

    if (!hashedOtp) {
        throw new NotFoundException("OTP expired, please request a new one");
    }

    const isValidOtp = await compareHash({
        plaintext: otp,
        ciphertext: hashedOtp,
    });

    if (!isValidOtp) {
        throw new ConflictException("Invalid OTP");
    }

    await updateOne({
        model: UserModel,
        filter: { _id: user._id },
        update: { isVerified: true },
    });

    const staleKeys = await allKeysByPrefix(
        otpKey({ email, subject: SubjectEnum.ConfirmEmail })
    );

    await deleteKey({ key: staleKeys });

    return true;
};



export const resendOtp = async (inputs) => {

    const { email } = inputs;

    const user = await findOne({
        model: UserModel,
        filter: { email, isVerified: false },
    });

    if (!user) {
        throw new NotFoundException(
            "No pending verification found for this account"
        );
    }

    await sendEmailOtp({
        email,
        subject: SubjectEnum.ConfirmEmail,
        title: "Verify your email",
    });

    return true;
};



export const login = async (inputs, issuer) => {

    const { email, password } = inputs;

    const user = await findOne({
        model: UserModel,
        filter: { email },
        select: "+password",
    });

    if (!user) {
        throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await compareHash({
        plaintext: password,
        ciphertext: user.password,
    });

    if (!passwordMatches) {
        throw new UnauthorizedException("Invalid email or password");
    }

    if (user.isBlocked) {
        throw new UnauthorizedException("Your account has been blocked");
    }

    if (!user.isVerified) {
        throw new UnauthorizedException(
            "Please verify your email before logging in"
        );
    }

    return createLoginCredentials(user, issuer);
};



export const refreshToken = async ({ user, decoded, issuer }) => {

    const remainingTtl = decoded.exp - Math.floor(Date.now() / 1000);

    await createRevokeToken({
        userId: user._id,
        jti: decoded.jti,
        ttl: remainingTtl > 0 ? remainingTtl : 60,
    });

    return createLoginCredentials(user, issuer);
};



export const forgotPassword = async (inputs) => {

    const { email } = inputs;

    const user = await findOne({
        model: UserModel,
        filter: { email, isVerified: true },
    });

    if (!user) {
        throw new NotFoundException("No account found with this email");
    }

    await sendEmailOtp({
        email,
        subject: SubjectEnum.ForgotPassword,
        title: "Reset your password",
    });

    return true;
};



export const resetPassword = async (inputs) => {

    const { email, otp, password } = inputs;

    const user = await findOne({
        model: UserModel,
        filter: { email, isVerified: true },
    });

    if (!user) {
        throw new NotFoundException("No account found with this email");
    }

    const hashedOtp = await get({
        key: otpKey({ email, subject: SubjectEnum.ForgotPassword }),
    });

    if (!hashedOtp) {
        throw new NotFoundException("OTP expired, please request a new one");
    }

    const isValidOtp = await compareHash({
        plaintext: otp,
        ciphertext: hashedOtp,
    });

    if (!isValidOtp) {
        throw new ConflictException("Invalid OTP");
    }

    const newHashedPassword = await generateHash({ plaintext: password });

    await updateOne({
        model: UserModel,
        filter: { _id: user._id },
        update: {
            password: newHashedPassword,
            changeCredentialTime: new Date(),
        },
    });

    const staleKeys = await allKeysByPrefix(
        otpKey({ email, subject: SubjectEnum.ForgotPassword })
    );

    await deleteKey({ key: staleKeys });

    return true;
};


export const logout = async ({ user, decoded, flag, refresh_token }) => {

    if (flag === LogoutEnum.All) {

        await updateOne({
            model: UserModel,
            filter: { _id: user._id },
            update: { changeCredentialTime: new Date() },
        });

        return true;
    }

    const accessTtl = decoded.exp - Math.floor(Date.now() / 1000);

    await createRevokeToken({
        userId: user._id,
        jti: decoded.jti,
        ttl: accessTtl > 0 ? accessTtl : 60,
    });

    if (refresh_token) {

        const { decoded: refreshDecoded } = await decodeToken({
            token: refresh_token,
            tokenType: TokenTypeEnum.Refresh,
        });

        const refreshTtl = refreshDecoded.exp - Math.floor(Date.now() / 1000);

        await createRevokeToken({
            userId: user._id,
            jti: refreshDecoded.jti,
            ttl: refreshTtl > 0 ? refreshTtl : 60,
        });
    }

    return true;
};