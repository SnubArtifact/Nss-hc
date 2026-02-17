
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // We need to update existing Excomm users to SecondYearPORHolder
  // Since the Prisma Client might not have Excomm anymore, we use $executeRaw
  try {
    const updatedCount = await prisma.$executeRaw`
      UPDATE "User"
      SET role = 'SecondYearPORHolder', "specificPosition" = 'Excomm'
      WHERE role::text = 'Excomm'
    `
    console.log(`Updated ${updatedCount} users from Excomm to SecondYearPORHolder`)
  } catch (error) {
    console.error('Error updating users:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
