const sizes = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 }; // In bytes
export const expiresIn = "3 hours";
export const limitMB = 50;
export const limit = 50 * sizes.MB;
export const otpExpiry = 300000; // 5 minutes
export const types = ["satyam-admin", "satyam-chief-editor", "satyam-member", "reviewer", "author"] as const;
