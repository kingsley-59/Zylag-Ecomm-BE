const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const handlebars = require('handlebars');
const { htmlToText } = require('html-to-text');
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

        this.transporter = nodemailer.createTransport(smtpConfig)
    }


    /**
     * 
     * @param {nodemailer.SendMailOptions} mailOptions 
     * @returns 
     */
    async sendMail(mailOptions) {
        this.mailOptions = mailOptions;
        try {
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
}


module.exports = MailService