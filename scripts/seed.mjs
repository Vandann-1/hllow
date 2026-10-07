import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Vandan & Muskaan...");

  // Clean existing data for clean slate
  await prisma.notification.deleteMany();
  await prisma.surprise.deleteMany();
  await prisma.loveLetter.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.fundTransaction.deleteMany();
  await prisma.wish.deleteMany();
  await prisma.specialDate.deleteMany();
  await prisma.coupleSettings.deleteMany();
  await prisma.user.deleteMany();

  const vandanPassword = await bcrypt.hash("vandan123", 10);
  const muskaanPassword = await bcrypt.hash("muskaan123", 10);

  const vandan = await prisma.user.create({
    data: {
      username: "vandan",
      name: "Vandan",
      password: vandanPassword,
      birthday: "1999-05-15",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      onboardingCompleted: false,
      wishesLocked: false,
    },
  });

  const muskaan = await prisma.user.create({
    data: {
      username: "muskaan",
      name: "Muskaan",
      password: muskaanPassword,
      birthday: "2001-08-04",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      onboardingCompleted: false,
      wishesLocked: false,
    },
  });

  // Couple settings: Official relationship start date is 18 December (the proposal!)
  await prisma.coupleSettings.create({
    data: {
      id: "couple",
      relationshipStartDate: "2025-12-18",
      level: 1,
      xp: 0,
      currentStreak: 0,
      bestStreak: 0,
      fundBalance: 0,
    },
  });

  // Seed special dates
  const specialDates = [
    // Relationship milestones
    {
      title: "Connection Began",
      date: "11-18",
      category: "RELATIONSHIP",
      emoji: "✨",
      description: "18 November — The day our paths crossed and talking began",
    },
    {
      title: "The Official Proposal ❤️💍",
      date: "12-18",
      category: "RELATIONSHIP",
      emoji: "💍",
      description: "18 December — When Vandan proposed to Muskaan and we became official",
    },
    // Birthdays
    {
      title: "Muskaan's Birthday",
      date: "08-04",
      category: "BIRTHDAY",
      emoji: "🎂",
      description: "Celebrating the birth of my favorite smile & soul ✨",
    },
    {
      title: "Vandan's Birthday",
      date: "05-15",
      category: "BIRTHDAY",
      emoji: "🎉",
      description: "Celebrating Vandan's special day",
    },
    // Love Days
    { title: "Rose Day", date: "02-07", category: "LOVE_DAY", emoji: "🌹", description: "Crimson roses for my one and only" },
    { title: "Propose Day", date: "02-08", category: "LOVE_DAY", emoji: "💍", description: "Re-proposing forever and always" },
    { title: "Chocolate Day", date: "02-09", category: "LOVE_DAY", emoji: "🍫", description: "Sweet chocolates for my sweetest love" },
    { title: "Teddy Day", date: "02-10", category: "LOVE_DAY", emoji: "🧸", description: "Warm cuddles and adorable memories" },
    { title: "Promise Day", date: "02-11", category: "LOVE_DAY", emoji: "🤝", description: "Promises to hold hands through everything" },
    { title: "Hug Day", date: "02-12", category: "LOVE_DAY", emoji: "🫂", description: "Warmest embrace in the world" },
    { title: "Kiss Day", date: "02-13", category: "LOVE_DAY", emoji: "💋", description: "Gentle whispers & soft kisses" },
    { title: "Valentine's Day", date: "02-14", category: "LOVE_DAY", emoji: "❤️", description: "Celebrating our eternal bond" },
    // Festivals
    { title: "Diwali", date: "11-01", category: "FESTIVAL", emoji: "🪔", description: "Festival of lights & blessings together" },
    { title: "Holi", date: "03-25", category: "FESTIVAL", emoji: "🎨", description: "Colors of happiness & romance" },
    { title: "Navratri", date: "10-03", category: "FESTIVAL", emoji: "💃", description: "Dancing together to the garba beats" },
    { title: "New Year", date: "01-01", category: "FESTIVAL", emoji: "✨", description: "Stepping into another year together" },
  ];

  for (const dateItem of specialDates) {
    await prisma.specialDate.create({
      data: dateItem,
    });
  }

  console.log("Database seeded successfully with clean slate for Vandan & Muskaan!");
  console.log(`Vandan user ID: ${vandan.id}`);
  console.log(`Muskaan user ID: ${muskaan.id}`);
  console.log("Wishes count: 0 (Ready for manual entry)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
