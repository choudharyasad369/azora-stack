import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase-admin';
import { v2 as cloudinary } from 'cloudinary';
import { Resend } from 'resend';

// Configure services
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function testServices() {
  console.log('🔍 Testing External Services...\n');

  // Test environment variables first
  console.log('📋 Checking Environment Variables:');
  console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
  console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
  console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test Supabase
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    console.log('✅ Supabase Storage: Connected');
    console.log('   Buckets:', data.map(b => b.name).join(', ') || 'No buckets found');
  } catch (error: any) {
    console.log('❌ Supabase Storage: Failed');
    console.log('   Error:', error.message);
  }

  // Test Cloudinary - More detailed
  try {
    console.log('\n🔍 Testing Cloudinary...');
    console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('   API Key:', process.env.CLOUDINARY_API_KEY?.substring(0, 10) + '...');
    console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : 'Missing');
    
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary: Connected');
    console.log('   Response:', result);
  } catch (error: any) {
    console.log('❌ Cloudinary: Failed');
    console.log('   Full Error:', error);
    console.log('   Error Message:', error.message);
    console.log('   Error HTTP Code:', error.http_code);
    
    // Check if credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('   ⚠️  One or more Cloudinary credentials are missing!');
    }
  }

  // Test Resend
  try {
    if (process.env.RESEND_API_KEY?.startsWith('re_')) {
      console.log('✅ Resend: API Key format is valid');
      console.log('   You can test by sending an email from the app');
    } else {
      console.log('⚠️  Resend: API Key format incorrect (should start with re_)');
    }
  } catch (error: any) {
    console.log('❌ Resend: Failed');
    console.log('   Error:', error.message);
  }

  console.log('\n✅ Service check complete!');
}

testServices().catch(console.error);