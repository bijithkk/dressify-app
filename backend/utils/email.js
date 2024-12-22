import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        // Create the transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USERNAME,  // Gmail email address
                pass: process.env.EMAIL_PASSWORD,  // App password
            },
            tls: {
                rejectUnauthorized: false,  // For SSL security
            },
        });

        // Define the email options
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,  // Use your Gmail address
            to: options.email,  // Recipient email
            subject: options.subject,
            text: options.message,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

export { sendEmail };
