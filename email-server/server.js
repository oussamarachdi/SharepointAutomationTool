const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const schedule = require('node-schedule');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
dotenv.config(); // Ensure this is called at the top

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Log environment variables to check if they are loaded correctly
console.log('EMAIL_ADDRESS:', process.env.EMAIL_ADDRESS);
console.log('EMAIL_RECEIVER:', process.env.EMAIL_RECEIVER);

function sendEmail() {
    const auth = {
        type: 'OAuth2',
        user: process.env.EMAIL_ADDRESS,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
    };
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: auth
    });

    const today = new Date();
    const formattedDate = today.getFullYear() +
        ('0' + (today.getMonth() + 1)).slice(-2) +
        ('0' + today.getDate()).slice(-2);
    const attachmentPath = path.join(__dirname, 'uploads', `${formattedDate}.zip`);
    
    const mail_config = {
        from: {
            name: process.env.EMAIL_NAME,
            address: process.env.EMAIL_ADDRESS,
        },
        to: process.env.EMAIL_RECEIVER, // Ensure this is correctly set
        subject: `Info sur les contrats de date ${new Date().toLocaleDateString()}`,
        text: 'This is a test email.', // Add a text field for the email body
        attachments: [
            {
                filename: `${formattedDate}.zip`,
                path: attachmentPath,
            }
        ]
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mail_config, (err, info) => {
            if (err) {
                console.log('Error sending email:', err);
                return reject({ message: 'An error occurred while sending the email', error: err.message });
            }
            console.log('Email sent:', info);
            return resolve({ message: "Email sent successfully" });
        });
    });
}

app.post('/notify', async (req, res) => {
    try {
        await sendEmail();
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error in /notify endpoint:', error);
        res.status(500).send('Error sending email');
    }
});

// Schedule the task to run a few minutes from now for testing
const testDate = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes from now
schedule.scheduleJob(testDate, async () => {
    try {
        const response = await axios.post('http://localhost:5000/run_bot');
        console.log('Bot started:', response.data);
    } catch (error) {
        console.error('Error starting bot:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});