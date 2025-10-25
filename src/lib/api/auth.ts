
import axios from 'axios';

export type SignupForm = {
	name: string;
	email: string;
	password: string;
	confirmPassword?: string;
	acceptTerms?: boolean;
	phoneNumber?: string;
	[key: string]: any;
};

const REGISTER_URL = 'http://localhost:4000/api/auth/register';
const VERIFY_REGISTRATION_URL = 'http://localhost:4000/api/auth/verify-registration';
const VERIFY_SIGNIN_URL = 'http://localhost:4000/api/auth/verify-login';
const RESEND_OTP_URL = 'http://localhost:4000/api/auth/resend-otp';
const SIGNIN_URL = 'http://localhost:4000/api/auth/login';
const FORGOT_PASSWORD_URL = 'http://localhost:4000/api/auth/forgot-password';
const RESET_PASSWORD_URL = 'http://localhost:4000/api/auth/reset-password';

export async function resendOTP(email: string, type: 'registration' | 'login' | 'password_reset'): Promise<any> {
	if (!email || !type) {
		throw new Error('Please provide email and type');
	}
	const allowedTypes = ['registration', 'login', 'password_reset'];
	if (!allowedTypes.includes(type)) {
		throw new Error('Invalid type. Must be one of registration, login, password_reset');
	}
	try {
		const res = await axios.post(RESEND_OTP_URL, { email, type }, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		});
		return res.data;
	} catch (err: any) {
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}

export async function signup(formData: SignupForm): Promise<any> {
	if (!formData) throw new Error('No form data provided');

	const { name, email, password, confirmPassword, acceptTerms } = formData;

	// Basic client-side validation
	if (!name || !email || !password) {
		throw new Error('Name, email and password are required');
	}

	if (confirmPassword !== undefined && password !== confirmPassword) {
		throw new Error('Passwords do not match');
	}

	if (acceptTerms !== undefined && acceptTerms !== true) {
		throw new Error('You must accept the terms');
	}

	try {
		const payload = {
			name,
			email,
			password,
			phoneNumber: formData.phoneNumber ?? '',
			acceptTerms: !!acceptTerms,
		};

		const res = await axios.post(REGISTER_URL, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		});

		return res.data;
	} catch (err: any) {
		// Axios error handling - prefer server message when available
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}

export async function verifySignup(formData: any): Promise<any> {
	if (!formData) throw new Error('No form data provided');

	const { name, email, password, confirmPassword, acceptTerms, otp } = formData;

	// Basic client-side validation
	if (!otp) {
		throw new Error('OTP is required');
	}

	try {
		const payload = {
			name,
			email,
			password,
			phoneNumber: formData.phoneNumber ?? '',
			acceptTerms: !!acceptTerms,
            otp
		};

		const res = await axios.post(VERIFY_REGISTRATION_URL, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		});

		return res.data;
	} catch (err: any) {
		// Axios error handling - prefer server message when available
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}

export async function signIn(formData:any): Promise<any> {
    if (!formData) throw new Error('No form data provided');
	const { email, password } = formData;
	// Basic client-side validation
	if (!email || !password) {
		throw new Error('Name, email and password are required');
	}
    try {
        const payload = {
            email, 
            password
        }
        const res = await axios.post(SIGNIN_URL, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		})
        return res.data;
    }
    catch (err: any) {
		// Axios error handling - prefer server message when available
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}

export async function verifySignIn(formData: any): Promise<any> {
	if (!formData) throw new Error('No form data provided');

	const { email, otp } = formData;

	// Basic client-side validation
	if (!otp) {
		throw new Error('OTP is required');
	}

	try {
		const payload = {
			email,
            otp
		};

		const res = await axios.post(VERIFY_SIGNIN_URL, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		});

		return res.data;
	} catch (err: any) {
		// Axios error handling - prefer server message when available
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}

export async function forgotPassword(email: string): Promise<any> {
	if (!email) throw new Error('No form data provided');

	// Basic client-side validation
	if (!email) {
		throw new Error('E-mail is required');
	}

	try {
		const payload = {
			email
		};

		const res = await axios.post(FORGOT_PASSWORD_URL, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		});

		return res.data;
	} catch (err: any) {
		// Axios error handling - prefer server message when available
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}

export async function resetPassword(formData: any): Promise<any> {
	if (!formData) throw new Error('No form data provided');

	const {email, newPassword, otp, confirmPassword } = formData;

	// Basic client-side validation
	if (!email || !newPassword || !otp) {
		throw new Error('Email, otp and password are required');
	}

	if (confirmPassword !== undefined && newPassword !== confirmPassword) {
		throw new Error('Passwords do not match');
	}


	try {
		const payload = {
			otp,
			email,
			newPassword,
		};

		const res = await axios.post(RESET_PASSWORD_URL, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		});

		return res.data;
	} catch (err: any) {
		// Axios error handling - prefer server message when available
		if (axios.isAxiosError(err)) {
			const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
			throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
		}
		throw err;
	}
}