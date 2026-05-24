const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 [Pre-deploy] Starting backend compilation & isolation...')

try {
  // 1. Build the Express API (Pre-generates Prisma Client and compiles typescript)
  console.log('📦 Compiling typescript and generating Prisma Client...')
  execSync('pnpm --filter @hireflow/express-api build', { 
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' }
  })

  // 2. Clean the target isolation folder
  const deployDir = path.join(__dirname, '../dist/backend-deploy')
  console.log(`🧹 Clearing previous deployment directory: ${deployDir}`)
  fs.rmSync(deployDir, { recursive: true, force: true })

  // 3. Run pnpm deploy legacy command to isolate package
  console.log('🚚 Isolating backend package with its production workspace dependencies...')
  execSync('pnpm --filter @hireflow/express-api --prod deploy --legacy dist/backend-deploy', { 
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' }
  })

  // 4. Copy the .env file to bypass Spark Plan Secret Manager constraints
  const envSource = path.join(__dirname, '../backend/express-api/.env')
  const envDest = path.join(deployDir, '.env')
  console.log(`🔑 Copying environment file from ${envSource} to ${envDest}...`)
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, envDest)
    console.log('✅ Environment file copied successfully!')
  } else {
    console.warn('⚠️ No .env file found in backend/express-api/.env! Make sure configuration variables are set.')
  }

  console.log('✅ [Pre-deploy] Backend isolated successfully in dist/backend-deploy!')
} catch (error) {
  console.error('❌ [Pre-deploy] Failed:', error.message)
  process.exit(1)
}
