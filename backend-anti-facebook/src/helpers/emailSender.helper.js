const nodemailer = require('nodemailer');

// Create a transporter object using your email service provider's SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.HOST_EMAIL_SERVICE,
    port: process.env.PORT_EMAIL_SERVICE,
    auth: {
        user: process.env.USER_EMAIL_SERVICE,
        pass: process.env.PASS_EMAIL_SERVICE,
    },
});

const emailValidate = (userEmail, code) => {
    // Email data
    const mailOptions = {
        from: process.env.USER_EMAIL_SERVICE,
        to: `${userEmail}`,
        subject: 'This is email vadidate',
        text: `Hello, this is your code ${code}.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = { emailValidate };
