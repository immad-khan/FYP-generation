import React, { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { Trash2, Plus, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const ProfileCompletion = ({ userId, onComplete }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('semester'); // 'semester', 'project', 'course', 'review'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showProjectsList, setShowProjectsList] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    semesterNumber: '',
    courseCode: '',
    courseName: '',
    projectName: '',
    projectDescription: '',
    languages: '',
    frontendFrameworks: '',
    backendFrameworks: '',
  });

  // Fetch existing projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getProjects(userId);
      setProjects(response.projects || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load your semester projects');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 'semester') {
      if (!formData.semesterNumber) {
        setError('Please select a semester');
        return;
      }
      setError(null);
      setCurrentStep('project');
    } else if (currentStep === 'project') {
      if (!formData.projectName) {
        setError('Please enter a project name');
        return;
      }
      setError(null);
      setCurrentStep('course');
    } else if (currentStep === 'course') {
      if (!formData.courseCode || !formData.courseName) {
        setError('Please fill in course code and name');
        return;
      }
      setError(null);
      setCurrentStep('review');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'project') {
      setError(null);
      setCurrentStep('semester');
    } else if (currentStep === 'course') {
      setError(null);
      setCurrentStep('project');
    } else if (currentStep === 'review') {
      setError(null);
      setCurrentStep('course');
    }
  };

  const handleAddProject = async () => {
    if (!formData.semesterNumber || !formData.courseCode || !formData.courseName || !formData.projectName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const projectData = {
        semesterNumber: parseInt(formData.semesterNumber),
        courseCode: formData.courseCode.toUpperCase(),
        courseName: formData.courseName,
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        languages: formData.languages,
        frontendFrameworks: formData.frontendFrameworks,
        backendFrameworks: formData.backendFrameworks,
      };

      await studentAPI.saveProject(userId, projectData);

      // Reset form and fetch updated projects
      setFormData({
        semesterNumber: '',
        courseCode: '',
        courseName: '',
        projectName: '',
        projectDescription: '',
        languages: '',
        frontendFrameworks: '',
        backendFrameworks: '',
      });
      
      await fetchProjects();
      setCurrentStep('semester');
      setShowProjectsList(true);
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setSaving(true);
      setError(null);
      await studentAPI.deleteProject(projectId);
      setDeleteConfirm(null);
      await fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteProfile = async () => {
    try {
      if (projects.length < 6) {
        setError('Please add at least 6 semester projects before completing your profile');
        return;
      }
      onComplete();
    } catch (err) {
      console.error('Error completing profile:', err);
      setError('Failed to complete profile');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-6 flex items-center justify-center md:items-start md:pt-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        {!showProjectsList && (
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-3 uppercase tracking-tight">WELLCOME</h1>
            <p className="text-gray-400 text-lg">
              Let's set up your academic profile to generate personalized FYP ideas
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

        {/* Review & Add More Section */}
        {showProjectsList && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">Your Semester Details</h2>
              
              {projects.length === 0 ? (
                <Card className="bg-[#242444] border-white/5">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400 text-lg mb-4">No semester projects added yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="bg-[#242444] border-white/10 hover:border-cyan-500/30 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg">{project.project_name}</CardTitle>
                            <CardDescription className="text-gray-400 mt-1">
                              Semester {project.semester_number} • {project.course_code}
                            </CardDescription>
                          </div>
                          <button
                            onClick={() => setDeleteConfirm(project.id)}
                            className="text-red-500 hover:text-red-400 transition-colors p-2"
                            title="Delete project"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium text-xs uppercase">Course</p>
                            <p className="text-white">{project.course_name}</p>
                          </div>
                          {project.project_description && (
                            <div>
                              <p className="text-gray-500 font-medium text-xs uppercase">Description</p>
                              <p className="text-gray-300">{project.project_description}</p>
                            </div>
                          )}
                          
                          {project.languages && (
                            <div>
                              <p className="text-gray-500 font-medium text-xs uppercase mb-2">Languages</p>
                              <div className="flex flex-wrap gap-2">
                                {project.languages.split(',').map((tech, idx) => (
                                  <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-xs font-semibold border border-blue-500/30">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {project.frontend_frameworks && (
                            <div>
                              <p className="text-gray-500 font-medium text-xs uppercase mb-2">Frontend</p>
                              <div className="flex flex-wrap gap-2">
                                {project.frontend_frameworks.split(',').map((tech, idx) => (
                                  <span key={idx} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg text-xs font-semibold border border-cyan-500/30">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {project.backend_frameworks && (
                            <div>
                              <p className="text-gray-500 font-medium text-xs uppercase mb-2">Backend</p>
                              <div className="flex flex-wrap gap-2">
                                {project.backend_frameworks.split(',').map((tech, idx) => (
                                  <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-xs font-semibold border border-purple-500/30">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                onClick={() => setShowProjectsList(false)}
                className="flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/30 text-white py-6 text-lg font-bold"
              >
                <Plus size={20} className="mr-2" />
                Add Another Project
              </Button>
              <Button
                onClick={handleCompleteProfile}
                disabled={projects.length < 6}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-bold disabled:opacity-50"
              >
                <CheckCircle2 size={20} className="mr-2" />
                Complete Profile
              </Button>
            </div>
          </>
        )}

        {/* Multi-Step Form */}
        {!showProjectsList && (
          <Card className="bg-[#242444] border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  {['semester', 'project', 'course', 'review'].map((step, idx) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        idx < ['semester', 'project', 'course', 'review'].indexOf(currentStep)
                          ? 'bg-cyan-500'
                          : idx === ['semester', 'project', 'course', 'review'].indexOf(currentStep)
                          ? 'bg-cyan-400'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <CardTitle className="text-white text-2xl">
                {currentStep === 'semester' && 'Which Semester?'}
                {currentStep === 'project' && 'Project Name'}
                {currentStep === 'course' && 'Course Details'}
                {currentStep === 'review' && 'Review Your Details'}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {currentStep === 'semester' && 'Select the semester number for this project'}
                {currentStep === 'project' && 'Tell us about your project'}
                  {currentStep === 'course' && 'Add course information and tools used'}
                {currentStep === 'review' && 'Review all details before saving'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              {/* Step 1: Semester Selection */}
              {currentStep === 'semester' && (
                <div className="space-y-6">
                  <label className="block text-gray-300 font-semibold mb-3">Semester Number</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <button
                        key={sem}
                        onClick={() => setFormData(prev => ({ ...prev, semesterNumber: sem.toString() }))}
                        className={`p-4 rounded-xl font-bold text-lg border-2 transition-all ${
                          formData.semesterNumber === sem.toString()
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : 'border-white/10 bg-[#1A1A2E] text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Project Details */}
              {currentStep === 'project' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-3">Project Name *</label>
                    <Input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      placeholder="E.g., E-Commerce Platform, Library Management System"
                      className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600 h-12 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-3">Project Description</label>
                    <Textarea
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={handleInputChange}
                      placeholder="Describe what your project does..."
                      rows="4"
                      className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Course Information */}
              {currentStep === 'course' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-3">Course Code *</label>
                      <Input
                        type="text"
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleInputChange}
                        placeholder="E.g., CS301"
                        className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600 h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-3">Course Name *</label>
                      <Input
                        list="pb-course-options"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleInputChange}
                        placeholder="Select or type a course..."
                        className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600 h-12"
                      />
                      <datalist id="pb-course-options">
                        <option value="Introduction to Programming" />
                        <option value="Object Oriented Programming" />
                        <option value="Information Security and Forensics" />
                        <option value="Web Engineering" />
                        <option value="Blockchain" />
                        <option value="Mobile Application and Development" />
                        <option value="Database" />
                        <option value="Data Structures" />
                        <option value="Software Engineering" />
                        <option value="Software Requirement Engineering" />
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-3">Languages</label>
                      <Input
                        list="pb-language-options"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        placeholder="E.g., Python, C++"
                        className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600 h-12"
                      />
                      <datalist id="pb-language-options">
                        <option value="C" />
                        <option value="C++" />
                        <option value="Python" />
                        <option value="Java" />
                        <option value="JavaScript" />
                        <option value="Rust" />
                        <option value="Go" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-3">Frontend</label>
                      <Input
                        list="pb-frontend-options"
                        name="frontendFrameworks"
                        value={formData.frontendFrameworks}
                        onChange={handleInputChange}
                        placeholder="E.g., React, Vue"
                        className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600 h-12"
                      />
                      <datalist id="pb-frontend-options">
                        <option value="React" />
                        <option value="Vue" />
                        <option value="Angular" />
                        <option value="Svelte" />
                        <option value="Next.js" />
                        <option value="HTML/CSS" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-3">Backend</label>
                      <Input
                        list="pb-backend-options"
                        name="backendFrameworks"
                        value={formData.backendFrameworks}
                        onChange={handleInputChange}
                        placeholder="E.g., Django, Node"
                        className="bg-[#1A1A2E] border-white/10 text-white placeholder-gray-600 h-12"
                      />
                      <datalist id="pb-backend-options">
                        <option value="Node.js" />
                        <option value="Express" />
                        <option value="Django" />
                        <option value="Flask" />
                        <option value="Spring Boot" />
                        <option value="Laravel" />
                        <option value=".NET" />
                      </datalist>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="bg-[#1A1A2E] p-6 rounded-xl space-y-4 border border-white/5">
                    <div>
                      <p className="text-gray-500 text-sm uppercase font-semibold">Semester</p>
                      <p className="text-white text-lg font-bold mt-1">Semester {formData.semesterNumber}</p>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-500 text-sm uppercase font-semibold">Project Name</p>
                      <p className="text-white text-lg font-bold mt-1">{formData.projectName}</p>
                    </div>

                    {formData.projectDescription && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-500 text-sm uppercase font-semibold">Description</p>
                        <p className="text-gray-300 mt-1">{formData.projectDescription}</p>
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-500 text-sm uppercase font-semibold">Course</p>
                      <p className="text-white text-lg font-bold mt-1">
                        {formData.courseCode} - {formData.courseName}
                      </p>
                    </div>

                    {formData.languages && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-500 text-sm uppercase font-semibold mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.languages.split(',').map((tech, idx) => (
                            <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-semibold border border-blue-500/30">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.frontendFrameworks && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-500 text-sm uppercase font-semibold mb-2">Frontend</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.frontendFrameworks.split(',').map((tech, idx) => (
                            <span key={idx} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg text-sm font-semibold border border-cyan-500/30">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.backendFrameworks && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-500 text-sm uppercase font-semibold mb-2">Backend</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.backendFrameworks.split(',').map((tech, idx) => (
                            <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm font-semibold border border-purple-500/30">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                {currentStep !== 'semester' && (
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="bg-[#1A1A2E] border-white/10 text-gray-300 hover:text-white py-6 flex-1"
                  >
                    <ChevronLeft size={20} className="mr-2" />
                    Back
                  </Button>
                )}

                {currentStep === 'review' ? (
                  <Button
                    onClick={handleAddProject}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 font-bold text-lg"
                  >
                    {saving ? 'Saving...' : 'Save Project'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 font-bold text-lg"
                  >
                    Next
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-[#242444] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="bg-[#1A1A2E] border-white/10 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteProject(deleteConfirm)}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileCompletion;
