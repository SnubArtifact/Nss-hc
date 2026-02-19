
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.user.count()
  console.log(`Total users: ${count}`)
  const deptCount = await prisma.department.count()
  console.log(`Total departments: ${deptCount}`)
  const sample = await prisma.user.findFirst({
    where: { email: { contains: 'pilani.bits-pilani.ac.in' } }
  })
  console.log('Sample user from CSV:', sample)
}
main().finally(() => prisma.$disconnect())
