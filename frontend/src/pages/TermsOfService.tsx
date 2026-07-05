import Footer from "../components/Footer";

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Header */}
      <div className="mb-12">
        <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
          Legal
        </span>
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-white/40 text-sm">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-white/60 mt-4 leading-relaxed">
          By using Nestor, you agree to these terms. Please read them carefully.
          We've written them in plain language so they're easy to understand.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {[
          {
            title: "1. Acceptance of Terms",
            content: `By accessing or using Nestor, you confirm that you are at least 18 years old, have read and understood these Terms of Service, and agree to be bound by them. If you do not agree, please do not use the platform.`,
          },
          {
            title: "2. What Nestor Is",
            content: `Nestor is an online marketplace that connects property owners (landlords) with people looking to rent or buy property (tenants/buyers) in Bangladesh. We provide the platform — we are not a real estate agency, broker, or party to any agreement between landlords and tenants. We do not own, manage, or control any listed properties.`,
          },
          {
            title: "3. Your Account",
            items: [
              {
                label: "Registration",
                desc: "You must provide accurate, complete information when creating an account. You are responsible for keeping your login credentials secure.",
              },
              {
                label: "One account per person",
                desc: "Each user may only maintain one account. Creating multiple accounts to abuse the platform is not allowed.",
              },
              {
                label: "Account responsibility",
                desc: "You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.",
              },
              {
                label: "Termination",
                desc: "We reserve the right to suspend or terminate accounts that violate these terms, post fraudulent listings, or engage in abusive behavior.",
              },
            ],
          },
          {
            title: "4. Posting Listings",
            items: [
              {
                label: "Accuracy",
                desc: "All listing information must be accurate and up to date. Misleading descriptions, fake photos, or incorrect pricing is strictly prohibited.",
              },
              {
                label: "Ownership",
                desc: "By posting a listing, you confirm that you have the legal right to rent or sell the property.",
              },
              {
                label: "No duplicates",
                desc: "Each property should only be listed once. Duplicate listings will be removed without notice.",
              },
              {
                label: "Removal",
                desc: "Remove your listing promptly once the property is no longer available to avoid wasting users' time.",
              },
              {
                label: "Images",
                desc: "Only upload photos that you own or have the right to use. Do not use stock photos or images of other properties.",
              },
            ],
          },
          {
            title: "5. Prohibited Conduct",
            items: [
              {
                label: "Fraud",
                desc: "Do not post fake listings, impersonate others, or use the platform for any fraudulent purpose.",
              },
              {
                label: "Harassment",
                desc: "Do not harass, threaten, or abuse other users in any way.",
              },
              {
                label: "Spam",
                desc: "Do not send unsolicited messages or use the platform for commercial advertising unrelated to property.",
              },
              {
                label: "Illegal activity",
                desc: "Do not use Nestor for any purpose that violates Bangladeshi law or any applicable regulation.",
              },
              {
                label: "Scraping",
                desc: "Do not use automated tools to scrape, crawl, or extract data from Nestor without our written permission.",
              },
            ],
          },
          {
            title: "6. Our Role & Liability",
            content: `Nestor is a platform — we do not verify every listing or guarantee the accuracy of information posted by users. We are not responsible for any disputes, damages, or losses arising from transactions between landlords and tenants. Always conduct due diligence before renting or buying a property. We strongly recommend viewing properties in person and confirming details directly with the owner before making any payment.`,
          },
          {
            title: "7. Intellectual Property",
            content: `All content created by Nestor — including the logo, design, code, and written content — is owned by Nestor. Content posted by users (listings, photos, descriptions) remains the property of the user, but by posting it you grant Nestor a non-exclusive license to display it on the platform.`,
          },
          {
            title: "8. Service Availability",
            content: `We aim to keep Nestor available at all times but cannot guarantee uninterrupted access. We may perform maintenance, updates, or experience technical issues that temporarily affect availability. We are not liable for any losses caused by downtime or service interruptions.`,
          },
          {
            title: "9. Changes to These Terms",
            content: `We may update these Terms of Service at any time. We will update the "Last updated" date at the top of this page when we do. Continued use of Nestor after changes constitutes acceptance of the new terms. If you disagree with the updated terms, please stop using the platform.`,
          },
          {
            title: "10. Governing Law",
            content: `These Terms are governed by the laws of Bangladesh. Any disputes arising from your use of Nestor shall be subject to the jurisdiction of the courts of Bangladesh.`,
          },
          {
            title: "11. Contact",
            content: `If you have questions about these Terms of Service, please contact us at nowtechdev@gmail.com. We aim to respond to all inquiries within 7 business days.`,
          },
        ].map((section) => (
          <div key={section.title} className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {section.title}
            </h2>
            {"content" in section && (
              <p className="text-white/60 text-sm leading-relaxed">
                {section.content}
              </p>
            )}
            {"items" in section && section.items && (
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <p className="text-white/60 text-sm leading-relaxed">
                      <span className="text-white font-medium">
                        {item.label} —{" "}
                      </span>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
