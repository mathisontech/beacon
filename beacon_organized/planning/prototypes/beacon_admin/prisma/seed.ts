import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ==========================================================================
  // 1. Create Superadmin Employee
  // ==========================================================================
  console.log('👤 Creating superadmin employee...');

  const passwordHash = await bcrypt.hash('BeaconDemo2025!', 12);

  const kristin = await prisma.employee.upsert({
    where: { employeeId: 'EMP001' },
    update: {},
    create: {
      employeeId: 'EMP001',
      username: 'kristin',
      email: 'kristin@mathisontech.com',
      name: 'Kristin Mullaney',
      role: 'SUPERADMIN',
      passwordHash,
      twoFactorEnabled: false,
      isActive: true,
    },
  });

  console.log(`   ✓ Created employee: ${kristin.name} (${kristin.employeeId})\n`);

  // ==========================================================================
  // 2. Create Sample Clients
  // ==========================================================================
  console.log('🏢 Creating sample clients...');

  const buffaloFD = await prisma.client.upsert({
    where: { clientId: 'CLI001' },
    update: {},
    create: {
      clientId: 'CLI001',
      name: 'Buffalo Fire Department',
      organizationType: 'Fire Department',
      primaryContact: 'Chief Michael Johnson',
      email: 'mjohnson@buffalofd.gov',
      phone: '716-555-0101',
      jurisdiction: 'City of Buffalo',
      state: 'NY',
      boundingBox: {
        north: 42.9664,
        south: 42.8264,
        east: -78.7934,
        west: -78.9334,
      },
      plan: 'Professional',
      status: 'ACTIVE',
      activatedAt: new Date('2024-06-01'),
      expiresAt: new Date('2025-06-01'),
    },
  });
  console.log(`   ✓ Created client: ${buffaloFD.name} (${buffaloFD.clientId})`);

  const erieCounty = await prisma.client.upsert({
    where: { clientId: 'CLI002' },
    update: {},
    create: {
      clientId: 'CLI002',
      name: 'Erie County Emergency Management',
      organizationType: 'County Government',
      primaryContact: 'Director Sarah Chen',
      email: 'schen@erie.gov',
      phone: '716-555-0202',
      jurisdiction: 'Erie County',
      state: 'NY',
      boundingBox: {
        north: 43.0889,
        south: 42.4717,
        east: -78.4089,
        west: -79.0617,
      },
      plan: 'Trial',
      status: 'TRIAL',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  console.log(`   ✓ Created client: ${erieCounty.name} (${erieCounty.clientId})`);

  const niagaraPD = await prisma.client.upsert({
    where: { clientId: 'CLI003' },
    update: {},
    create: {
      clientId: 'CLI003',
      name: 'Niagara Falls Police Department',
      organizationType: 'Police Department',
      primaryContact: 'Captain Robert Williams',
      email: 'rwilliams@nfpd.gov',
      phone: '716-555-0303',
      jurisdiction: 'City of Niagara Falls',
      state: 'NY',
      boundingBox: {
        north: 43.1147,
        south: 43.0647,
        east: -79.0106,
        west: -79.0706,
      },
      plan: 'Professional',
      status: 'ACTIVE',
      activatedAt: new Date('2024-09-15'),
      expiresAt: new Date('2025-09-15'),
    },
  });
  console.log(`   ✓ Created client: ${niagaraPD.name} (${niagaraPD.clientId})\n`);

  // ==========================================================================
  // 3. Create Client Assignments (Assign all clients to Kristin)
  // ==========================================================================
  console.log('🔗 Creating client assignments...');

  const assignments = [
    { clientId: buffaloFD.id, role: 'Primary' },
    { clientId: erieCounty.id, role: 'Primary' },
    { clientId: niagaraPD.id, role: 'Primary' },
  ];

  for (const assignment of assignments) {
    await prisma.clientAssignment.upsert({
      where: {
        clientId_employeeId: {
          clientId: assignment.clientId,
          employeeId: kristin.id,
        },
      },
      update: {},
      create: {
        clientId: assignment.clientId,
        employeeId: kristin.id,
        role: assignment.role,
      },
    });
  }
  console.log(`   ✓ Assigned ${assignments.length} clients to ${kristin.name}\n`);

  // ==========================================================================
  // 4. Create Sample Map Datasets
  // ==========================================================================
  console.log('🗺️  Creating sample map datasets...');

  const demDataset = await prisma.mapDataset.upsert({
    where: { datasetId: 'DEM-001' },
    update: {},
    create: {
      datasetId: 'DEM-001',
      name: 'DEM Elevation - Buffalo',
      type: 'DEM',
      source: 'USGS',
      version: '1.0.0',
      uploadedBy: kristin.id,
      boundingBox: {
        north: 42.9664,
        south: 42.8264,
        east: -78.7934,
        west: -78.9334,
      },
      status: 'ACTIVE',
      processedAt: new Date('2024-05-15'),
      s3Bucket: 'beacon-geodata',
      s3Key: 'dem/buffalo/dem-001.tif',
      fileSize: BigInt(524288000), // ~500MB
      metadata: {
        resolution: '10m',
        format: 'GeoTIFF',
        crs: 'EPSG:4326',
      },
    },
  });
  console.log(`   ✓ Created dataset: ${demDataset.name} (${demDataset.datasetId})`);

  const landfireDataset = await prisma.mapDataset.upsert({
    where: { datasetId: 'LF-001' },
    update: {},
    create: {
      datasetId: 'LF-001',
      name: 'LANDFIRE Vegetation - Western NY',
      type: 'LANDFIRE',
      source: 'USGS/USFS',
      version: '2.3.0',
      uploadedBy: kristin.id,
      boundingBox: {
        north: 43.2,
        south: 42.0,
        east: -77.5,
        west: -79.8,
      },
      status: 'ACTIVE',
      processedAt: new Date('2024-06-20'),
      s3Bucket: 'beacon-geodata',
      s3Key: 'landfire/western-ny/lf-001.tif',
      fileSize: BigInt(1073741824), // ~1GB
      metadata: {
        resolution: '30m',
        format: 'GeoTIFF',
        layers: ['EVT', 'EVC', 'EVH'],
        crs: 'EPSG:4326',
      },
    },
  });
  console.log(`   ✓ Created dataset: ${landfireDataset.name} (${landfireDataset.datasetId})`);

  const osmDataset = await prisma.mapDataset.upsert({
    where: { datasetId: 'OSM-001' },
    update: {},
    create: {
      datasetId: 'OSM-001',
      name: 'OSM Roads - Erie County',
      type: 'Roads',
      source: 'OpenStreetMap',
      version: '2024-01',
      uploadedBy: kristin.id,
      boundingBox: {
        north: 43.0889,
        south: 42.4717,
        east: -78.4089,
        west: -79.0617,
      },
      status: 'PROCESSING',
      s3Bucket: 'beacon-geodata',
      s3Key: 'osm/erie-county/osm-001.pbf',
      fileSize: BigInt(157286400), // ~150MB
      metadata: {
        format: 'PBF',
        tags: ['highway', 'name', 'surface', 'lanes'],
      },
    },
  });
  console.log(`   ✓ Created dataset: ${osmDataset.name} (${osmDataset.datasetId})\n`);

  // ==========================================================================
  // 5. Create Initial Activity Log Entry
  // ==========================================================================
  console.log('📝 Creating initial activity log...');

  await prisma.activityLog.create({
    data: {
      employeeId: kristin.id,
      action: 'system_initialized',
      target: 'Database',
      details: {
        message: 'Database seeded with initial data',
        clients: 3,
        datasets: 3,
      },
    },
  });
  console.log('   ✓ Created initial activity log entry\n');

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ Database seed completed successfully!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nCreated:');
  console.log('  • 1 Superadmin employee (kristin)');
  console.log('  • 3 Sample clients (Buffalo FD, Erie County EM, Niagara Falls PD)');
  console.log('  • 3 Client assignments');
  console.log('  • 3 Map datasets (DEM, LANDFIRE, OSM Roads)');
  console.log('  • 1 Activity log entry');
  console.log('\nLogin credentials:');
  console.log('  Username: kristin');
  console.log('  Password: BeaconDemo2025!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
