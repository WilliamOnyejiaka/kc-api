const nodemailer = require("nodemailer");
const env = require("../config/env");
const ejs = require("ejs");
const path = require("path");

class Email {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use TLS
            auth: {
                user: 'mirordev@gmail.com', // TODO: add this to env
                pass: env('smtpPassword'),
            },
        });
    }

    async getEmailTemplate(data, templatePath = path.join(__dirname, './../views', "email.ejs")) {
        const htmlContent = await ejs.renderFile(templatePath, data);
        return htmlContent;
    }

    async sendEmail(from, to, subject, html) {
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
            return false;
        }
    }
}

module.exports = Email;
