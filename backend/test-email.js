require('dotenv').config({ path: '.env' });

console.log('=== Testing Email Configuration ===');
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ Missing');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ Missing');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ Missing');