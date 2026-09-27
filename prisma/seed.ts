import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await hash('password123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@notixcloud.com' },
    update: {},
    create: {
      email: 'admin@notixcloud.com',
      name: 'Admin User',
      passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  const testUser = await prisma.user.upsert({
    where: { email: 'user@notixcloud.com' },
    update: {},
    create: {
      email: 'user@notixcloud.com',
      name: 'Test User',
      passwordHash,
      role: Role.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created test user:', testUser.email);

  const plans = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small projects and personal websites',
      cpu: 1,
      ram: 2,
      storage: 40,
      bandwidth: 2,
      ipv4Count: 1,
      priceMonthly: 5.99,
      priceYearly: 59.99,
      features: ['1 vCPU', '2 GB RAM', '40 GB NVMe', '2 TB Bandwidth', '1 IPv4', 'DDoS Protection', 'API Access', '99.9% SLA'],
      location: 'US-EAST',
      sortOrder: 1,
    },
    {
      name: 'Standard',
      slug: 'standard',
      description: 'Great for growing applications and small businesses',
      cpu: 2,
      ram: 4,
      storage: 80,
      bandwidth: 4,
      ipv4Count: 1,
      priceMonthly: 11.99,
      priceYearly: 119.99,
      features: ['2 vCPU', '4 GB RAM', '80 GB NVMe', '4 TB Bandwidth', '1 IPv4', 'DDoS Protection', 'API Access', '99.9% SLA', 'Free Backups'],
      location: 'US-EAST',
      sortOrder: 2,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'For demanding applications and medium businesses',
      cpu: 4,
      ram: 8,
      storage: 160,
      bandwidth: 8,
      ipv4Count: 1,
      priceMonthly: 23.99,
      priceYearly: 239.99,
      features: ['4 vCPU', '8 GB RAM', '160 GB NVMe', '8 TB Bandwidth', '1 IPv4', 'DDoS Protection', 'API Access', '99.9% SLA', 'Free Backups', 'Priority Support'],
      location: 'US-EAST',
      sortOrder: 3,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Maximum performance for critical workloads',
      cpu: 8,
      ram: 16,
      storage: 320,
      bandwidth: 16,
      ipv4Count: 2,
      priceMonthly: 47.99,
      priceYearly: 479.99,
      features: ['8 vCPU', '16 GB RAM', '320 GB NVMe', '16 TB Bandwidth', '2 IPv4', 'DDoS Protection', 'API Access', '99.99% SLA', 'Free Backups', 'Priority Support', 'Dedicated IP'],
      location: 'US-EAST',
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.vPSPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  console.log('✅ Created VPS plans');

  const settings = [
    { key: 'site_name', value: 'NOTIXCLOUD', category: 'general' },
    { key: 'site_tagline', value: 'Powerful Infrastructure. Built for Your Projects.', category: 'general' },
    { key: 'maintenance_mode', value: false, category: 'general' },
    { key: 'registration_enabled', value: true, category: 'auth' },
    { key: 'email_verification_required', value: true, category: 'auth' },
    { key: 'default_user_role', value: 'CUSTOMER', category: 'auth' },
    { key: 'stripe_enabled', value: false, category: 'payments' },
    { key: 'paypal_enabled', value: false, category: 'payments' },
    { key: 'crypto_enabled', value: false, category: 'payments' },
    { key: 'default_currency', value: 'USD', category: 'payments' },
    { key: 'tax_rate', value: 0, category: 'payments' },
    { key: 'vps_provisioning_enabled', value: true, category: 'vps' },
    { key: 'default_os_template', value: 'ubuntu-22.04', category: 'vps' },
    { key: 'default_location', value: 'us-east', category: 'vps' },
    { key: 'backup_retention_days', value: 7, category: 'vps' },
    { key: 'max_backups_per_vps', value: 5, category: 'vps' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Created system settings');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });