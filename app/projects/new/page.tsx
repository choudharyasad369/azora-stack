'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  FileArchive,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const TECH_STACKS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 
  'Express', 'Python', 'Django', 'Flask', 'FastAPI',
  'PHP', 'Laravel', 'Ruby on Rails', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Redis', 'Docker', 'AWS', 'Firebase'
];

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    price: '',
    techStack: [] as string[],
    difficulty: 'INTERMEDIATE',
    demoUrl: '',
    documentationUrl: '',
  });

  const [files, setFiles] = useState({
    projectFile: null as File | null,
    thumbnail: null as File | null,
  });

  const [previews, setPreviews] = useState({
    thumbnail: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'projectFile' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'projectFile') {
      // Validate ZIP file
      if (!file.name.endsWith('.zip')) {
        setError('Please upload a ZIP file');
        return;
      }
      
      // Check size (150MB max)
      if (file.size > 150 * 1024 * 1024) {
        setError('File size must be less than 150MB');
        return;
      }

      setFiles({ ...files, projectFile: file });
      setError('');
    } else if (type === 'thumbnail') {
      // Validate image
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setFiles({ ...files, thumbnail: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const toggleTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!files.projectFile) {
        setError('Please upload your project ZIP file');
        setLoading(false);
        return;
      }

      if (!files.thumbnail) {
        setError('Please upload a project thumbnail');
        setLoading(false);
        return;
      }

      if (formData.techStack.length === 0) {
        setError('Please select at least one technology');
        setLoading(false);
        return;
      }

      // Step 1: Upload files to S3/Cloudinary (implement this API)
      const fileFormData = new FormData();
      fileFormData.append('projectFile', files.projectFile);
      fileFormData.append('thumbnail', files.thumbnail);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: fileFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error('File upload failed');
      }

      // Step 2: Create project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          fileUrl: uploadData.data.fileUrl,
          fileSize: files.projectFile.size,
          thumbnailUrl: uploadData.data.thumbnailUrl,
        }),
      });

      const projectData = await projectResponse.json();

      if (projectData.success) {
        router.push('/dashboard/seller/projects');
      } else {
        // Show detailed validation errors if available
        if (projectData.error?.details && Array.isArray(projectData.error.details)) {
          const errorMessages = projectData.error.details.map((err: any) => 
            `${err.path.join('.')}: ${err.message}`
          ).join(', ');
          setError(errorMessages);
        } else {
          setError(projectData.error?.message || 'Failed to create project');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const NavbarAny = Navbar as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAny user={{ name: 'Seller', email: 'seller@test.com', role: 'SELLER' }} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload New Project</h1>
          <p className="text-gray-600">Share your project with the community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-purple-600 font-medium' : 'text-gray-600'}>Basic Info</span>
            <span className={step >= 2 ? 'text-purple-600 font-medium' : 'text-gray-600'}>Upload Files</span>
            <span className={step >= 3 ? 'text-purple-600 font-medium' : 'text-gray-600'}>Review</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="E-Commerce Full Stack Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Brief description (max 200 characters)"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Detailed description of your project, features, what's included, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="2999"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Platform fee: ₹49 listing + 50% commission on each sale
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tech Stack * (Select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_STACKS.map(tech => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTech(tech)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.techStack.includes(tech)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty Level *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.difficulty === diff
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <span className="font-medium">{diff}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Demo URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="https://demo.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Documentation URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.documentationUrl}
                      onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="https://docs.example.com"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload Files */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Project ZIP File */}
                <div>
                  <label className="block text-sm font-medium mb-2">Project File (ZIP) *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    {files.projectFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileArchive className="h-8 w-8 text-purple-600" />
                        <div className="text-left">
                          <p className="font-medium">{files.projectFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(files.projectFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiles({ ...files, projectFile: null })}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">ZIP file (Max 150MB)</p>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={(e) => handleFileChange(e, 'projectFile')}
                          className="hidden"
                          id="projectFile"
                        />
                        <label htmlFor="projectFile">
                          <Button type="button" className="mt-4" onClick={() => document.getElementById('projectFile')?.click()}>
                            Choose File
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium mb-2">Project Thumbnail *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    {previews.thumbnail ? (
                      <div className="relative">
                        <img
                          src={previews.thumbnail}
                          alt="Thumbnail preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFiles({ ...files, thumbnail: null });
                            setPreviews({ ...previews, thumbnail: '' });
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload project thumbnail</p>
                        <p className="text-sm text-gray-500">PNG, JPG (Recommended: 1200x630px)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'thumbnail')}
                          className="hidden"
                          id="thumbnail"
                        />
                        <label htmlFor="thumbnail">
                          <Button type="button" className="mt-4" onClick={() => document.getElementById('thumbnail')?.click()}>
                            Choose Image
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Review Your Project</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">₹{formData.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium">{formData.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tech Stack:</span>
                      <span className="font-medium">{formData.techStack.length} technologies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project File:</span>
                      <span className="font-medium">{files.projectFile?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thumbnail:</span>
                      <span className="font-medium">Uploaded ✓</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900 mb-1">Before submitting:</p>
                      <ul className="space-y-1 text-yellow-800">
                        <li>• Your project will be reviewed by our team</li>
                        <li>• Review usually takes 24-48 hours</li>
                        <li>• You'll receive an email once approved</li>
                        <li>• Listing fee of ₹49 will be charged</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {loading ? 'Uploading...' : 'Submit for Review'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}