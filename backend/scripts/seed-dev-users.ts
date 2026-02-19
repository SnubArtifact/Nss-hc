
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding development users for Login.tsx...')

  // 0. Ensure a department exists first
  const dept = await prisma.department.upsert({
    where: { name: 'Test Department' },
    update: {},
    create: {
      name: 'Test Department'
    }
  })
  console.log('Created/Found Department:', dept.name, 'ID:', dept.id)
  const deptId = dept.id

  // 1. Member
  await prisma.user.upsert({
    where: { email: 'test-member@nss.org' },
    update: {},
    create: {
      email: 'test-member@nss.org',
      name: 'Test Member',
      role: Role.Member,
      departmentId: deptId
    }
  })
  console.log('Created: test-member@nss.org')

  // 2. HR (2nd Year POR)
  await prisma.user.upsert({
    where: { email: 'test-hr@nss.org' },
    update: {},
    create: {
      email: 'test-hr@nss.org',
      name: 'Test HR',
      role: Role.SecondYearPORHolder,
      specificPosition: 'HR Head', // Using a valid position from our constants
      departmentId: deptId
    }
  })
  console.log('Created: test-hr@nss.org')

  // 3. Coordinator
  await prisma.user.upsert({
    where: { email: 'test-coordinator@nss.org' },
    update: {},
    create: {
      email: 'test-coordinator@nss.org',
      name: 'Test Coordinator',
      role: Role.Coordinator,
      departmentId: deptId
    }
  })
  console.log('Created: test-coordinator@nss.org')

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
