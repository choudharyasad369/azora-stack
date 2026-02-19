'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ProjectCardSkeletonGrid } from '@/components/ui/project-card-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Search, 
  Filter, 
  Star,
  Download,
  Eye,
  TrendingUp,
  Code2,
  X,
  Package
} from 'lucide-react';

const TECH_STACKS = ['React', 'Next.js', 'Vue.js', 'Node.js', 'Python', 'Django', 'Laravel', 'MongoDB', 'PostgreSQL'];
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  price: string;
  thumbnailUrl: string;
  techStack: string[];
  difficulty: string;
  salesCount: number;
  viewCount: number;
  seller: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, [searchQuery, selectedTech, selectedDifficulty, priceRange, sortBy]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTech.length > 0) params.append('techStack', selectedTech.join(','));
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load projects",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTech = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTech([]);
    setSelectedDifficulty(null);
    setPriceRange([0, 10000]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Premium Projects
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Production-ready code from expert developers. Find your perfect project.
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-64 shrink-0`}
          >
            <div className="bg-white rounded-xl p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              {/* Tech Stack Filter */}
              <div>
                <h4 className="font-medium mb-3">Tech Stack</h4>
                <div className="space-y-2">
                  {TECH_STACKS.map(tech => (
                    <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTech.includes(tech)}
                        onChange={() => toggleTech(tech)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <span className="text-sm">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h4 className="font-medium mb-3">Difficulty</h4>
                <div className="space-y-2">
                  {DIFFICULTIES.map(diff => (
                    <label key={diff} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        checked={selectedDifficulty === diff}
                        onChange={() => setSelectedDifficulty(diff)}
                        className="border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <span className="text-sm">{diff}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <span className="text-gray-600">
                  {projects.length} projects found
                </span>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Active Filters */}
            {(selectedTech.length > 0 || selectedDifficulty) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedTech.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {tech}
                    <button onClick={() => toggleTech(tech)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedDifficulty && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {selectedDifficulty}
                    <button onClick={() => setSelectedDifficulty(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <ProjectCardSkeletonGrid count={6} />
            )}

            {/* Projects Grid */}
            {!loading && projects.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link href={`/projects/${project.slug}`}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer h-full flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500';
                            }}
                          />
                          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                            ₹{parseFloat(project.price).toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                            {project.shortDescription}
                          </p>

                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.techStack && Array.isArray(project.techStack) && project.techStack.slice(0, 3).map(tech => (
                              <span
                                key={tech}
                                className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.techStack && project.techStack.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{project.viewCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>{project.salesCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Code2 className="h-4 w-4" />
                              <span className="text-xs">{project.difficulty}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && projects.length === 0 && (
              <EmptyState
                icon={Package}
                title="No projects found"
                description="Try adjusting your filters or search query to find what you're looking for"
                action={{
                  label: "Clear Filters",
                  onClick: clearFilters
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}