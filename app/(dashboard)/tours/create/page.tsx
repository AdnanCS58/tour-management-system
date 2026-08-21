'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiMapPin, 
  FiCalendar, 
  FiImage, 
  FiSend, 
  FiFileText,
  FiArrowLeft,
  FiUpload,
  FiX,
  FiPlus,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

export default function CreateTourPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const handleMultipleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    let processedCount = 0;
    const newImages: string[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        newImages.push(base64String);
        processedCount++;

        if (processedCount === validFiles.length) {
          setCoverImages(prev => [...prev, ...newImages]);
          setUploading(false);
          toast.success(`${newImages.length} image(s) uploaded successfully!`);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        processedCount++;
        if (processedCount === validFiles.length) {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setCoverImages(prev => prev.filter((_, i) => i !== index));
    if (currentPreviewIndex >= index && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const requestData = {
      ...formData,
      coverImage: coverImages[0] || '',
      coverImages: coverImages,
    };

    console.log('📤 Sending data:', {
      name: requestData.name,
      coverImageLength: requestData.coverImage?.length || 0,
      coverImagesCount: requestData.coverImages?.length || 0,
      coverImagesLengths: requestData.coverImages?.map(img => img.length),
    });

    setLoading(true);

    try {
      const res = await fetch('/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();
      console.log('📡 Response:', data);

      if (res.ok) {
        toast.success('Tour created successfully!');
        router.push(`/tours/${data._id}`);
      } else {
        toast.error(data.error || 'Failed to create tour');
      }
    } catch (error) {
      console.error('Error creating tour:', error);
      toast.error('Failed to create tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrevPreview = () => {
    setCurrentPreviewIndex(prev => (prev - 1 + coverImages.length) % coverImages.length);
  };

  const handleNextPreview = () => {
    setCurrentPreviewIndex(prev => (prev + 1) % coverImages.length);
  };

  return (
    <div className="container mx-auto px-6 max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-[#a0b0a8] hover:text-[#e8f0eb] mb-6 transition"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl shadow-xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mb-4">
            <FiMapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#e8f0eb]">Create a New Tour</h1>
          <p className="text-[#a0b0a8] mt-2">Plan your next adventure with friends</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tour Name */}
          <div>
            <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
              Tour Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="e.g., Summer Beach Trip 2024"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
              Destination *
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7a72]" />
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="e.g., Cox's Bazar, Bangladesh"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Start Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7a72]" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                End Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7a72]" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Cover Images Upload */}
          <div>
            <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
              Cover Images (optional - multiple)
            </label>
            
            {coverImages.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2a322e] rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition bg-[#1a211e]/50"
              >
                <FiUpload className="w-12 h-12 text-[#6b7a72] mx-auto mb-4" />
                <p className="text-[#a0b0a8] mb-2">
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                </p>
                <p className="text-sm text-[#6b7a72]">
                  PNG, JPG, GIF up to 5MB each
                </p>
                <p className="text-sm text-[#6b7a72] mt-1">
                  You can select multiple images
                </p>
              </div>
            ) : (
              <div>
                {/* Image Preview with Navigation */}
                <div className="relative rounded-xl overflow-hidden border border-[#2a322e]">
                  <img
                    src={coverImages[currentPreviewIndex]}
                    alt={`Preview ${currentPreviewIndex + 1}`}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Previous Button */}
                  {coverImages.length > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevPreview}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Next Button */}
                  {coverImages.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextPreview}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Remove Current Image */}
                  <button
                    type="button"
                    onClick={() => removeImage(currentPreviewIndex)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {currentPreviewIndex + 1} / {coverImages.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {coverImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {coverImages.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentPreviewIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          index === currentPreviewIndex
                            ? 'border-emerald-500'
                            : 'border-[#2a322e] hover:border-[#3a423e]'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Add More Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 flex items-center text-emerald-400 hover:text-emerald-300 transition"
                >
                  <FiPlus className="mr-1" />
                  Add more images
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMultipleImageChange}
              className="hidden"
              multiple
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
              Description
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 text-[#6b7a72]" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full pl-10 pr-4 py-3 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="Tell your friends about this trip..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-[#1a211e] text-[#a0b0a8] py-3 rounded-xl font-semibold hover:bg-[#222a26] hover:text-[#e8f0eb] transition border border-[#2a322e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Create Tour
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}