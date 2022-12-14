module.exports = function (UUID, lang) {
  var i18n = require(`./i18n/${lang}.json`);
  var config = require(`../mail_config.json`);

  let html = `
   <!DOCTYPE html>
   <html>
      <head>
         <title>${config.name}</title>
       
         <meta charset="utf-8">
         <meta name="viewport" content="width=device-width, initial-scale=1">
         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
         <style type="text/css">
            /* CLIENT-SPECIFIC STYLES */
            body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;} /* Prevent WebKit and Windows mobile changing default text sizes */
            table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;} /* Remove spacing between tables in Outlook 2007 and up */
            img{-ms-interpolation-mode: bicubic;} /* Allow smoother rendering of resized image in Internet Explorer */
            body{
            background-image: url("http://assets.elhedadi.io:4103/images/backgroundMailing.png");
            background-repeat: no-repeat;
            background-size: cover;
            background-color: #333;
   
   margin: 0;
   
   padding: 0;
            }
            /* RESET STYLES */
            img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}
            table{border-collapse: collapse !important;}
            body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}
            /* iOS BLUE LINKS */
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            }
            /* MOBILE STYLES */
            @media screen and (max-width: 525px) {
            /* ALLOWS FOR FLUID TABLES */
            .wrapper {
            width: 100% !important;
            max-width: 100% !important;
            }
            /* ADJUSTS LAYOUT OF LOGO IMAGE */
            .logo img {
            margin: 0 auto !important;
            }
            /* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */
            .mobile-hide {
            display: none !important;
            }
            .img-max {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            }
            /* FULL-WIDTH TABLES */
            .responsive-table {
            width: 100% !important;
            }
            /* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */
            .padding {
            padding: 10px 5% 15px 5% !important;
            }
            .padding-meta {
            padding: 30px 5% 0px 5% !important;
            text-align: center;
            }
            .no-padding {
            padding: 0 !important;
            }
            .section-padding {
            padding: 50px 15px 50px 15px !important;
            }
            /* ADJUST BUTTONS ON MOBILE */
            .mobile-button-container {
            margin: 0 auto;
            width: 100% !important;
            }
            .mobile-button {
            padding: 15px !important;
            border: 0 !important;
            font-size: 16px !important;
            display: block !important;
            }
            }
            /* ANDROID CENTER FIX */
            div[style*="margin: 16px 0;"] { margin: 0 !important; }
         </style>
      </head>
      <body style="margin: 0 !important; padding: 0 !important;">
      
         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 2.5em;background-image: url('${config.backgroundImage}'); background-repeat: no-repeat; background-size: cover;"  >
            <tr>
               <td  align="center">
                  <!--[if (gte mso 9)|(IE)]>
                  <table align="center" border="0" cellspacing="0" cellpadding="0" width="500">
                     <tr>
                        <td align="center" valign="top" width="500">
                           <![endif]-->
                           <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="wrapper" >
                              <tr>
                                 <td align="center" valign="top"  class="logo">
                                    <a href="http://litmus.com" target="_blank">
                                    <img alt="Logo" src="${config.iconMail}" width="90" height="90" style="display: block; font-family: Helvetica, Arial, sans-serif; color: #ffffff; font-size: 16px;" border="0">
                                    </a>
                                 </td>
                              </tr>
                           </table>
                           <!--[if (gte mso 9)|(IE)]>
                        </td>
                     </tr>
                  </table>
                  <![endif]-->
               </td>
            </tr>
            <tr>
               <td  align="center" class="section-padding">
                  <!--[if (gte mso 9)|(IE)]>
                  <table align="center" border="0" cellspacing="0" cellpadding="0" width="500">
                     <tr>
                        <td align="center" valign="top" width="500">
                           <![endif]-->
                           <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="responsive-table">
                              <tr>
                                 <td>
                                    <!-- HERO IMAGE -->
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                       <tr>
                                          <td>
                                             <!-- COPY -->
                                             <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                   <td align="center" style="font-size: 2.5em; font-family: Roboto, Arial, sans-serif; color: #000000; padding-top: 30px;font-weight: bold;" class="padding">${i18n.object} !</td>
                                                </tr>
                                                <tr>
                                                   <td align="left" style="padding: 24px 0 0 0; font-size: 1.5em; line-height: 25px; font-family: Roboto; color: black;line-height: 28px;font-weight: 300;" class="padding">${i18n.hello}</td>
                                                </tr>
                                                <tr>
                                                   <td align="left" style="padding: 24px 0 0 0; font-size: 1.5em; line-height: 25px; font-family: Roboto; color: black;line-height: 28px;font-weight: 300;" class="padding">
                                                     ${i18n.mail_text}
                                                   </td>
                                                </tr>
                                             </table>
                                          </td>
                                       </tr>
                                       <tr>
                                          <td align="center">
                                             <!-- BULLETPROOF BUTTON -->
                                             <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                   <td align="center" style="padding-top: 25px;" class="padding">
                                                      <table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
                                                         <tr>
                                                            <td align="center" style="border-radius: 3px;width:90px"><a  target="_blank" style="font-size: 1.5em; font-family: Roboto; text-decoration: none;  color: #174872; font-weight: bold ; text-decoration: none; border-radius: 25px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;width:15em;background: linear-gradient(314.33deg, #EDC40C -3.69%, #efcc00 109.82%);" class="mobile-button">${UUID}</a></td>
                                                         </tr>
                                                      </table>
                                                   </td>
                                                </tr>
                                             </table>
                                          </td>
                                       </tr>
                                    </table>
                                    <table>
                                       <tr>
                                          <td align="left" style="padding-top: 25px;" class="padding">
                                             <table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
                                                <tr>
                                                   <td align="left" style="padding: 24px 0 0 0; font-family: Roboto;font-style: normal;font-weight: 300;font-size: 0.5em;line-height: 16px;color: #000000;" class="padding">
                                                   ${i18n.politic1}
 
                                                   </td>
                                                </tr>
                                             </table>
                                             <table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
                                                <tr>
                                                   <td align="left" style="padding: 24px 0 0 0; font-family: Roboto;font-style: normal;font-weight: 300;font-size: 0.5em;line-height: 16px;color: #000000;" class="padding">
                                                   ${i18n.politic2}
                                                   </td>
                                                </tr>
                                             </table>
                                          </td>
                                       </tr>
                                    </table>
   
                                       <table style="width:100%">
                                       <tr>
                                          <td align="left" style="padding-top: 25px;" class="padding">
                                             <table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
                                                <tr>
                                                   <td align="left" style="padding: 24px 0 0 0; font-family: Roboto;font-style: normal;font-weight: 300;font-size: 0.6em;color: #000000;" class="padding">
                                               <p>                                                  ${i18n.team}
                                               ${config.name}
                                               </p>
                                               <p style="color:#7041EE">                                              ${config.website}
                                               </p>
                                               <p style="color:#7041EE">  ${config.mail}</p>
   
   
   
                                                   </td>
                                                   
                                                </tr>
                                             </table>
                                         
                                          </td>
                                          
                                    
                                       </tr>
                                    </table>
   
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="wrapper" >
                              <tr>
                                 <td align="center" valign="top"  class="logo">
                                    <a href="http://litmus.com" target="_blank">
                                    <img alt="Logo" src="${config.logo}" width="40" height="40"  border="0">
                                    </a>
                                    <p style="font-family: Roboto;font-style: normal;font-weight: normal;font-size: 1.5em;line-height: 21px;color: #000000;"> ${config.version}<p/>
                                 </td>
                              </tr>
                           </table>
                                 </td>
                              </tr>
   
                      
                           </table>
                           <!--[if (gte mso 9)|(IE)]>
                        </td>
                     </tr>
                  </table>
                  <![endif]-->
               </td>
            </tr>
         </table>
      </body>
   </html>
       
         `;

  return html;
};
