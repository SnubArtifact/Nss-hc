
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Adding SecondYearPORHolder to Role enum...')
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE 'SecondYearPORHolder'`)
    console.log('Success.')
  } catch (error: any) {
    console.log('Enum value might already exist or failed:', error.message)
  }

  try {
    console.log('Adding specificPosition column to User...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "specificPosition" TEXT`)
    console.log('Success.')
  } catch (error: any) {
    console.log('Column might already exist or failed:', error.message)
  }

  try {
    console.log('Migrating Excomm users...')
    const updatedCount = await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET role = 'SecondYearPORHolder', "specificPosition" = 'Excomm'
      WHERE role::text = 'Excomm'
    `)
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
