import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "f20241330@pilani.bits-pilani.ac.in";

  // Create default department
  const dept = await prisma.department.upsert({
    where: { name: "General" },
    update: {},
    create: {
      name: "General",
    },
  });
  console.log("Department ensured:", dept.name);

  // Create user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Test User",
      role: "Member",
      departmentId: dept.id,
    },
  });

  console.log("User created/updated:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
