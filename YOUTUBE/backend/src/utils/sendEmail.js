import  nodemailer from "nodemailer"
const sendEmail =async(options)=>{
    const transporter =nodemailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
        },
    });
    const mailOptions={
        from:{
            name:"Your App Name",
            address:process.env.EMAIL_USER
        },
        to:options.email,
        subject:options.subject,
        text:options.message,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email send successflly to ${options.email}`);
}
export {sendEmail};