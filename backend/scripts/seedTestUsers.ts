
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding test users...");

  // Ensure General department exists
  const dept = await prisma.department.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General" },
  });

  const testUsers = [
    {
      email: "test-member@nss.org",
      name: "Guest Member",
      role: Role.Member,
    },
    {
      email: "test-hr@nss.org",
      name: "HR Admin",
      role: Role.Excomm, // HR maps to Excomm for approval rights
    },
    {
      email: "test-coordinator@nss.org",
      name: "Coordinator User",
      role: Role.Coordinator,
    },
  ];

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        name: u.name,
        departmentId: dept.id,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        departmentId: dept.id,
      },
    });
    console.log(`Ensured user: ${user.email} (${user.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
