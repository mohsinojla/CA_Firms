/**
 * One-time import script: reads islamabad.json + lahore.json
 * and upserts all firms into Supabase.
 *
 * Run: npx tsx scripts/seed-db.ts
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04',
  MAY: '05', JUN: '06', JUL: '07', AUG: '08',
  SEP: '09', OCT: '10', NOV: '11', DEC: '12',
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null
  const [day, monthAbbr, year] = parts
  const month = MONTH_MAP[monthAbbr.toUpperCase()]
  if (!month) return null
  return `${year}-${month}-${day.padStart(2, '0')}`
}

interface RawMrs {
  name: string
  designation: string
  number: string
}

interface RawFirm {
  to_code: string
  firm_name: string
  approved_wef: string
  city: string
  address: string | null
  email: string | null
  contact_number: string | null
  website: string | null
  hiring_status: string
  mrs: RawMrs
}

interface RawData {
  city: string
  total_firms: number
  firms: RawFirm[]
}

async function seed() {
  console.log('🌱 Starting CA Firms seed...\n')

  // Get city IDs from DB
  const { data: cities, error: citiesErr } = await supabase
    .from('cities')
    .select('id, slug, name')

  if (citiesErr || !cities) {
    console.error('Failed to fetch cities. Did you run the SQL migration first?', citiesErr)
    process.exit(1)
  }

  const cityMap = new Map(cities.map((c) => [c.slug, c]))
  console.log(`Found cities in DB: ${cities.map((c) => c.name).join(', ')}\n`)

  const dataDir = path.join(process.cwd())
  const jsonFiles = [
    { file: 'islamabad.json', slug: 'islamabad' },
    { file: 'lahore.json', slug: 'lahore' },
  ]

  let totalInserted = 0

  for (const { file, slug } of jsonFiles) {
    const filePath = path.join(dataDir, file)

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}, skipping.`)
      continue
    }

    const raw: RawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const city = cityMap.get(slug)

    if (!city) {
      console.warn(`⚠️  City "${slug}" not found in DB, skipping.`)
      continue
    }

    console.log(`📂 Processing ${file} (${raw.firms.length} firms for ${city.name})...`)

    const firmsToInsert = raw.firms.map((f) => ({
      city_id: city.id,
      to_code: f.to_code,
      firm_name: f.firm_name,
      approved_wef: parseDate(f.approved_wef),
      city_name: city.name,
      address: f.address || null,
      email: f.email || null,
      contact_number: f.contact_number || null,
      website: f.website || null,
      hiring_status: f.hiring_status === 'Not Specified' ? 'Not Specified' : f.hiring_status,
      mrs_name: f.mrs?.name || null,
      mrs_designation: f.mrs?.designation || null,
      mrs_number: f.mrs?.number || null,
      is_active: true,
    }))

    // Upsert in batches of 50
    const BATCH_SIZE = 50
    for (let i = 0; i < firmsToInsert.length; i += BATCH_SIZE) {
      const batch = firmsToInsert.slice(i, i + BATCH_SIZE)

      const { error } = await supabase
        .from('firms')
        .upsert(batch, { onConflict: 'to_code,city_id', ignoreDuplicates: false })

      if (error) {
        console.error(`Error inserting batch ${i}–${i + BATCH_SIZE}:`, error)
        process.exit(1)
      }

      totalInserted += batch.length
      process.stdout.write(`  Inserted ${Math.min(i + BATCH_SIZE, firmsToInsert.length)}/${firmsToInsert.length}\r`)
    }

    console.log(`\n  ✅ ${city.name}: ${firmsToInsert.length} firms upserted`)

    // Update firm_count
    await supabase
      .from('cities')
      .update({ firm_count: firmsToInsert.length })
      .eq('id', city.id)
  }

  console.log(`\n🎉 Done! Total firms upserted: ${totalInserted}`)

  // Verify
  const { count } = await supabase
    .from('firms')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Total firms in database: ${count}`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
