import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
          🏠 Our Story
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Renting in Bangladesh <br />
          <span className="text-emerald-400">Shouldn't Be This Hard</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
          We built Nestor because we were tired of dealing with brokers, fake
          listings, and hidden fees. There had to be a better way — so we built
          it.
        </p>
      </div>

      {/* The Problem */}
      <div className="glass-light rounded-2xl p-8 md:p-10">
        <h2 className="text-2xl font-bold text-white mb-6">
          The Problem We Saw
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "😤",
              title: "Broker Dependency",
              desc: "Finding a home in Bangladesh almost always meant going through a broker — paying a month's rent just to get a viewing.",
            },
            {
              icon: "🚫",
              title: "Fake Listings",
              desc: "Online listings were flooded with duplicates, outdated posts, and properties that didn't exist just to get your number.",
            },
            {
              icon: "💸",
              title: "Hidden Fees",
              desc: 'What started as ৳15,000/month somehow became ৳25,000 after brokerage, advance, and "service charges" appeared.',
            },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-xl p-5">
              <p className="text-3xl mb-3">{item.icon}</p>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Solution */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Our Solution</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Nestor is a direct marketplace between property owners and tenants. No
          middlemen. No commissions. No fake listings. Just real people, real
          properties, and direct contact — the way it should have always been.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "✅",
              title: "Verified Listings Only",
              desc: "Every listing is reviewed before going live. No duplicates, no ghosts.",
            },
            {
              icon: "📞",
              title: "Direct Owner Contact",
              desc: "Call or WhatsApp the owner directly from the listing page.",
            },
            {
              icon: "৳",
              title: "Zero Commission",
              desc: "We charge nothing. What you agree on is what you pay.",
            },
            {
              icon: "🔒",
              title: "Safe & Transparent",
              desc: "Owner details are verified. What you see is what you get.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card rounded-xl p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-emerald-500/15 text-emerald-400 rounded-lg text-lg">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="glass-light rounded-2xl p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6 inline-block">
            Our Mission
          </span>
          <h2 className="text-2xl font-bold text-white mb-4">
            Making Housing Accessible for Every Bangladeshi
          </h2>
          <p className="text-white/60 leading-relaxed max-w-2xl">
            We believe finding a home should be simple, affordable, and
            stress-free — whether you're a student moving to Dhaka for the first
            time, a family searching for more space, or a landlord looking to
            fill a vacancy without the broker drama. Nestor exists to make that
            possible.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Nestor by the Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              value: "5,000+",
              label: "Happy Tenants",
              icon: "😊",
              color: "text-emerald-400",
            },
            {
              value: "1,200+",
              label: "Properties Listed",
              icon: "🏠",
              color: "text-blue-400",
            },
            {
              value: "20+",
              label: "Cities Covered",
              icon: "📍",
              color: "text-purple-400",
            },
            {
              value: "0৳",
              label: "Commission Charged",
              icon: "💰",
              color: "text-yellow-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-white/50 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Built by</h2>
        <p className="text-white/50 mb-8 text-sm">
          A small team that got frustrated with the property market and decided
          to fix it.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              name: "Nowshin",
              role: "Founder & Developer",
              avatar: "N",
              desc: "Built the entire platform from scratch with React, Node.js, and PostgreSQL.",
            },
            {
              name: "The Users",
              role: "Community",
              avatar: "👥",
              desc: "Every piece of feedback shapes how Nestor grows and improves.",
            },
            {
              name: "You",
              role: "Future Contributor",
              avatar: "🚀",
              desc: "Nestor is open source. Found a bug or have an idea? We'd love your help.",
            },
          ].map((member) => (
            <div
              key={member.name}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl mx-auto mb-3">
                {member.avatar}
              </div>
              <h3 className="font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-emerald-400 text-xs mb-3">{member.role}</p>
              <p className="text-white/40 text-sm">{member.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="glass-light rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          What We Stand For
        </h2>
        <div className="space-y-4">
          {[
            {
              label: "Transparency",
              desc: "No hidden fees. No surprise charges. Everything is clear upfront.",
              color: "bg-emerald-400",
            },
            {
              label: "Fairness",
              desc: "Landlords and tenants deserve an equal, honest marketplace.",
              color: "bg-blue-400",
            },
            {
              label: "Simplicity",
              desc: "Finding or listing a property should take minutes, not weeks.",
              color: "bg-purple-400",
            },
            {
              label: "Trust",
              desc: "Every listing and every user is treated with care and accountability.",
              color: "bg-yellow-400",
            },
          ].map((val) => (
            <div key={val.label} className="flex items-start gap-4">
              <div
                className={`w-1 rounded-full self-stretch ${val.color} opacity-70`}
              />
              <div>
                <h3 className="font-semibold text-white mb-0.5">{val.label}</h3>
                <p className="text-white/50 text-sm">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
