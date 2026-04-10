// Set EMAIL_VERIFICATION_ENABLED=false in .env to skip email verification (e.g. local dev).
// Defaults to true so production is safe without explicit configuration.
export const EMAIL_VERIFICATION_ENABLED = process.env.EMAIL_VERIFICATION_ENABLED !== 'false'
