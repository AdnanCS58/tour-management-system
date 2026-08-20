'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUpload,
  FiFile,
  FiDownload,
  FiTrash2,
  FiX,
  FiPhone,
  FiUser,
  FiPlus,
  FiSave,
} from 'react-icons/fi';

interface Document {
  _id: string;
  title: string;
  type: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  description: string;
  createdAt: string;
}

const documentTypes = ['Ticket', 'Reservation', 'Passport', 'Visa', 'Insurance', 'Other'];

export default function DocumentsTab({ tourId }: { tourId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: documentTypes[0],
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<{
    fileData: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [tourId]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/tours/${tourId}/documents`);
      const data = await res.json();
      if (res.ok) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        fileData: event.target?.result as string,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!formData.title || !selectedFile) {
      toast.error('Please provide title and select a file');
      return;
    }

    setUploading(true);

    try {
      const res = await fetch(`/api/tours/${tourId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...selectedFile,
        }),
      });

      if (res.ok) {
        toast.success('Document uploaded successfully!');
        setShowUploadModal(false);
        setFormData({ title: '', type: documentTypes[0], description: '' });
        setSelectedFile(null);
        fetchDocuments();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to upload document');
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc: Document) => {
    if (!doc.fileData) return;
    
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName || doc.title;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Documents Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#e8f0eb]">Tour Documents</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-500 transition flex items-center shadow-lg shadow-emerald-600/20"
        >
          <FiUpload className="mr-2" />
          Upload Document
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#e8f0eb] flex items-center">
            <FiPhone className="mr-2 text-emerald-400" />
            Emergency Contacts
          </h3>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="text-emerald-400 hover:text-emerald-300 flex items-center"
          >
            <FiPlus className="mr-1" />
            Add Contact
          </button>
        </div>
        {emergencyContacts.length === 0 ? (
          <p className="text-[#6b7a72] text-sm">No emergency contacts added yet</p>
        ) : (
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between bg-[#1a211e] p-4 rounded-xl border border-[#2a322e]">
                <div>
                  <p className="font-medium text-[#e8f0eb]">{contact.name}</p>
                  <p className="text-sm text-[#a0b0a8]">{contact.phone}</p>
                  {contact.relation && (
                    <p className="text-xs text-[#6b7a72]">{contact.relation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl">
          <FiFile className="w-16 h-16 text-[#2a322e] mx-auto mb-4" />
          <p className="text-[#a0b0a8]">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                    <FiFile className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#e8f0eb] truncate">{doc.title}</p>
                    <p className="text-xs text-[#6b7a72] mt-1">
                      {doc.type} • {formatFileSize(doc.fileSize)}
                    </p>
                    <p className="text-xs text-[#6b7a72]">
                      Uploaded by {doc.uploadedBy?.name || 'Unknown'} on {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-[#a0b0a8] mt-2">{doc.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="text-emerald-400 hover:text-emerald-300 p-2"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#121816] border border-[#2a322e] rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#e8f0eb]">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#6b7a72] hover:text-[#e8f0eb]">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                  placeholder="e.g., Flight Ticket"
                />
              </div>

              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">File *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2a322e] rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition"
                >
                  <FiUpload className="w-8 h-8 text-[#6b7a72] mx-auto mb-2" />
                  <p className="text-sm text-[#a0b0a8]">
                    {selectedFile ? selectedFile.fileName : 'Click to select file'}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-[#6b7a72] mt-1">
                      {formatFileSize(selectedFile.fileSize)}
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>

              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                  placeholder="Add any notes..."
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}