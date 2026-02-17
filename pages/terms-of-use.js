import React from "react";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { BiArrowFromLeft } from "react-icons/bi";

export default function facs() {
  const handleCallButtonClick = (event) => {
    event.preventDefault();
    if (window.innerWidth >= 400) {
      alert("Our phone number: 813-252-0727");
    } else {
      window.location.href = "tel:8132520727";
    }
  };
  return (
    <>
      <Layout
        title='Terms of use | Stat Surgical Supply'
        description='Read the Terms of Use for STAT Surgical Supply. Understand the legal agreement for using our website and services, including purchases, payments, and user responsibilities.'
        schema={[]}
      >
        <div className='card p-5 mb-10'>
          <h1 className='section__title'>
            Terms of use | Stat Surgical Supply
          </h1>
          <br />
          <h2 className='section__subtitle'>Last updated October 23, 2023</h2>
          <p>
            This Terms of Use Agreement (“Agreement”), constitutes a legally
            binding agreement made between you, whether personally or on behalf
            of an entity (“user” or “you”) and Stat Surgical Supply LLC and its
            affiliated companies, Websites, applications and tools
            (collectively, Stat Surgical Supply LLC, “Company” or “we” or “us”
            or “our”), concerning your access to and use of the
            www.statsurgicalsupply.com Website(s) as well as any other media
            form, media channel, mobile website or mobile application related or
            connected thereto (collectively, the “Sites”). The Sites provide the
            following service: Stat Surgical Supply LLC sells in-date high-end
            surgical disposables to surgical facilities and businesses in the
            medical device industry. (“Company Services”). Supplemental terms
            and conditions or documents that may be posted on the Sites from
            time to time, are hereby expressly incorporated into this Agreement
            by reference.
          </p>
          <br />
          <p>
            Company makes no representation that the Sites is appropriate or
            available in other locations other than where it is operated by
            Company. The information provided on the Sites is not intended for
            distribution to or use by any person or entity in any jurisdiction
            or country where such distribution or use would be contrary to law
            or regulation or which would subject Company to any registration
            requirement within such jurisdiction or country. Accordingly, those
            persons who choose to access the Sites from other locations do so on
            their own initiative and are solely responsible for compliance with
            local laws, if and to the extent local laws are applicable.
          </p>
          <br />
          <p>
            All users who are minors in the jurisdiction in which they reside
            (generally under the age of 18) are not permitted to register for
            the Sites or use the Company Services.
          </p>
          <br />
          <p>
            YOU ACCEPT AND AGREE TO BE BOUND BY THIS AGREEMENT BY ACKNOWLEDGING
            SUCH ACCEPTANCE DURING THE REGISTRATION PROCESS (IF APPLICABLE) AND
            ALSO BY CONTINUING TO USE THE SITES. IF YOU DO NOT AGREE TO ABIDE BY
            THIS AGREEMENT, OR TO MODIFICATIONS THAT COMPANY MAY MAKE TO THIS
            AGREEMENT IN THE FUTURE, DO NOT USE OR ACCESS OR CONTINUE TO USE OR
            ACCESS THE COMPANY SERVICES OR THE SITES.
          </p>
          <br />
          <h2>PURCHASES; PAYMENT</h2>
          <p>
            {" "}
            Stat Surgical Supply LLC will bill you through a payment provider
            for our Services. By using our paid options you agree to pay Stat
            Surgical Supply LLC all charges at the prices then in effect for the
            products or services you or other persons using your billing account
            may purchase, and you authorize Stat Surgical Supply LLC to charge
            your chosen payment provider for any such purchases. You agree to
            make payment using that selected payment method. If you have ordered
            a product or service that is subject to recurring charges then you
            agree to us charging your payment method on a recurring basis,
            without requiring your prior approval from you for each recurring
            charge until such time as you cancel the applicable product or
            service. Stat Surgical Supply LLC reserves the right to correct any
            errors or mistakes in pricing that it makes even if it has already
            requested or received payment. Sales tax will be added to the sales
            price of purchases as deemed required by Company. Company may change
            prices at any time. All payments shall be in U.S. dollars.
          </p>
          <br />
          <h2>REFUND AND RETURN</h2>
          <p>
            For more information on our return and refund policy, please visit.{" "}
            <Link
              href='/return-policy'
              className='font-bold underline'
              title='Return Policy, Surgical Supplies'
            >
              www.statsurgicalsupply.com/return-policy{" "}
            </Link>
            .
          </p>
          <br />
          <h2>USER REPRESENTATIONS</h2>
          <h3>Regarding Your Registration</h3>
          <p>
            By using the Stat Surgical Supply LLC Services, you represent and
            warrant that:
            <br />
            <br />
            <strong>A.</strong> all registration information you submit is
            truthful and accurate;
            <br />
            <strong>B.</strong> you will maintain the accuracy of such
            information;
            <br />
            <strong>C.</strong> you will keep your password confidential and
            will be responsible for all use of your password and account;
            <br />
            <strong>D.</strong> you are not a minor in the jurisdiction in which
            you reside, or if a minor, you have received parental permission to
            use our Sites;
            <br />
            <strong>E.</strong> your use of the Company Services does not
            violate any applicable law or regulation.
            <br />
            <br />
            You also agree to:
            <br />
            <br />
            <strong>(a)</strong> provide true, accurate, current and complete
            information about yourself as prompted by the Sites registration
            form.
            <br />
            <strong>(b)</strong> maintain and promptly update registration data
            to keep it true, accurate, current and complete.
            <br />
            <br />
            If you provide any information that is untrue, inaccurate, not
            current or incomplete, or Company has reasonable grounds to suspect
            that such information is untrue, inaccurate, not current or
            incomplete, Company has the right to suspend or terminate your
            account and refuse any and all current or future use of the Sites
            (or any portion thereof). We reserve the right to remove or reclaim
            or change a user name you select if we determine appropriate in our
            discretion, such as when the user name is obscene or otherwise
            objectionable or when a trademark owner complains about a username
            that does not closely relate to a user&apos;s actual name.
          </p>
          <br />
          <h3>Regarding Content You Provide</h3>
          <p>
            We may invite you to chat or participate in blogs, message boards,
            online forums and other functionality and may provide you with the
            opportunity to create, submit, post, display, transmit, perform,
            publish, distribute or broadcast content and materials to our Sites
            and/or to or via the Sites&apos;forms, emails, chat agents, popups,
            including, without limitation, text, writings, video, audio,
            photographs, graphics, comments, suggestions or personally
            identifiable information or other material (collectively
            &quot;Contributions&quot;). Any Contributions you transmit to Stat
            Surgical Supply LLC will be treated as non-confidential and
            non-proprietary. When you create or make available a Contribution,
            you thereby represent and warrant that:
            <br />
            <br />
            <strong>A.</strong> the creation, distribution, transmission, public
            display and performance, accessing, downloading and copying of your
            Contribution does not and will not infringe the proprietary rights,
            including but not limited to the copyright, patent, trademark, trade
            secret or moral rights of any third party;
            <br />
            <strong>B.</strong> you are the creator and owner of or have the
            necessary licenses, rights, consents, releases and permissions to
            use and to authorize Stat Surgical Supply LLC and the Sites&apos;
            users to use your Contributions as necessary to exercise the
            licenses granted by you under this Agreement;
            <br />
            <strong>C.</strong> you have the written consent, release, and/or
            permission of each and every identifiable individual person in the
            Contribution to use the name or likeness of each and every such
            identifiable individual person to enable inclusion and use of the
            Contribution in the manner contemplated by our Sites;
            <br />
            <strong>D.</strong> your Contribution is not obscene, lewd,
            lascivious, filthy, violent, harassing or otherwise objectionable
            (as determined by Stat Surgical Supply LLC), libelous or slanderous,
            does not ridicule, mock, disparage, intimidate or abuse anyone, does
            not advocate the violent overthrow of any government, does not
            incite, encourage or threaten physical harm against another, does
            not violate any applicable law, regulation, or rule, and does not
            violate the privacy or publicity rights of any third party;
            <br />
            <strong>E.</strong> your Contribution does not contain material that
            solicits personal information from anyone under 18 or exploit people
            under the age of 18 in a sexual or violent manner, and does not
            violate any federal or state law concerning child pornography or
            otherwise intended to protect the health or well-being of minors;
            <br />
            <strong>F.</strong> your Contribution does not include any offensive
            comments that are connected to race, national origin, gender, sexual
            preference or physical handicap;
            <br />
            <strong>G.</strong> your Contribution does not otherwise violate, or
            link to material that violates, any provision of this Agreement or
            any applicable law or regulation.
          </p>
          <br />
          <h2>CONTRIBUTION LICENSE</h2>
          <p>
            By posting Contributions to any part of the Sites, or making them
            accessible to the Sites by linking your account to any of your
            social network accounts, you automatically grant, and you represent
            and warrant that you have the right to grant, to Stat Surgical
            Supply LLC an unrestricted, unconditional, unlimited, irrevocable,
            perpetual, non-exclusive, transferable, royalty-free, fully-paid,
            worldwide right and license to host, use, copy, reproduce, disclose,
            sell, resell, publish, broadcast, retitle, archive, store, cache,
            publicly perform, publicly display, reformat, translate, transmit,
            excerpt (in whole or in part) and distribute such Contributions
            (including, without limitation, your image and voice) for any
            purpose, commercial, advertising, or otherwise, to prepare
            derivative works of, or incorporate into other works, such
            Contributions, and to grant and authorize sublicenses of the
            foregoing. The use and distribution may occur in any media formats
            and through any media channels. Such use and distribution license
            will apply to any form, media, or technology now known or hereafter
            developed, and includes our use of your name, company name, and
            franchise name, as applicable, and any of the trademarks, service
            marks, trade names and logos, personal and commercial images you
            provide. Company does not assert any ownership over your
            Contributions; rather, as between us and you, subject to the rights
            granted to us in this Agreement, you retain full ownership of all of
            your Contributions and any intellectual property rights or other
            proprietary rights associated with your Contributions. We will not
            use your contribution in a way that infringes on your rights and
            always process your personal information lawfully and with your
            consent.
            <br />
            <br />
            Company has the right, in our sole and absolute discretion, to
            <br />
            <strong>(i)</strong> edit, redact or otherwise change any
            Contributions,
            <br />
            <strong>(ii)</strong> re-categorize any Contributions to place them
            in more appropriate locations or
            <br />
            <strong>(iii)</strong> pre-screen or delete any Contributions that
            are determined to be inappropriate or otherwise in violation of this
            Agreement.
            <br />
            <br />
            By uploading your Contributions to the Sites, you hereby authorize
            Company to grant to each end user a personal, limited,
            no-transferable, perpetual, non-exclusive, royalty-free, fully-paid
            license to access, download, print and otherwise use your
            Contributions for their internal purposes and not for distribution,
            transfer, sale or commercial exploitation of any kind.
          </p>
          <br />
          <h2>SUBMISSIONS</h2>
          <p>
            You acknowledge and agree that any questions, comments, suggestions,
            ideas, feedback or other information about the Sites or the Stat
            Surgical Supply LLC Services (&quot;Submissions&quot;) provided by
            you to Stat Surgical Supply LLC are non-confidential and Stat
            Surgical Supply LLC (as well as any designee of Company) shall be
            entitled to the unrestricted use and dissemination of these
            Submissions for any purpose, commercial or otherwise, without
            acknowledgment or compensation to you.
          </p>
          <br />
          <h2>PROHIBITED ACTIVITIES</h2>
          <p>
            You may not access or use the Sites for any other purpose other than
            that for which Stat Surgical Supply LLC makes it available. The
            Sites may not be used in connection with any commercial endeavors
            except those that are specifically endorsed or approved by Stat
            Surgical Supply LLC. Prohibited activity includes, but is not
            limited to:
            <br />
            <br />
            <strong>A.</strong> attempting to bypass any measures of the Sites
            designed to prevent or restrict access to the Sites, or any portion
            of the Sites
            <br />
            <strong>B.</strong> attempting to impersonate another user or person
            or using the username of another user
            <br />
            <strong>C.</strong> criminal or tortious activity
            <br />
            <strong>D.</strong> deciphering, decompiling, disassembling or
            reverse engineering any of the software comprising or in any way
            making up a part of the Sites
            <br />
            <strong>E.</strong> deleting the copyright or other proprietary
            rights notice from any Sites&apos; content
            <br />
            <strong>F.</strong> engaging in any automated use of the system,
            such as using any data mining, robots or similar data gathering and
            extraction tools
            <br />
            <strong>G.</strong> except as may be the result of standard search
            engine or Internet browser usage, using or launching, developing or
            distributing any automated system, including, without limitation,
            any spider, robot (or &quot;bot&quot;), cheat utility, scraper or
            offline reader that accesses the Sites, or using or launching any
            unauthorized script or other software
            <br />
            <strong>H.</strong> harassing, annoying, intimidating or threatening
            any Company employees or agents engaged in providing any portion of
            the Company Services to you
            <br />
            <strong>I.</strong> interfering with, disrupting, or creating an
            undue burden on the Sites or the networks or services connected to
            the Sites
            <br />
            <strong>J.</strong> making any unauthorized use of the Company
            Services, including collecting usernames and/or email addresses of
            users by electronic or other means for the purpose of sending
            unsolicited email, or creating user accounts by automated means or
            under false pretenses
            <br />
            <strong>K.</strong> selling or otherwise transferring your profile
            <br />
            <strong>L.</strong> tricking, defrauding or misleading Company and
            other users, especially in any attempt to learn sensitive account
            information such as passwords
            <br />
            <strong>M.</strong> systematic retrieval of data or other content
            from the Sites to create or compile, directly or indirectly, a
            collection, compilation, database or directory without written
            permission from Company
            <br />
            <strong>N.</strong> using any information obtained from the Sites in
            order to harass, abuse, or harm another person
            <br />
            <strong>O.</strong> using the Company Services as part of any effort
            to compete with Company or to provide services as a service bureau
            <br />
            <strong>P.</strong> using the Sites in a manner inconsistent with
            any and all applicable laws and regulation
          </p>
          <br />
          <h2>INTELLECTUAL PROPERTY RIGHTS</h2>
          <p>
            The content on the Sites (“Stat Surgical Supply LLC Content”) and
            the trademarks, service marks and logos contained therein (“Marks”)
            are owned by or licensed to Stat Surgical Supply LLC, and are
            subject to copyright and other intellectual property rights under
            United States and foreign laws and international conventions. Stat
            Surgical Supply LLC Content, includes, without limitation, all
            source code, databases, functionality, software, Sites&apos;
            designs, audio, video, text, photographs and graphics. All Stat
            Surgical Supply LLC graphics, logos, designs, page headers, button
            icons, scripts and service names are registered trademarks, common
            law trademarks or trade dress of Stat Surgical Supply LLC in the
            United States and/or other countries. Stat Surgical Supply LLC
            trademarks and trade dress may not be used, including as part of
            trademarks and/or as part of domain names, in connection with any
            product or service in any manner that is likely to cause confusion
            and may not be copied, imitated, or used, in whole or in part,
            without the prior written permission of the Stat Surgical Supply
            LLC.
            <br />
            <br />
            Stat Surgical Supply LLC Content on the Sites is provided to you “AS
            IS” for your information and personal use only and may not be used,
            copied, reproduced, aggregated, distributed, transmitted, broadcast,
            displayed, sold, licensed, or otherwise exploited for any other
            purposes whatsoever without the prior written consent of the
            respective owners. Provided that you are eligible to use the Sites,
            you are granted a limited license to access and use the Sites and
            the Stat Surgical Supply LLC Content and to download or print a copy
            of any portion of the Stat Surgical Supply LLC Content to which you
            have properly gained access solely for your personal, non-commercial
            use. Stat Surgical Supply LLC reserves all rights not expressly
            granted to you in and to the Sites and Stat Surgical Supply LLC
            Content and Marks.
          </p>
          <br />
          <h2>THIRD PARTY WEBSITES AND CONTENT</h2>
          <p>
            The Sites contains (or you may be sent through the Sites or the Stat
            Surgical Supply LLC Services) links to other websites (&quot;Third
            Party Websites&quot;) as well as articles, photographs, text,
            graphics, pictures, designs, music, sound, video, information,
            applications, software and other content or items belonging to or
            originating from third parties (the &quot;Third Party
            Content&quot;). Such Third Party Websites and Third Party Content
            are not investigated, monitored or checked for accuracy,
            appropriateness, or completeness by us, and we are not responsible
            for any Third Party accessed through the Sites or any Third Party
            Content posted on, available through or installed from the Sites,
            including the content, accuracy, offensiveness, opinions,
            reliability, privacy practices or other policies of or contained in
            the Third Party Websites or the Third Party Content. Inclusion of,
            linking to or permitting the use or installation of any Third Party
            Websites or any Third Party Content does not imply approval or
            endorsement thereof by us. If you decide to leave the Sites and
            access the Third Party Websites or to use or install any Third Party
            Content, you do so at your own risk and you should be aware that our
            terms and policies no longer govern. You should review the
            applicable terms and policies, including privacy and data gathering
            practices, of any websites to which you navigate from the Sites or
            relating to any applications you use or install from the Sites. Any
            purchases you make through Third Party Websites will be through
            other websites and from other companies, and Stat Surgical Supply
            LLC takes no responsibility whatsoever in relation to such purchases
            which are exclusively between you and the applicable third party.
          </p>
          <br />
          <h2>SITE MANAGEMENT</h2>
          <p>
            Stat Surgical Supply LLC reserves the right but does not have the
            obligation to:
            <br />
            <strong>A.</strong> monitor the Sites for violations of this
            Agreement;
            <br />
            <strong>B.</strong> take appropriate legal action against anyone
            who, in Stat Surgical Supply LLC sole discretion, violates this
            Agreement, including without limitation, reporting such user to law
            enforcement authorities;
            <br />
            <strong>C.</strong> in Stat Surgical Supply LLC sole discretion and
            without limitation, refuse, restrict access to or availability of,
            or disable (to the extent technologically feasible) any user&rsquo;s
            contribution or any portion thereof that may violate this Agreement
            or any Stat Surgical Supply LLC policy;
            <br />
            <strong>D.</strong> in Company&rsquo;s sole discretion and without
            limitation, notice or liability to remove from the Sites or
            otherwise disable all files and content that are excessive in size
            or are in any way burdensome to Stat Surgical Supply LLC &apos;s
            systems;
            <br />
            <strong>E.</strong> otherwise manage the Sites in a manner designed
            to protect the rights and property of Stat Surgical Supply LLC and
            others and to facilitate the proper functioning of the Sites.
          </p>
          <br />
          <h2>TERM AND TERMINATION</h2>
          <p>
            This Agreement shall remain in full force and effect while you use
            the Sites or are otherwise a user or member of the Sites, as
            applicable. You may terminate your use or participation at any time,
            for any reason, by following the instructions for terminating user
            accounts in your account settings, if available, or by contacting us
            using the contact information below.
            <br />
            <br />
            WITHOUT LIMITING ANY OTHER PROVISION OF THIS AGREEMENT, COMPANY
            RESERVES THE RIGHT TO, IN COMPANY&rsquo;S SOLE DISCRETION AND
            WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITES AND
            THE COMPANY SERVICES, TO ANY PERSON FOR ANY REASON OR FOR NO REASON
            AT ALL, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY
            REPRESENTATION, WARRANTY OR COVENANT CONTAINED IN THIS AGREEMENT, OR
            OF ANY APPLICABLE LAW OR REGULATION, AND COMPANY MAY TERMINATE YOUR
            USE OR PARTICIPATION IN THE SITES AND THE COMPANY SERVICES, DELETE
            YOUR PROFILE AND ANY CONTENT OR INFORMATION THAT YOU HAVE POSTED AT
            ANY TIME, WITHOUT WARNING, IN COMPANY&rsquo;S SOLE DISCRETION.
            <br />
            <br />
            In order to protect the integrity of the Sites and Company Services,
            Company reserves the right at any time in its sole discretion to
            block certain IP addresses from accessing the Sites and Company
            Services.
            <br />
            <br />
            Any provisions of this Agreement that, in order to fulfill the
            purposes of such provisions, need to survive the termination or
            expiration of this Agreement, shall be deemed to survive for as long
            as necessary to fulfill such purposes.
            <br />
            <br />
            YOU UNDERSTAND THAT CERTAIN STATES ALLOW YOU TO CANCEL THIS
            AGREEMENT, WITHOUT ANY PENALTY OR OBLIGATION, AT ANY TIME PRIOR TO
            MIDNIGHT OF COMPANY&rsquo;S THIRD BUSINESS DAY FOLLOWING THE DATE OF
            THIS AGREEMENT, EXCLUDING SUNDAYS AND HOLIDAYS. TO CANCEL, CALL A
            COMPANY CUSTOMER CARE REPRESENTATIVE DURING NORMAL BUSINESS HOURS
            USING THE CONTACT INFORMATION LISTING BELOW IN THIS AGREEMENT OR BY
            ACCESSING YOUR ACCOUNT SETTINGS. THIS SECTION APPLIES ONLY TO
            INDIVIDUALS RESIDING IN STATES WITH SUCH LAWS.
            <br />
            <br />
            If Company terminates or suspends your account for any reason, you
            are prohibited from registering and creating a new account under
            your name, a fake or borrowed name, or the name of any third party,
            even if you may be acting on behalf of the third party. In addition
            to terminating or suspending your account, Company reserves the
            right to take appropriate legal action, including without limitation
            pursuing civil, criminal, and injunctive redress.
          </p>
          <br />
          <h2>MODIFICATIONS</h2>
          <h3>To Agreement</h3>
          <p>
            Company may modify this Agreement from time to time. Any and all
            changes to this Agreement will be posted on the Sites and revisions
            will be indicated by date. You agree to be bound to any changes to
            this Agreement when you use the Company Services after any such
            modification becomes effective. Company may also, in its discretion,
            choose to alert all users with whom it maintains email information
            of such modifications by means of an email to their most recently
            provided email address. It is therefore important that you regularly
            review this Agreement and keep your contact information current in
            your account settings to ensure you are informed of changes. You
            agree that you will periodically check the Sites for updates to this
            Agreement and you will read the messages we send you to inform you
            of any changes. Modifications to this Agreement shall be effective
            after posting.
          </p>

          <br />
          <h3>To Services</h3>
          <p>
            Company reserves the right at any time to modify or discontinue,
            temporarily or permanently, the Company Services (or any part
            thereof) with or without notice. You agree that Company shall not be
            liable to you or to any third party for any modification, suspension
            or discontinuance of the Company Services.
          </p>
          <br />
          <h2>DISPUTES</h2>
          <h3>Between Users</h3>
          <p>
            If there is a dispute between users of the Sites, or between users
            and any third party, you understand and agree that Company is under
            no obligation to become involved. In the event that you have a
            dispute with one or more other users, you hereby release Company,
            its officers, employees, agents and successors in rights from
            claims, demands and damages (actual and consequential) of every kind
            or nature, known or unknown, suspected and unsuspected, disclosed
            and undisclosed, arising out of or in any way related to such
            disputes and/or the Company Services.
          </p>
          <br />
          <h3>With Company</h3>
          <p>
            {" "}
            <br />
            <br />
            <strong>A. Governing Law; Jurisdiction. </strong>This Agreement and
            all aspects of the Sites and Company Services shall be governed by
            and construed in accordance with the internal laws of the State of
            Florida, without regard to conflict of law provisions. With respect
            to any disputes or claims not subject to informal dispute resolution
            or arbitration (as set forth below), you agree not to commence or
            prosecute any action in connection therewith other than in the state
            and federal courts located in Hillsborough County, State of Florida,
            and you hereby consent to, and waive all defenses of lack of
            personal jurisdiction and forum non conveniens with respect to,
            venue and jurisdiction in such state and federal courts. Application
            of the United Nations Convention on Contracts for the International
            Sale of Goods is excluded from this Agreement. Additionally,
            application of the Uniform Computer Information Transaction Act
            (UCITA) is excluded from this Agreement. In no event shall any
            claim, action or proceeding by you related in any way to the Sites
            or Company Services be instituted more than two (2) years after the
            cause of action arose.
            <br />
            <br />
            <strong>B.Informal Resolution.</strong> To expedite resolution and
            control the cost of any dispute, controversy or claim related to
            this Agreement (&quot;Dispute&quot;), you and Company agree to first
            attempt to negotiate any Dispute (except those Disputes expressly
            provided below) informally for at least thirty (30) days before
            initiating any arbitration or court proceeding. Such informal
            negotiations commence upon written notice from one person to the
            other.
            <br />
            <br />
            <strong>C. Binding Arbitration.</strong> If you and Company are
            unable to resolve a Dispute through informal negotiations, either
            you or Company may elect to have the Dispute (except those Disputes
            expressly excluded below) finally and exclusively resolved by
            binding arbitration. Any election to arbitrate by one party shall be
            final and binding on the other. YOU UNDERSTAND THAT ABSENT THIS
            PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY
            TRIAL. The arbitration shall be commenced and conducted under the
            Commercial Arbitration Rules of the American Arbitration Association
            (&quot;AAA&quot;) and, where appropriate, the AAA&rsquo;s
            Supplementary Procedures for Consumer Related Disputes (&quot;AAA
            Consumer Rules&quot;), both of which are available at the AAA
            website www.adr.org. The determination of whether a Dispute is
            subject to arbitration shall be governed by the Federal Arbitration
            Act and determined by a court rather than an arbitrator. Your
            arbitration fees and your share of arbitrator compensation shall be
            governed by the AAA Consumer Rules and, where appropriate, limited
            by the AAA Consumer Rules. If such costs are determined by the
            arbitrator to be excessive, Company will pay all arbitration fees
            and expenses. The arbitration may be conducted in person, through
            the submission of documents, by phone or online. The arbitrator will
            make a decision in writing, but need not provide a statement of
            reasons unless requested by a party. The arbitrator must follow
            applicable law, and any award may be challenged if the arbitrator
            fails to do so. Except where otherwise required by the applicable
            AAA rules or applicable law, the arbitration will take place in
            Hillsborough County, State of Florida. Except as otherwise provided
            in this Agreement, you and Company may litigate in court to compel
            arbitration, stay proceedings pending arbitration, or to confirm,
            modify, vacate or enter judgment on the award entered by the
            arbitrator.
            <br />
            <br />
            <strong>D. Restrictions.</strong> You and Company agree that any
            arbitration shall be limited to the Dispute between Company and you
            individually. To the full extent permitted by law, (1) no
            arbitration shall be joined with any other; (2) there is no right or
            authority for any Dispute to be arbitrated on a class-action basis
            or to utilize class action procedures; and (3) there is no right or
            authority for any Dispute to be brought in a purported
            representative capacity on behalf of the general public or any other
            persons.
            <br />
            <br />
            <strong>
              E. Exceptions to Informal Negotiations and Arbitration.
            </strong>{" "}
            You and Company agree that the following Disputes are not subject to
            the above provisions concerning informal negotiations and binding
            arbitration: (1) any Disputes seeking to enforce or protect, or
            concerning the validity of any of your or Company&rsquo;s
            intellectual property rights; (2) any Dispute related to, or arising
            from, allegations of theft, piracy, invasion of privacy or
            unauthorized use; and (3) any claim for injunctive relief. If this
            Section is found to be illegal or unenforceable then neither you nor
            Company will elect to arbitrate any Dispute falling within that
            portion of this Section found to be illegal or unenforceable and
            such Dispute shall be decided by a court of competent jurisdiction
            within the courts listed for jurisdiction above, and you and Company
            agree to submit to the personal jurisdiction of that court.
          </p>
          <br />
          <h2>CORRECTIONS</h2>
          <p>
            Occasionally there may be information on the Sites that contains
            typographical errors, inaccuracies or omissions that may relate to
            service descriptions, pricing, availability, and various other
            information. Company reserves the right to correct any errors,
            inaccuracies or omissions and to change or update the information at
            any time, without prior notice.
          </p>
          <br />
          <h2>DISCLAIMERS</h2>
          <p>
            Company cannot control the nature of all of the content available on
            the Sites. By operating the Sites, Company does not represent or
            imply that Company endorses any blogs, contributions or other
            content available on or linked to by the Sites, including without
            limitation content hosted on third party websites or provided by
            third party applications, or that Company believes contributions,
            blogs or other content to be accurate, useful or non-harmful. We do
            not control and are not responsible for unlawful or otherwise
            objectionable content you may encounter on the Sites or in
            connection with any contributions. The Company is not responsible
            for the conduct, whether online or offline, of any user of the Sites
            or Company Services.
            <br /> <br />
            YOU AGREE THAT YOUR USE OF THE SITES AND COMPANY SERVICES WILL BE AT
            YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, COMPANY, ITS
            OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS DISCLAIM ALL WARRANTIES,
            EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITES AND THE COMPANY
            SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE
            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE AND NON-INFRINGEMENT. COMPANY MAKES NO WARRANTIES OR
            REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITES
            CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO OUR SITES AND
            ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY (A) ERRORS, MISTAKES,
            OR INACCURACIES OF CONTENT AND MATERIALS, (B) PERSONAL INJURY OR
            PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR
            ACCESS TO AND USE OF OUR SITES, (C) ANY UNAUTHORIZED ACCESS TO OR
            USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION
            AND/OR FINANCIAL INFORMATION STORED THEREIN, (D) ANY INTERRUPTION OR
            CESSATION OF TRANSMISSION TO OR FROM THE SITES OR COMPANY SERVICES,
            (E) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE
            TRANSMITTED TO OR THROUGH OUR SITES BY ANY THIRD PARTY, AND/OR (F)
            ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS
            OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT
            POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITES.
            COMPANY DOES NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME
            RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A
            THIRD PARTY THROUGH THE SITES OR ANY HYPERLINKED SITES OR FEATURED
            IN ANY BANNER OR OTHER ADVERTISING, AND COMPANY WILL NOT BE A PARTY
            TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION
            BETWEEN YOU AND THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS
            WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN
            ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE
            CAUTION WHERE APPROPRIATE.
          </p>
          <br />
          <h2>LIMITATIONS OF LIABILITY</h2>
          <p>
            IN NO EVENT SHALL COMPANY OR ITS DIRECTORS, EMPLOYEES, OR AGENTS BE
            LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT,
            CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES,
            INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA OR OTHER DAMAGES
            ARISING FROM YOUR USE OF THE SITES OR COMPANY SERVICES, EVEN IF
            COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN,
            COMPANY&rsquo;S LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND
            REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED
            TO THE AMOUNT PAID, IF ANY, BY YOU TO COMPANY FOR THE COMPANY
            SERVICES DURING THE PERIOD OF THREE (3) MONTHS PRIOR TO ANY CAUSE OF
            ACTION ARISING.
            <br /> <br />
            CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR
            THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY
            TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT
            APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
            <br /> <br />
            IF YOU ARE A CALIFORNIA RESIDENT, YOU WAIVE CALIFORNIA CIVIL CODE
            SECTION 1542, WHICH SAYS: &quot;A GENERAL RELEASE DOES NOT EXTEND TO
            CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS
            FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH, IF KNOWN BY HIM
            MUST HAVE MATERIALLY AFFECTED HIS SETTLEMENT WITH THE DEBTOR.&quot;
          </p>
          <br />
          <h2>INDEMNITY</h2>
          <p>
            You agree to defend, indemnify and hold Company, its subsidiaries,
            and affiliates, and their respective officers, agents, partners and
            employees, harmless from and against, any loss, damage, liability,
            claim, or demand, including reasonable attorneys&rsquo; fees and
            expenses, made by any third party due to or arising out of your
            contributed content, use of the Company Services, and/or arising
            from a breach of this Agreement and/or any breach of your
            representations and warranties set forth above. Notwithstanding the
            foregoing, Company reserves the right, at your expense, to assume
            the exclusive defense and control of any matter for which you are
            required to indemnify Company, and you agree to cooperate, at your
            expense, with Company&rsquo;s defense of such claims. Company will
            use reasonable efforts to notify you of any such claim, action, or
            proceeding which is subject to this indemnification upon becoming
            aware of it.
          </p>
          <br />
          <h2>NOTICES</h2>
          <p>
            Except as explicitly stated otherwise, any notices given to Company
            shall be given by email to the address listed in the contact
            information below. Any notices given to you shall be given to the
            email address you provided during the registration process, or such
            other address as each party may specify. Notice shall be deemed to
            be given twenty-four (24) hours after the email is sent, unless the
            sending party is notified that the email address is invalid. We may
            also choose to send notices by regular mail.
          </p>
          <br />
          <h2>USER DATA</h2>
          <p>
            Our Sites will maintain certain data that you transfer to the Sites
            for the purpose of the performance of the Company Services, as well
            as data relating to your use of the Company Services. Although we
            perform regular routine backups of data, you are primarily
            responsible for all data that you have transferred or that relates
            to any activity you have undertaken using the Company Services. You
            agree that Company shall have no liability to you for any loss or
            corruption of any such data, and you hereby waive any right of
            action against Company arising from any such loss or corruption of
            such data.
          </p>
          <br />
          <h2>ELECTRONIC CONTRACTING</h2>
          <p>
            Your use of the Company Services includes the ability to enter into
            agreements and/or to make transactions electronically. YOU
            ACKNOWLEDGE THAT YOUR ELECTRONIC SUBMISSIONS CONSTITUTE YOUR
            AGREEMENT AND INTENT TO BE BOUND BY AND TO PAY FOR SUCH AGREEMENTS
            AND TRANSACTIONS. YOUR AGREEMENT AND INTENT TO BE BOUND BY
            ELECTRONIC SUBMISSIONS APPLIES TO ALL RECORDS RELATING TO ALL
            TRANSACTIONS YOU ENTER INTO RELATING TO THE COMPANY SERVICES,
            INCLUDING NOTICES OF CANCELLATION, POLICIES, CONTRACTS, AND
            APPLICATIONS. In order to access and retain your electronic records,
            you may be required to have certain hardware and software, which are
            your sole responsibility.
          </p>
          <br />
          <h2>MISCELLANEOUS</h2>
          <p>
            This Agreement constitutes the entire agreement between you and
            Company regarding the use of the Company Services. The failure of
            Company to exercise or enforce any right or provision of this
            Agreement shall not operate as a waiver of such right or provision.
            The section titles in this Agreement are for convenience only and
            have no legal or contractual effect. This Agreement operates to the
            fullest extent permissible by law. This Agreement and your account
            may not be assigned by you without our express written consent.
            Company may assign any or all of its rights and obligations to
            others at any time. Company shall not be responsible or liable for
            any loss, damage, delay or failure to act caused by any cause beyond
            Company&apos;s reasonable control. If any provision or part of a
            provision of this Agreement is unlawful, void or unenforceable, that
            provision or part of the provision is deemed severable from this
            Agreement and does not affect the validity and enforceability of any
            remaining provisions. There is no joint venture, partnership,
            employment or agency relationship created between you and Company as
            a result of this Agreement or use of the Sites and Company Services.
            Upon Company&rsquo;s request, you will furnish Company any
            documentation, substantiation or releases necessary to verify your
            compliance with this Agreement. You agree that this Agreement will
            not be construed against Company by virtue of having drafted them.
            You hereby waive any and all defenses you may have based on the
            electronic form of this Agreement and the lack of signing by the
            parties hereto to execute this Agreement.
          </p>
          <br />
          <h2>CONTACT US</h2>
          <p>
            In order to resolve a complaint regarding the Company Services or to
            receive further information regarding use of the Company Services,
            please contact Company as set forth below or, if any complaint with
            us is not satisfactorily resolved, and you are a California
            resident, you can contact the Complaint Assistance Unit of the
            Division of Consumer Services of the Department of Consumer Affairs
            in writing at 400 &quot;R&quot; Street, Sacramento, California 95814
            or by telephone at 1-916-445-1254.
          </p>
          <br />
          <h2 className='contact__card-title'>Address</h2>
          <a
            onClick={handleCallButtonClick}
            className='contact__button'
            target='_blank'
            title='View on Google Maps, healthcare, surgical supplies'
            href='https://www.google.com/maps/place/100+Ashley+Dr+S+%23600,+Tampa,+FL+33602,+EE.+UU./@27.9446387,-82.4577838,17z/data=!3m1!4b1!4m6!3m5!1s0x88c2c48c390490ab:0x202198cbac670f1a!8m2!3d27.9446387!4d-82.4577838!16s%2Fg%2F11q_6clqzb?entry=ttu'
          >
            100 South Ashley Drive, Suite 600, Tampa, FL 33602
            <BiArrowFromLeft />
          </a>

          <h2 className='contact__card-title'>Phone</h2>

          <a
            href='tel:8132520727'
            onClick={handleCallButtonClick}
            className='contact__button'
            target='_blank'
            title='Call Support, surgical supplies'
          >
            813-252-0727
            <BiArrowFromLeft />
          </a>

          <h2 className='contact__card-title'>Fax</h2>
          <span className='contact__card-data'>813-607-4110 </span>

          <h2 className='contact__card-title'>Email</h2>

          <a
            href='mailto:sales@statsurgicalsupply.com'
            className='contact__button'
            target='_blank'
          >
            sales@statsurgicalsupply.com <BiArrowFromLeft />
          </a>
          <div className='flex justify-end'>
            <h2>Terms of Use (Rev. 1343F05)</h2>
          </div>
        </div>
      </Layout>
    </>
  );
}
