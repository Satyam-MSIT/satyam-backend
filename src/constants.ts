const sizes = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 }; // In bytes
export const limitMB = 50;
export const limit = 50 * sizes.MB;
export const expiresIn = "3 hours";
export const otpExpiry = 300000; // 5 minutes
export const currentYear = new Date().getFullYear().toString().slice(2);
export const currentVolume = "12";
