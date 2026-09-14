/**
 * Seeds the database with demo data so the prototype can be explored and
 * recorded (for the required video demo) without manual data entry.
 * Run with: npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Profile, Opportunity } = require("./models");

const DEMO_PASSWORD = "Password123!";

async function seed() {
  await sequelize.sync({ force: true });
  console.log("Database synced (all tables recreated).");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---- Users ----
  const admin = await User.create({
    name: "Amara Admin",
    email: "admin@stemaccess.demo",
    passwordHash,
    role: "administrator",
    isApproved: true,
  });

  const student = await User.create({
    name: "Nadia Student",
    email: "student@stemaccess.demo",
    passwordHash,
    role: "student",
    isApproved: true,
  });
  await Profile.create({
    userId: student.id,
    education: "BSc Software Engineering, African Leadership College",
    country: "Ghana",
    skills: ["javascript", "python", "html", "css"],
    interests: ["web development", "artificial intelligence", "cybersecurity"],
    careerGoal: "software engineering",
    bio: "Final-year software engineering student interested in building products that help other women get into tech.",
  });

  const mentor1 = await User.create({
    name: "Dr. Efua Mensah",
    email: "mentor1@stemaccess.demo",
    passwordHash,
    role: "mentor",
    isApproved: true,
  });
  await Profile.create({
    userId: mentor1.id,
    expertise: ["software engineering", "javascript", "career coaching"],
    company: "Google Africa",
    bio: "Senior software engineer mentoring early-career women in tech.",
  });

  const mentor2 = await User.create({
    name: "Grace Achieng",
    email: "mentor2@stemaccess.demo",
    passwordHash,
    role: "mentor",
    isApproved: true,
  });
  await Profile.create({
    userId: mentor2.id,
    expertise: ["data science", "python", "machine learning"],
    company: "Flutterwave",
    bio: "Data scientist passionate about AI for social good in Africa.",
  });

  const partner = await User.create({
    name: "African Tech Foundation",
    email: "partner@stemaccess.demo",
    passwordHash,
    role: "partner_organization",
    isApproved: true,
  });

  // ---- Opportunities ----
  const in30 = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await Opportunity.bulkCreate([
    {
      title: "MEST Africa Software Engineering Scholarship",
      category: "scholarship",
      description: "Full scholarship covering a 1-year software engineering training program for women across Africa.",
      organization: "MEST Africa",
      country: "Ghana",
      fieldOfStudy: "software engineering",
      tags: ["javascript", "software engineering", "web development"],
      deadline: in30(20),
      url: "https://meltwater.org/mest-africa",
      status: "approved",
      createdById: partner.id,
    },
    {
      title: "Women Techmakers AI Internship",
      category: "internship",
      description: "3-month internship applying machine learning to real-world problems, mentorship included.",
      organization: "Women Techmakers",
      country: "Kenya",
      fieldOfStudy: "artificial intelligence",
      tags: ["python", "machine learning", "artificial intelligence"],
      deadline: in30(10),
      url: "https://womentechmakers.com",
      status: "approved",
      createdById: partner.id,
    },
    {
      title: "AfricaHackon Cybersecurity Bootcamp",
      category: "course",
      description: "Free 6-week intensive bootcamp covering network security, ethical hacking, and incident response.",
      organization: "AfricaHackon",
      country: "Nigeria",
      fieldOfStudy: "cybersecurity",
      tags: ["cybersecurity", "networking"],
      deadline: in30(45),
      url: "https://africahackon.com",
      status: "approved",
      createdById: partner.id,
    },
    {
      title: "She Codes Africa Hackathon",
      category: "event",
      description: "48-hour hackathon for women developers building solutions for local communities.",
      organization: "She Codes Africa",
      country: "Nigeria",
      fieldOfStudy: "software engineering",
      tags: ["javascript", "html", "css", "web development"],
      deadline: in30(15),
      url: "https://shecodeafrica.org",
      status: "approved",
      createdById: partner.id,
    },
    {
      title: "Google Africa Developer Scholarship",
      category: "scholarship",
      description: "Scholarship for Android and web development courses through Google's developer training partners.",
      organization: "Google Africa",
      country: "Global",
      fieldOfStudy: "web development",
      tags: ["javascript", "android", "web development"],
      deadline: in30(60),
      url: "https://developers.google.com/africa",
      status: "approved",
      createdById: partner.id,
    },
    {
      title: "Data Science for Social Impact Internship",
      category: "internship",
      description: "Remote internship applying data science and Python to public health datasets across Africa.",
      organization: "Flutterwave Foundation",
      country: "Global",
      fieldOfStudy: "data science",
      tags: ["python", "data science", "machine learning"],
      deadline: in30(25),
      url: "https://flutterwave.com/foundation",
      status: "approved",
      createdById: partner.id,
    },
    {
      title: "Pending Review: Blockchain for Good Fellowship",
      category: "scholarship",
      description: "Awaiting admin approval — submitted by a partner organization.",
      organization: "African Tech Foundation",
      country: "Global",
      fieldOfStudy: "blockchain",
      tags: ["blockchain", "solidity"],
      deadline: in30(40),
      url: "https://example.org",
      status: "pending_approval",
      createdById: partner.id,
    },
  ]);

  console.log("\nSeed complete. Demo accounts (all use the same password):");
  console.log(`  Password for all accounts: ${DEMO_PASSWORD}\n`);
  console.log(`  Administrator : admin@stemaccess.demo`);
  console.log(`  Student       : student@stemaccess.demo`);
  console.log(`  Mentor        : mentor1@stemaccess.demo  (Dr. Efua Mensah — software engineering)`);
  console.log(`  Mentor        : mentor2@stemaccess.demo  (Grace Achieng — data science)`);
  console.log(`  Partner Org   : partner@stemaccess.demo`);

  await sequelize.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
