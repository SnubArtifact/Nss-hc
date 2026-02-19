
import { PrismaClient, Role, User } from '@prisma/client'

const prisma = new PrismaClient()

// CSV URL
const CSV_URL = process.env.SEED_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKXrQVygPNr1UmI0MyY8FpjOpE1s-fFwV2F3fjViQz7ZyZPEJMQ7577p7h-MlW0JmKKlXgzu2KBn6H/pub?output=csv'

// Helper to generate email from ID
// ID format: 2024A8PS1330P
// Email format: f20241330@pilani.bits-pilani.ac.in
function generateEmail(id: string): string | null {
  if (!id) return null

  const trimmedId = id.trim()
  if (trimmedId.length < 8) return null // Basic validation

  // Extract year (first 4 digits)
  const year = trimmedId.substring(0, 4)

  // Extract user ID (last 4 digits before invalid chars, or just last 4 digits of the numeric part)
  // Logic: 2024A8PS1330P -> 1330.
  // Regex to find the last 4 digits?
  // Or simply: regex match `(\d{4}).*(\d{4})`?
  // Let's look at examples: 2024A4PS0438P -> 2024, 0438.
  // 2024B2PS0843P -> 2024, 0843.

  // Regex: Start with 4 digits, then any chars, then 4 digits, then optional chars.
  const match = trimmedId.match(/^(\d{4}).*?(\d{4})/)

  if (match) {
    const extractedYear = match[1]
    const extractedNum = match[2]
    return `f${extractedYear}${extractedNum}@pilani.bits-pilani.ac.in`
  }

  return null
}

async function main() {
  console.log('Fetching CSV data...')
  const response = await fetch(CSV_URL)
  const csvText = await response.text()

  // Parse CSV (Simple parsing assuming standard format, no quoted newlines)
  const lines = csvText.split('\n')
  if (lines.length === 0) {
    throw new Error('CSV is empty')
  }

  const headers = lines[0]?.split(',').map(h => h.trim())
  if (!headers) throw new Error('Could not parse headers')

  // Identify column indices
  const idxDept = headers.indexOf('Dept')
  const idxPOR = headers.indexOf('POR')
  const idxName = headers.indexOf('Name')
  const idxID = headers.indexOf('ID')

  if (idxDept === -1 || idxPOR === -1 || idxName === -1 || idxID === -1) {
    throw new Error('CSV is missing required headers (Dept, POR, Name, ID)')
  }

  console.log('Processing data...')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue

    // Split by comma, handling potential quotes if simple split fails? 
    // For now assuming simple CSV as output by Google Sheets usually doesn't quote unless needed.
    // Google sheets CSV export usually quotes fields with commas.
    // Simple regex split for CSV: 
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
    // Better simple split if we assume no commas in names/titles for now, 
    // OR use a more robust split.
    const row = line.split(',').map(cell => cell.trim())

    // Safely access columns
    const deptName = row[idxDept]
    const por = row[idxPOR]
    const name = row[idxName]
    const id = row[idxID]

    if (!deptName || !name || !por || !id) {
      console.warn(`Skipping incomplete row ${i}: ${line}`)
      continue
    }

    // 1. Ensure Department Exists
    const dept = await prisma.department.upsert({
      where: { name: deptName },
      update: {},
      create: { name: deptName },
    })

    // 2. Determine Role and Email
    let role: Role = Role.Member
    let specificPosition: string | null = null
    const email = generateEmail(id)

    if (!email) {
      console.warn(`Could not generate email for ID: ${id} (Name: ${name}). Skipping user.`)
      continue
    }

    // Map POR to Role
    const porLower = por.toLowerCase()

    if (porLower.includes('coordinator')) {
      role = Role.Coordinator
    } else if (porLower === 'volunteer' || porLower === 'member' || porLower === '') {
      role = Role.Member
    } else {
      // Assume 2nd Year POR
      role = Role.SecondYearPORHolder
      specificPosition = por // Use the exact string from CSV (e.g., "Excomm", "Project Lead")
    }

    // 3. Upsert User
    try {
      await prisma.user.upsert({
        where: { email: email },
        update: {
          name: name,
          role: role,
          specificPosition: specificPosition,
          departmentId: dept.id
        },
        create: {
          email: email,
          name: name,
          role: role,
          specificPosition: specificPosition,
          departmentId: dept.id
        }
      })
      // console.log(`Processed: ${name} (${role}) - ${email}`)
    } catch (e) {
      console.error(`Failed to upsert user ${name} (${email}):`, e)
    }
  }

  // --- MANUAL OVERRIDES & ADDITIONS ---

  console.log('Adding manual users...')

  // Add Aditya (f20241330) as a Member
  // Assuming a default department (e.g., the first one found or created)
  const defaultDept = await prisma.department.upsert({
    where: { name: 'D3' }, // Or any guaranteed dept
    update: {},
    create: { name: 'D3' }
  })

  await prisma.user.upsert({
    where: { email: 'f20241330@pilani.bits-pilani.ac.in' },
    update: {
      role: Role.Member,
      // Keep existing name if present, or update? 
      // User asked to add as member, so enforcing Role.Member
      // But let's assume if they exist from CSV (as POR), we are downgrading?
      // Or if they don't exist, we create.
    },
    create: {
      email: 'f20241330@pilani.bits-pilani.ac.in',
      name: 'Aditya',
      role: Role.Member,
      departmentId: defaultDept.id
    }
  })
  console.log('Manually added/updated: Aditya (f20241330) as Member')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
