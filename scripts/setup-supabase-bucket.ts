import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase-admin';

async function setupSupabaseBucket() {
  console.log('🚀 Setting up Supabase Storage bucket...\n');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      process.exit(1);
    }

    const projectsBucket = buckets?.find(b => b.id === 'projects');

    if (projectsBucket) {
      console.log('✅ Bucket "projects" already exists!');
      console.log(`   - Public: ${projectsBucket.public}`);
      console.log(`   - File size limit: ${projectsBucket.file_size_limit ? (projectsBucket.file_size_limit / 1024 / 1024).toFixed(0) + 'MB' : 'No limit'}`);
    } else {
      console.log('📦 Creating "projects" bucket...');
      
      // Create the bucket
      const { data, error } = await supabaseAdmin.storage.createBucket('projects', {
        public: false, // Private bucket
        fileSizeLimit: 209715200, // 200MB
        allowedMimeTypes: ['application/zip', 'application/x-zip-compressed'],
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        process.exit(1);
      }

      console.log('✅ Bucket "projects" created successfully!');
    }

    // Test upload
    console.log('\n🧪 Testing bucket access...');
    
    const testContent = Buffer.from('test');
    const testPath = 'test/test.txt';
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('projects')
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('\n⚠️  You may need to set up storage policies manually in Supabase dashboard.');
      console.log('   Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/storage/buckets');
    } else {
      console.log('✅ Upload test successful!');
      
      // Clean up test file
      await supabaseAdmin.storage.from('projects').remove([testPath]);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Supabase Storage setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Try uploading a project');
    console.log('   3. Files will be stored in Supabase Storage\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

setupSupabaseBucket();
