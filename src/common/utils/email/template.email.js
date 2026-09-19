export const verifyEmailTemplate = ({ code, title }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#f5f7f8;
  font-family:Arial, Helvetica, sans-serif;
  color:#1f2933;
">

  <table
    width="100%"
    border="0"
    cellspacing="0"
    cellpadding="0"
    style="background-color:#f5f7f8; padding:40px 15px;"
  >
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table
          width="600"
          border="0"
          cellspacing="0"
          cellpadding="0"
          style="
            width:100%;
            max-width:600px;
            background-color:#ffffff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 8px 30px rgba(186,202,214,0.25);
          "
        >

          <!-- Top Brand Area -->
          <tr>
            <td
              align="center"
              style="
                background-color:#a3d2e8;
                padding:30px 20px;
              "
            >

              <div
                style="
                  font-family:Georgia, 'Times New Roman', serif;
                  font-size:38px;
                  font-weight:bold;
                  color:#1f4260;
                  letter-spacing:1px;
                "
              >
                Moda
              </div>

              <div
                style="
                  margin-top:8px;
                  font-size:13px;
                  color:#36566d;
                  letter-spacing:1px;
                "
              >
                YOUR STYLE. YOUR WAY.
              </div>

            </td>
          </tr>


          <!-- Header / Website Link -->
          <tr>
            <td style="padding:22px 30px 0 30px;">

              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>

                  <td
                    align="left"
                    style="
                      font-size:13px;
                      color:#7b8794;
                    "
                  >
                    Account Verification
                  </td>

                  <td align="right">
                    <a
                      href="http://localhost:4200/#/"
                      target="_blank"
                      style="
                        color:#4b91bd;
                        text-decoration:none;
                        font-size:13px;
                        font-weight:bold;
                      "
                    >
                      Visit Website →
                    </a>
                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- Main Content -->
          <tr>
            <td
              align="center"
              style="
                padding:45px 40px 35px 40px;
              "
            >

              <!-- Icon -->
              <div
                style="
                  width:70px;
                  height:70px;
                  line-height:70px;
                  margin:0 auto 25px auto;
                  border-radius:50%;
                  background-color:#eadbc8;
                  color:#4b91bd;
                  font-size:30px;
                  font-weight:bold;
                "
              >
                ✓
              </div>


              <!-- Title -->
              <h1
                style="
                  margin:0;
                  color:#1f2933;
                  font-family:Georgia, 'Times New Roman', serif;
                  font-size:30px;
                  line-height:1.3;
                "
              >
                ${title}
              </h1>


              <!-- Description -->
              <p
                style="
                  margin:18px auto 0 auto;
                  max-width:430px;
                  color:#687786;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                Welcome to Moda!
                Use the verification code below to confirm your email
                address and complete your account setup.
              </p>


              <!-- Verification Code Box -->
              <table
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="margin:30px auto 20px auto;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      background-color:#f5f9fb;
                      border:2px dashed #a3d2e8;
                      border-radius:12px;
                      padding:18px 45px;
                    "
                  >

                    <div
                      style="
                        color:#7b8794;
                        font-size:12px;
                        text-transform:uppercase;
                        letter-spacing:2px;
                        margin-bottom:8px;
                      "
                    >
                      Verification Code
                    </div>

                    <div
                      style="
                        color:#2d6f9b;
                        font-size:32px;
                        font-weight:bold;
                        letter-spacing:8px;
                      "
                    >
                      ${code}
                    </div>

                  </td>
                </tr>
              </table>


              <p
                style="
                  margin:20px 0 0 0;
                  color:#8a96a3;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                This code is valid for a limited time.
                Please do not share it with anyone.
              </p>

            </td>
          </tr>


          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div
                style="
                  height:1px;
                  background-color:#dddddd;
                "
              ></div>
            </td>
          </tr>


          <!-- Stay In Touch -->
          <tr>
            <td
              align="center"
              style="
                padding:30px 30px 35px 30px;
              "
            >

              <h3
                style="
                  margin:0;
                  color:#1f2933;
                  font-family:Georgia, 'Times New Roman', serif;
                  font-size:20px;
                "
              >
                Stay in touch
              </h3>

              <p
                style="
                  margin:8px 0 20px 0;
                  color:#7b8794;
                  font-size:13px;
                "
              >
                Follow Moda and discover our latest collections.
              </p>


              <!-- Social Icons -->
              <table
                border="0"
                cellspacing="0"
                cellpadding="0"
                align="center"
              >
                <tr>

                  <!-- Facebook -->
                  <td style="padding:0 5px;">
                    <a
                      href="${process.env.facebookLink}"
                      target="_blank"
                      style="
                        display:inline-block;
                        width:40px;
                        height:40px;
                        line-height:40px;
                        text-align:center;
                        border-radius:50%;
                        background-color:#a3d2e8;
                        color:#1f4260;
                        text-decoration:none;
                        font-weight:bold;
                      "
                    >
                      f
                    </a>
                  </td>


                  <!-- Instagram -->
                  <td style="padding:0 5px;">
                    <a
                      href="${process.env.instegram}"
                      target="_blank"
                      style="
                        display:inline-block;
                        width:40px;
                        height:40px;
                        line-height:40px;
                        text-align:center;
                        border-radius:50%;
                        background-color:#eadbc8;
                        color:#6b5845;
                        text-decoration:none;
                        font-weight:bold;
                      "
                    >
                      ◎
                    </a>
                  </td>


                  <!-- Twitter / X -->
                  <td style="padding:0 5px;">
                    <a
                      href="${process.env.twitterLink}"
                      target="_blank"
                      style="
                        display:inline-block;
                        width:40px;
                        height:40px;
                        line-height:40px;
                        text-align:center;
                        border-radius:50%;
                        background-color:#bacad6;
                        color:#344b5c;
                        text-decoration:none;
                        font-weight:bold;
                      "
                    >
                      X
                    </a>
                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                background-color:#f5f9fb;
                border-top:1px solid #dddddd;
                padding:22px 25px;
              "
            >

              <div
                style="
                  font-family:Georgia, 'Times New Roman', serif;
                  font-size:22px;
                  font-weight:bold;
                  color:#4b91bd;
                "
              >
                Moda
              </div>

              <p
                style="
                  margin:7px 0 0 0;
                  color:#8a96a3;
                  font-size:11px;
                "
              >
                Your style. Your way.
              </p>

              <p
                style="
                  margin:12px 0 0 0;
                  color:#a0aab3;
                  font-size:10px;
                "
              >
                © ${new Date().getFullYear()} Moda. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};