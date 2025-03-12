export const EmailHeader = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #1d3557;
        margin: 0;
        padding: 0;
      }
      .container {
        padding: 20px;
      }
      .font-bold {
        font-weight: bold;
      }
      .signature-container {
        text-align: left !important; 
      }
      @media only screen and (max-width: 600px) {
        .signature-container {
          width: 100% !important;
          display: block;
        }
        .signature-logo {
          height: 80px !important;
          width: 80px !important;
        }
        .social-icon {
          margin: 0 !important;
          padding: 0 !important;
          width: 18px !important;
          height: 18px !important;
        }
        .contact-info {
          font-size: 8px !important;
          margin-top: 15px;
        }
        .contact-info p {
          font-size: 8px !important;
          line-height: 1.2 !important;
        }
      }
    </style>
  </head>
  <body>
`;
