const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const schedule = require('node-schedule');
const app = express();
const dotenv = require('dotenv');
const path = require('path'); // Ensure this line is present to use the path module
const fs = require('fs'); // Add this line to use the fs module
dotenv.config(); // Ensure this is called at the top

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

    // Get today's date in yyyymmdd format
    const today = new Date();
    const formattedDate = today.getFullYear() +
        ('0' + (today.getMonth() + 1)).slice(-2) +
        ('0' + today.getDate()).slice(-2);
    const attachmentPath = path.join(__dirname, '../uploads', `${formattedDate}.zip`); // Adjust the path to include the uploads folder one level up

    // Log the date and attachment path to verify them
    console.log('Formatted Date:', formattedDate);
    console.log('Attachment Path:', attachmentPath);

    // Ensure the uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        console.log('Uploads directory does not exist, creating it...');
        fs.mkdirSync(uploadsDir);
    }

    // List the contents of the uploads directory
    console.log('Contents of uploads directory:', fs.readdirSync(uploadsDir));

    // Check if the file exists
    if (!fs.existsSync(attachmentPath)) {
        console.error('File does not exist:', attachmentPath);
        return Promise.reject({ message: 'File does not exist', error: `File not found: ${attachmentPath}` });
    }

    // Log file stats to check permissions and other details
    const fileStats = fs.statSync(attachmentPath);
    console.log('File Stats:', fileStats);

    const mail_config = {
        from: {
            name: process.env.EMAIL_NAME,
            address: process.env.EMAIL_ADDRESS,
        },
        to: process.env.EMAIL_RECEIVER,
        subject: `Contrats Microcred ${today.toLocaleDateString()}`,
        text: `Bonjour,\n\nVeuillez trouver ci-joint les contrats signés en date du ${today.toLocaleDateString()}.\n\nCordialement,`,
        attachments: [
            {
                filename: `${formattedDate}.zip`,
                path: attachmentPath
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

//Scedule the task at 9 pm
/* schedule.scheduleJob('0 21 * * *', async () => {
    try {
        const response = await axios.post('http://localhost:5000/run_bot');
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}); */

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