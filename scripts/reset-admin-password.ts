import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const adminEmail = 'admin@azorastack.com';
  const newPassword = 'Admin@123456'; // Change this to whatever you want
  
  console.log('🔄 Resetting admin password...');
  
  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.error('❌ Admin user not found!');
    console.log('Creating new admin user...');
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        emailVerified: true,
        status: 'ACTIVE',
      },
    });
    
    console.log('✅ New admin user created!');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Password: ${newPassword}`);
  } else {
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        password: hashedPassword,
        emailVerified: true,
        status: 'ACTIVE',
      },
    });
    
    console.log('✅ Admin password reset successful!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
  }
}

resetAdminPassword()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });