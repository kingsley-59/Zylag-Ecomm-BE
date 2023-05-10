const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const handlebars = require('handlebars');
const { htmlToText } = require('html-to-text');
const { sign } = require('jsonwebtoken');
require('dotenv').config()


class MailService {
    transporter;
    mailOptions = {};

    constructor() {
        const smtpConfig = smtpTransport({
            host: process.env.SMTP_HOST,
            secure: false,
            tls: {
                rejectUnauthorized: false
            },
            port: 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        this.transporter = nodemailer.createTransport(smtpConfig);
        this.from = `${process.env.CONTACT_NAME} <${process.env.CONTACT_EMAIL}>`;
        this.replyTo = process.env.CONTACT_EMAIL;
    }


    /**
     * 
     * @param {nodemailer.SendMailOptions} mailOptions 
     * @param {*} template 
     * @param {*} context 
     * @returns 
     */
    async sendMail(mailOptions, template = '', context) {

        try {
            const { html, plainText } = this.getMailTemplate(template, context)
            mailOptions.html = html;
            mailOptions.text = plainText;

            const info = await this.transporter.sendMail(mailOptions)
            console.log(info)
            return info
        } catch (error) {
            console.log('Error: ', error)
            throw new Error(error?.message)
        }
    }

    getMailTemplate(template = '', context = {}) {
        // Read the HTML template file
        const templatePath = path.resolve(__dirname, '../views', `${template}.hbs`);
        const hbsText = fs.readFileSync(templatePath, 'utf-8');

        const compileTemplate = handlebars.compile(hbsText);
        const html = compileTemplate(context);
        const plainText = htmlToText(html);

        return { html, plainText };
    }

    async sendWelcomeEmail(user) {
        try {
            const info = await this.sendMail({
                from: this.from,
                to: user.email,
                replyTo: this.replyTo,
                subject: `Password Reset Request - ${process.env.COMPANY_NAME}`,
            }, 'welcome', { name: user.fullname });
            return info;
        } catch (error) {
            console.log(error);
            throw new Error('Failed so send verification email');
        }
    }

    async sendVerificationEmail(user, token) {
        try {
            const info = await this.sendMail({
                from: this.from,
                to: user.email,
                replyTo: this.replyTo,
                subject: `Password Reset Request - ${process.env.COMPANY_NAME}`,
            }, 'emailVerification', {
                name: user.fullname,
                verificationLink: `${process.env.CLIENT_URL}/password-reset?token=${token}`
            })
            return info;
        } catch (error) {
            console.log(error);
            throw new Error('Failed so send verification email');
        }
    }
}


module.exports = MailService