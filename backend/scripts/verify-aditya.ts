
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const aditya = await prisma.user.findUnique({
    where: { email: 'f20241330@pilani.bits-pilani.ac.in' }
  })
  console.log('Manual User Check:', aditya)
}
main().finally(() => prisma.$disconnect())
