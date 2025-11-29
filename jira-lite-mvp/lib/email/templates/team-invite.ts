import { resend, FROM_EMAIL } from "../resend";

interface SendTeamInviteParams {
  email: string;
  teamName: string;
  inviterName: string;
  token: string;
  role: string;
}

export async function sendTeamInvite({
  email,
  teamName,
  inviterName,
  token,
  role,
}: SendTeamInviteParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;
  const roleLabel = role === "ADMIN" ? "관리자" : "멤버";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${inviterName}님이 ${teamName} 팀에 초대했습니다`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #5B5FC7 0%, #4c51bf 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 600;">팀 초대</h1>
  </div>

  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 24px;">
      안녕하세요,
    </p>

    <p style="font-size: 16px; margin-bottom: 24px;">
      <strong style="color: #5B5FC7;">${inviterName}</strong>님이 당신을
      <strong style="color: #5B5FC7;">${teamName}</strong> 팀에
      <strong style="color: #5B5FC7;">${roleLabel}</strong>로 초대했습니다.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${inviteUrl}"
         style="background: linear-gradient(135deg, #5B5FC7 0%, #4c51bf 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(91, 95, 199, 0.3);">
        초대 수락하기
      </a>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        ⚠️ <strong>이 초대는 7일 후 만료됩니다.</strong>
      </p>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:
    </p>
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px;">
      ${inviteUrl}
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

    <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
      이 이메일은 Jira Lite에서 발송되었습니다.<br>
      초대를 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
    </p>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("Failed to send team invite email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error sending team invite email:", error);
    throw error;
  }
}
