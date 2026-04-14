export const emailTemplate = ({ userName = "User", otp, type = "confirmEmail" }: { userName?: string | undefined, otp: string, type?: string | undefined }) => {

  const isForget = type === "forgetPassword"

  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:Arial; background:#f4f7fb; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:12px;">
      
      <h2>Hello ${userName}</h2>

      <p>
        ${isForget
      ? "You requested to reset your password. Use the code below:"
      : "Use the following code to verify your email:"
    }
      </p>

      <h1 style="letter-spacing:8px; color:#2563eb;">
        ${otp}
      </h1>

      <p>
        ${isForget
      ? "If you didn’t request a password reset, you can ignore this email."
      : "This code is valid for a limited time."
    }
      </p>

      <hr/>

      <p style="font-size:12px; color:#999;">
        SocialApp Security System
      </p>

    </div>

  </body>
  </html>
  `
}