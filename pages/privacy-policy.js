import React from 'react';
import Layout from '../components/main/Layout';

export default function facs() {
  const handleCallButtonClick = (event) => {
    event.preventDefault();
    if (window.innerWidth >= 400) {
      alert('Our phone number: 813-252-0727');
    } else {
      window.location.href = 'tel:8132520727';
    }
  };
  return (
    <>
      <Layout title="Privacy policy">
        <div className="card p-5 mb-10">
          <h1 className="section__title">Privacy Policy</h1>
          <br />
          <h2 className="section__subtitle">Last updated October 24, 2023</h2>
          <h2>GENERAL</h2>
          <br />
          <p>
            Stat Surgical Supply LLC (&quot;Stat Surgical Supply LLC&quot; or
            &quot;we&quot; or &quot;us&quot; or &quot;our&quot;) respects the
            privacy of everyone (&quot;Sites&apos; visitor&quot;
            &quot;user&quot; or &quot;you&quot;) that uses our website at
            www.statsurgicalsupply.com, as well as other device or online
            applications related or connected thereto (collectively, the
            &quot;Sites&quot;). The following Stat Surgical Supply LLC Privacy
            Notice (&quot;Privacy Notice&quot;) is designed to inform you, as a
            user of the Sites, about the types of personal information that Stat
            Surgical Supply LLC may gather about or collect from you in
            connection with your use of the Sites. It also is intended to
            explain the conditions under which Stat Surgical Supply LLC uses and
            discloses that personal information, and your rights in relation to
            that personal information. The Sites are hosted in the United States
            and is subject to U.S. state and federal law. If you are accessing
            our Sites from other jurisdictions, please be advised that you are
            transferring your personal information to us in the United States,
            and by using our Sites, you are agreeing to that transfer and use of
            your personal information in accordance with this Privacy Notice.
            You also agree to abide to the applicable laws of the State of
            Florida and U.S. federal law concerning your use of the Sites and
            your agreements with us. If your use of the Sites would be unlawful
            in your jurisdiction, please do not use the Sites.
          </p>
          <br />
          <h3>Company Information</h3>

          <br />
          <p className="text-gray-500 font-bold ml-5">
            Stat Surgical Supply LLC
            <br />
            100 South Ashley Drive Suite 600
            <br />
            Tampa, FL 33602
            <br />
            United States.
            <br />
            <a href="mailto:admin@statsurgicalsupply.com" target="_blank">
              Email: admin@statsurgicalsupply.com
            </a>
            <br />
            <a
              href="tel:8132520727"
              onClick={handleCallButtonClick}
              target="_blank"
            >
              Phone: 813-252-0727
            </a>
            <br />
          </p>

          <br />
          <h2>HOW WE COLLECT AND USE YOUR PERSONAL INFORMATION</h2>
          <p>
            Stat Surgical Supply LLC gathers personal information from users of
            the Sites. When you browse our Sites, subscribe to our services or
            contact us through various social or web forms you are voluntarily
            sharing personal information with us. This personal information also
            includes various data that we collect automatically. This may be the
            user’s Internet Protocol (IP) address, operating system, browser
            type and the locations of the Sites the user views right before
            arriving at, while navigating and immediately after leaving the
            Sites. It may also include various technical aspects of user’s
            computer or browser and users browsing habits that are collected
            through cookies. Stat Surgical Supply LLC may analyze various
            mentioned personal information gathered from or about users to help
            Stat Surgical Supply LLC better understand how the Sites are used
            and how to make them better. By identifying patterns and trends in
            usage, Stat Surgical Supply LLC is able to better design the Sites
            to improve users’ experiences, both in terms of content and ease of
            use. From time to time, Stat Surgical Supply LLC may also release
            the anonymized information gathered from the users in the aggregate,
            such as by publishing a report on trends in the usage of the Sites.
            <br />
            <br />
            When we believe disclosure is appropriate, we may disclose your
            information to help investigate, prevent or take other action
            regarding illegal activity, suspected fraud or other wrongdoing; to
            protect and defend the rights, property or safety of Stat Surgical
            Supply LLC, our users, our employees or others; to comply with
            applicable law or cooperate with law enforcement; to enforce our
            Terms of Use or other agreements or policies, in response to a
            subpoena or similar investigative demand, a court order or a request
            for cooperation from a law enforcement or other government agency;
            to establish or exercise our legal rights; to defend against legal
            claims; or as otherwise required by law. In such cases, we may raise
            or waive any legal objection or right available to us. We will
            notify you if permitted before undertaking such disclosures.
            <br />
            <br />
            Stat Surgical Supply LLC reserves the right to transfer all
            information in its possession to a successor organization in the
            event of a merger, acquisition, bankruptcy or other sale of all or a
            portion of Stat Surgical Supply LLC’s assets. Other than to the
            extent ordered by a bankruptcy or other court, the use and
            disclosure of all transferred information will be subject to this
            Privacy Notice, or to a new privacy notice if you are given notice
            of that new privacy notice and are given an opportunity to
            affirmatively opt-out of it.
          </p>
          <br />
          <h2>DO WE USE COOKIES?</h2>
          <p>
            A “Cookie” is a string of information which assigns you a unique
            identification that a website stores on a user’s computer, and that
            the user’s browser provides to the website each time the user
            submits a query to the website. We use cookies on the Sites to keep
            track of services you have used, to record registration information
            regarding your login name and password, to record your user
            preferences, to keep you logged into the Sites and to facilitate
            purchase procedures. Stat Surgical Supply LLC also uses Cookies to
            track the pages that users visit during each of the Sites’ sessions,
            both to help Stat Surgical Supply LLC improve users’ experiences and
            to help Stat Surgical Supply LLC understand how the Sites is being
            used. As with other personal information gathered from users of the
            Sites, Stat Surgical Supply LLC analyzes and discloses in aggregated
            form information gathered using Cookies, so as to help Stat Surgical
            Supply LLC, its partners and others better understand how the Sites
            is being used. SITES’ USERS WHO DO NOT WISH TO HAVE COOKIES PLACED
            ON THEIR COMPUTERS SHOULD SET THEIR BROWSERS TO REFUSE COOKIES
            BEFORE ACCESSING THE SITES, WITH THE UNDERSTANDING THAT CERTAIN
            FEATURES OF THE SITES MAY NOT FUNCTION PROPERLY WITHOUT THE AID OF
            COOKIES. SITES’ USERS WHO REFUSE COOKIES ASSUME ALL RESPONSIBILITY
            FOR ANY RESULTING LOSS OF FUNCTIONALITY.
            <br />
            Stat Surgical Supply LLC currently uses the following cookies on the
            Sites:
            <br />
            <br />
            <strong>Strictly Necessary Cookies:</strong> Shopping cart
            information (&apos;cart&apos; cookie).
            <br />
            <br />
            <strong>Performance Cookies:</strong> Page load time.
            (&apos;loading&apos; cookie) Error rate. (&apos;error&apos; cookie).
            <br />
            <br />
            <strong>Functional Cookies:</strong> Accepted cookies
            (&apos;cookieAccepted&apos; cookie) User logged in
            (&apos;loggedin&apos; cookie).
          </p>

          <br />
          <h2>DO WE SHARE YOUR PERSONAL INFORMATION?</h2>

          <h3>General Provisions</h3>
          <p>
            Stat Surgical Supply LLC contractually prohibits its contractors,
            affiliates, vendors and suppliers from disclosing any personal
            information received from Stat Surgical Supply LLC, other than in
            accordance with this Privacy Notice. These third parties may include
            advertisers, providers of games, utilities, widgets and a variety of
            other third-party applications accessible through the Sites. Stat
            Surgical Supply LLC neither owns nor controls the third-party
            websites and applications accessible through the Sites. Thus, this
            Privacy Notice does not apply to personal information provided to or
            gathered by the third parties that operate them. Before visiting a
            third party, or using a third-party application, whether by means of
            a link on the Sites, directly through the Sites or otherwise, and
            before providing any personal information to any such third party,
            users should inform themselves of the privacy policies and practices
            (if any) of the third party responsible for those Sites or
            applications, and should take those steps necessary to, in those
            users’ discretion, protect their privacy.
          </p>
          <br />
          <h3>Analytics</h3>
          <p>
            We may use third-party vendors, including Google, who use
            first-party cookies (such as the Google Analytics cookie) and
            third-party cookies (such as the DoubleClick cookie) together to
            inform, optimize and serve ads based on your past activity on the
            Sites, including Google Analytics for Display Advertising. The
            personal information collected may be used to, among other things,
            analyze and track data, determine the popularity of certain content
            and better understand online activity. If you do not want any
            personal information to be collected and used by Google Analytics,
            you can install an opt-out in your web browser
            (https://tools.google.com/dlpage/gaoptout/) and/or opt out from
            Google Analytics for Display Advertising or the Google Display
            Network by using Google’s Ads Settings
            (www.google.com/settings/ads).
          </p>
          <br />
          <h3>Social Media</h3>
          <p>
            We may use hyperlinks on the Sites which will redirect you to a
            social network if you click on the respective link. However, when
            you click on a social plug-in, such as Facebook’s &quot;Like&quot;
            button or Twitter’s &quot;tweet&quot; button that particular social
            network&apos;s plugin will be activated and your browser will
            directly connect to that provider’s servers. If you do not use these
            buttons none of your data will be sent to the respective social
            network’s plugin providers. To illustrate this further, imagine the
            scenario where you click on the Facebook’s &quot;Like&quot; button
            on the Sites. Facebook will receive your IP address, the browser
            version and screen resolution, and the operating system of the
            device you have used to access the Sites. Settings regarding privacy
            protection can be found on the websites of these social networks and
            are not within our control.
          </p>
          <br />
          <h3>Third-Party Service Providers</h3>
          <p>
            We may share your personal information, which may include your name
            and contact information (including email address) with our
            authorized service providers that perform certain services on our
            behalf. These services may include fulfilling orders, providing
            customer service and marketing assistance, performing business and
            sales analysis, supporting the Sites’ functionality and supporting
            contests, sweepstakes, surveys and other features offered through
            the Sites. We may also share your name, contact personal information
            and credit card personal information with our authorized service
            providers who process credit card payments. These service providers
            may have access to personal information needed to perform their
            functions but are not permitted to share or use such personal
            information for any other purpose. You can contact us to receive our
            current list of providers.
          </p>
          <br />
          <p>
            If you have opted in to receiving marketing communication from us
            then Stat Surgical Supply LLC may provide your personal information
            to third parties, with your consent, so that those third parties may
            directly contact you about additional products and services. To
            cease having your personal information used for marketing
            communication purposes, you can: <br />• Opt out by clicking on the
            unsubscribe button found in the footer of our emails <br />• Email
            us at &nbsp;
            <a
              href="mailto:sales@statsurgicalsupply.com"
              target="_blank"
              className="font-bold"
            >
              sales@statsurgicalsupply.com
            </a>
          </p>
          <br />
          <h2>SECURITY</h2>
          <p>
            We take the security of your personal information seriously and use
            reasonable electronic, personnel and physical measures to protect it
            from loss, theft, alteration or misuse. However, please be advised
            that even the best security measures cannot fully eliminate all
            risks. We cannot guarantee that only authorized persons will view
            your personal information. We are not responsible for third-party
            circumvention of any privacy settings or security measures.
            <br />
            <br />
            We are dedicated to protect all personal information on the Sites as
            is necessary. However, you are responsible for maintaining the
            confidentiality of your personal information by keeping your
            password and computer/mobile device access confidential. If you have
            an account with Stat Surgical Supply LLC and believe someone has
            gained unauthorized access to it or your account please change your
            password as soon as possible. If you lose control of your account,
            you should notify us immediately.
          </p>
          <br />
          <h2>PRIVACY RIGHTS - EU USERS</h2>
          <p>
            If you reside in the European Union (EU), United Kingdom (UK),
            Switzerland, Norway, Lichtenstein, or Iceland, you have certain data
            protection rights under your local laws.
            <br />
            <br />
            These rights may include:
            <br />
            <br />
            • The right to request access and obtain a copy of your personal
            information
            <br />
            <br />
            • The right to request edits or erasure of your personal information
            <br />
            <br />
            • The right to limit the processing of your personal information
            <br />
            <br />
            • Data portability right (if applicable)
            <br />
            <br />
            • The right to object to the processing of your personal information
            <br />
            <br />
            If Stat Surgical Supply LLC relies on your consent to process your
            personal information, you have the right to withdraw your consent at
            any time. However, please note that this will not alter the validity
            of the processing before its withdrawal.
            <br />
            <br />
            If you wish to exercise any of the mentioned rights please contact
            us by email at sales@statsurgicalsupply.com, or by referring to the
            contact details at the bottom of this Privacy Notice. Stat Surgical
            Supply LLC has 30 days to respond to your request.
            <br />
            <br />
            If you are not satisfied with Stat Surgical Supply LLC&apos;s
            handling of your privacy concerns please note that you have the
            right to complain to your local data protection supervisory
            authority.
            <br />
            <br />
            List of EU supervisory authorities:
            http://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm.
            <br />
            <br />
            Switzerland supervisory authority:
            https://www.edoeb.admin.ch/edoeb/en/home.html.
            <br />
            <br />
            If you have any questions or comments about your privacy rights, you
            may email us at &nbsp;
            <a
              href="mailto:sales@statsurgicalsupply.com"
              target="_blank"
              className="font-bold"
            >
              sales@statsurgicalsupply.com
            </a>
          </p>
          <br />
          <h2>PRIVACY RIGHTS - CALIFORNIA USERS</h2>
          <p>
            Do Not Sell My Personal Information Notice - California Consumer
            Privacy Act (CCPA)
            <br />
            <br />
            Stat Surgical Supply LLC has not disclosed or sold any personal
            information to third parties for a business or commercial purpose in
            the preceding twelve (12) months. Stat Surgical Supply LLC will not
            sell personal information in the future belonging to Sites&apos;
            visitors, users and other consumers.
            <br />
            <br />
            If you are under 18 years of age
            <br />
            <br />
            If you have registered account with Stat Surgical Supply LLC, you
            have the right to request the removal of unwanted personal
            information that you publicly post on our Sites. To request the
            removal of such information, please contact us using the contact
            information provided below. Make sure to include your account&apos;s
            email address and a statement that you reside in California.
            <br />
            <br />
            &quot;Shine the Light Law&quot;
            <br />
            <br />
            California Civil Code Section 1798.83, also known as the &quot;Shine
            The Light&quot; law, permits our users who are California residents
            to request and obtain from us, once a year and free of charge,
            personal information about the personal information (if any) we
            disclosed to third parties for direct marketing purposes in the
            preceding calendar year. If applicable, this personal information
            would include a list of the categories of the personal information
            that was shared and the names and addresses of all third parties
            with which we shared personal information in the immediately
            preceding calendar year. If you are a California resident and would
            like to make such a request, please submit your request in writing
            to the address listed below.
          </p>
          <br />
          <h2>CHIDREN</h2>
          <p>
            The Children&apos;s Online Privacy Protection Act
            (&quot;COPPA&quot;) protects the online privacy of children under 13
            years of age. We do not knowingly collect or maintain personal
            information from anyone under the age of 13, unless or except as
            permitted by law. Any person who provides personal information
            through the Sites represents to us that he or she is 13 years of age
            or older. If we learn that personal information has been collected
            from a user under 13 years of age on or through the Sites, then we
            will take the appropriate steps to cause this personal information
            to be deleted. If you are the parent or legal guardian of a child
            under 13 who has become a member of the Sites or has otherwise
            transferred personal information to the Sites, please contact Stat
            Surgical Supply LLC using our contact personal information below to
            have that child&apos;s account terminated and personal information
            deleted.
          </p>
          <br />
          <h2>DO-NOT-TRACK NOTICE </h2>
          <p>
            Most web browsers and some mobile operating systems include a
            Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate
            to signal your privacy preference not to have data about your online
            browsing activities monitored and collected. Because there is not
            yet a common understanding of how to interpret the DNT signal, the
            Sites currently do not respond to DNT browser signals or mechanisms.
          </p>
          <br />
          <h2>GOVERNING LAW</h2>
          <p>
            Disputes over privacy issues contained in this Privacy Notice will
            be governed by the law of the State of Florida. You also agree to
            abide by any limitation on damages contained in our Terms of Use, or
            other agreement that we have with you.
          </p>
          <br />
          <h2>PRIVACY NOTICE CHANGES</h2>
          <p>
            Stat Surgical Supply LLC may, in its sole discretion, change this
            Privacy Notice from time to time. Any and all changes to Stat
            Surgical Supply LLC’s Privacy Notice will be reflected on this page
            and the date of the new version will be stated at the top of this
            Privacy Notice. Unless stated otherwise, our current Privacy Notice
            applies to all personal information that we have about you and your
            account. Users should regularly check this page for any changes to
            this Privacy Notice. Stat Surgical Supply LLC will always post new
            versions of the Privacy Notice on the Sites. However, Stat Surgical
            Supply LLC may, as determined in its discretion, decide to notify
            users of changes made to this Privacy Notice via email or otherwise.
            Accordingly, it is important that users always maintain and update
            their contact personal information.
          </p>
          <br />
          <h2>CONTACT US</h2>
          <p>
            If you have any questions regarding this Privacy Notice, please
            contact us at:
          </p>
          <br />
          <p className="text-gray-500 font-bold ml-5">
            Stat Surgical Supply LLC
            <br />
            100 South Ashley Drive Suite 600
            <br />
            Tampa, FL 33602
            <br />
            United States.
            <br />
            <a href="mailto:admin@statsurgicalsupply.com" target="_blank">
              Email: admin@statsurgicalsupply.com
            </a>
            <br />
            <a
              href="tel:8132520727"
              onClick={handleCallButtonClick}
              target="_blank"
            >
              Phone: 813-252-0727
            </a>
            <br />
          </p>
          <div class="flex justify-end">
            <h2>Privacy Notice (Rev. 13461BC)</h2>
          </div>
        </div>
      </Layout>
    </>
  );
}
