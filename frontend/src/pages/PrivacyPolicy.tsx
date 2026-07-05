import Footer from "../components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Header */}
      <div className="mb-12">
        <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
          Legal
        </span>
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-white/40 text-sm">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-white/60 mt-4 leading-relaxed">
          At Nestor, we take your privacy seriously. This policy explains what
          data we collect, how we use it, and what rights you have over it. We
          keep this simple and honest — no legal jargon, no surprises.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {[
          {
            title: "1. Who We Are",
            content: `Nestor is a property listing platform based in Bangladesh that connects landlords and tenants directly — without brokers or commission fees. When you use our platform, we collect and process certain personal information to provide you with our services.`,
          },
          {
            title: "2. What Information We Collect",
            items: [
              {
                label: "Account Information",
                desc: "When you register, we collect your name, email address, and phone number.",
              },
              {
                label: "Property Listings",
                desc: "When you post a property, we collect the details you provide including title, description, location, price, and images.",
              },
              {
                label: "Usage Data",
                desc: "We may collect information about how you use the platform such as pages visited, searches made, and properties saved.",
              },
              {
                label: "Device Information",
                desc: "Basic technical information like your browser type and IP address may be collected for security purposes.",
              },
            ],
          },
          {
            title: "3. How We Use Your Information",
            items: [
              {
                label: "To provide our service",
                desc: "Your account information is used to authenticate you and display your listings and saved properties.",
              },
              {
                label: "To improve the platform",
                desc: "Usage data helps us understand how people use Nestor so we can make it better.",
              },
              {
                label: "To communicate with you",
                desc: "We may send you important account-related emails such as password resets or policy updates.",
              },
              {
                label: "To ensure security",
                desc: "We use your information to detect and prevent fraudulent or abusive activity.",
              },
            ],
          },
          {
            title: "4. How We Store Your Data",
            content: `Your data is stored securely on our servers hosted on Render. Passwords are hashed using bcrypt and are never stored in plain text. We use JWT tokens for authentication which expire after 7 days. We take reasonable technical measures to protect your data from unauthorized access.`,
          },
          {
            title: "5. Who We Share Your Data With",
            content: `We do not sell your personal data to anyone. Ever. Your contact information (name and phone number) is visible to other users on property listing pages so that tenants can reach you directly. We do not share your data with advertisers or third-party marketing companies.`,
          },
          {
            title: "6. Your Rights",
            items: [
              {
                label: "Access",
                desc: "You can view your personal information from your dashboard at any time.",
              },
              {
                label: "Edit",
                desc: "You can update your profile information from your account settings.",
              },
              {
                label: "Delete",
                desc: "You can delete your listings at any time from your dashboard. To delete your account entirely, contact us at nowtechdev@gmail.com.",
              },
              {
                label: "Data Portability",
                desc: "You may request a copy of the data we hold about you by contacting us.",
              },
            ],
          },
          {
            title: "7. Cookies",
            content: `Nestor uses localStorage (not traditional cookies) to store your authentication token and theme preference on your device. We do not use tracking cookies or third-party advertising cookies. You can clear your browser's local storage at any time to remove this data.`,
          },
          {
            title: "8. Third-Party Services",
            content: `We use the following third-party services to operate Nestor: Render for backend hosting and database storage. These services have their own privacy policies and security practices. We do not use Google Analytics, Facebook Pixel, or any advertising trackers.`,
          },
          {
            title: "9. Children's Privacy",
            content: `Nestor is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.`,
          },
          {
            title: "10. Changes to This Policy",
            content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of Nestor after changes means you accept the updated policy.`,
          },
          {
            title: "11. Contact Us",
            content: `If you have any questions, concerns, or requests regarding your privacy or this policy, please contact us at nowtechdev@gmail.com. We aim to respond to all privacy-related requests within 7 business days.`,
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

export default PrivacyPolicy;
