const rateLimit = require('express-rate-limit');
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: { message: "Too many login attempts, please try again later" }
});
