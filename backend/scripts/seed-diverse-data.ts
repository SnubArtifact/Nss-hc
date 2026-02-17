
import { PrismaClient, Role, HourCategories, LogStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding diverse test data...')

  // 1. Create Coordinator
  await prisma.user.upsert({
    where: { email: 'test-coordinator@nss.org' },
    update: { role: Role.Coordinator, name: 'Coordinator User' },
    create: {
      email: 'test-coordinator@nss.org',
      name: 'Coordinator User',
      role: Role.Coordinator,
      departmentId: 1
    }
  })

  // 2. Create HR (2nd Year POR Holder)
  await prisma.user.upsert({
    where: { email: 'test-hr@nss.org' },
    update: { role: Role.SecondYearPORHolder, specificPosition: 'HR', name: 'HR User' },
    create: {
      email: 'test-hr@nss.org',
      name: 'HR User',
      role: Role.SecondYearPORHolder,
      specificPosition: 'HR',
      departmentId: 1
    }
  })

  // 3. Create Excomm (2nd Year POR Holder)
  await prisma.user.upsert({
    where: { email: 'test-excomm@nss.org' },
    update: { role: Role.SecondYearPORHolder, specificPosition: 'Excomm', name: 'Excomm User' },
    create: {
      email: 'test-excomm@nss.org',
      name: 'Excomm User',
      role: Role.SecondYearPORHolder,
      specificPosition: 'Excomm',
      departmentId: 1
    }
  })

  // 4. Create Members and Logs
  const memberEmails = ['member1@nss.org', 'member2@nss.org']
  for (const email of memberEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Member ${email.split('@')[0]}`,
        role: Role.Member,
        departmentId: 1
      }
    })

    // Add some logs for each member
    await prisma.hourLogs.createMany({
      data: [
        {
          userId: user.id,
          task: 'Volunteering at event',
          category: HourCategories.Event,
          startTime: new Date(Date.now() - 5 * 3600000), // 5 hours ago
          endTime: new Date(Date.now() - 3 * 3600000),   // 3 hours ago
          status: LogStatus.Approved
        },
        {
          userId: user.id,
          task: 'Dept Meeting',
          category: HourCategories.Dept,
          startTime: new Date(Date.now() - 2 * 3600000), // 2 hours ago
          endTime: new Date(Date.now() - 1 * 3600000),   // 1 hour ago
          status: LogStatus.Pending
        }
      ]
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
