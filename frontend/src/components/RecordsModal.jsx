import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, FileText, Eye, Trash2, MessageSquare, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const RecordsModal = ({ isOpen, onClose, appointment, userRole }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newRemark, setNewRemark] = useState(''); // For new upload
  const [uploading, setUploading] = useState(false);
  
  // State to track which file has its remarks box open
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [editingRemark, setEditingRemark] = useState('');

  const backendUrl = import.meta.env.VITE_API_URL;

  // 1. Fetch Documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/documents/${appointment.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Fetch Docs Error:", err);
    }
  };

  useEffect(() => {
    if (isOpen && appointment) fetchDocuments();
  }, [isOpen, appointment]);

  // 2. Handle Upload
  const handleUpload = async () => {
    if (!selectedFile) return toast.warning("Please select a file first");

    setUploading(true);
    const formData = new FormData();
    formData.append('report', selectedFile);
    formData.append('appointmentId', appointment.id);
    formData.append('remarks', newRemark); // Send remarks with upload

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/api/documents/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("File Uploaded!");
      setSelectedFile(null);
      setNewRemark('');
      fetchDocuments();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("File Deleted");
      fetchDocuments();
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  // 4. Handle Edit Remarks
  const handleUpdateRemark = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/documents/remarks/${id}`, 
        { remarks: editingRemark },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Remarks Updated");
      setExpandedFileId(null); // Close box
      fetchDocuments();
    } catch (err) {
      toast.error("Update Failed");
    }
  };

  const toggleRemarks = (file) => {
    if (expandedFileId === file.id) {
      setExpandedFileId(null); // Close if already open
    } else {
      setExpandedFileId(file.id);
      setEditingRemark(file.remarks || ''); // Pre-fill
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold">Medical Records</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* File List */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Attached Documents</h3>
            {files.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="bg-slate-50 border border-slate-100 rounded-lg overflow-hidden transition hover:shadow-sm">
                    {/* File Row */}
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-white p-2 rounded border border-slate-200">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{file.file_name}</p>
                                {/* Show truncated remark preview if exists */}
                                {file.remarks && <p className="text-xs text-slate-400 italic truncate max-w-[150px]">"{file.remarks}"</p>}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* View Button */}
                            <a href={`${backendUrl}/${file.file_path}`} target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-primary hover:border-primary transition" title="View">
                                <Eye className="h-4 w-4" />
                            </a>

                            {/* Remarks Button */}
                            <button onClick={() => toggleRemarks(file)}
                                className={`p-2 bg-white border border-slate-200 rounded transition ${expandedFileId === file.id ? 'text-blue-600 border-blue-300 bg-blue-50' : 'text-slate-600 hover:text-blue-600'}`} title="Remarks">
                                <MessageSquare className="h-4 w-4" />
                            </button>

                            {/* Delete Button (Only for Patients) */}
                            {userRole === 'patient' && (
                                <button onClick={() => handleDelete(file.id)}
                                    className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-red-600 hover:border-red-300 transition" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expandable Remarks Section */}
                    {expandedFileId === file.id && (
                        <div className="bg-slate-100 p-3 border-t border-slate-200 animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Remarks / Notes</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={editingRemark}
                                    onChange={(e) => setEditingRemark(e.target.value)}
                                    className="flex-1 text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                    placeholder="Add a remark..."
                                />
                                <button onClick={() => handleUpdateRemark(file.id)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Upload Section (Only for Patients) */}
          {userRole === 'patient' && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-2">Upload New Report</h4>
              
              {/* Remarks Input for New Upload */}
              <input 
                type="text" 
                placeholder="Optional remarks (e.g., Blood Test Report)"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                className="w-full text-sm p-2 mb-3 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-white file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                <button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition"
                >
                  {uploading ? '...' : <><Upload className="h-4 w-4" /> Upload</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RecordsModal;