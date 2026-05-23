import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Eye, Trash2, MessageSquare, Save, Loader2, FolderOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './ui/Modal';

const RecordsModal = ({ isOpen, onClose, appointment, userRole }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newRemark, setNewRemark] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [editingRemark, setEditingRemark] = useState('');
  const backendUrl = import.meta.env.VITE_API_URL;

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/documents/${appointment.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (err) { console.error("Fetch Docs Error:", err); }
  };

  useEffect(() => { if (isOpen && appointment) fetchDocuments(); }, [isOpen, appointment]);

  const handleUpload = async () => {
    if (!selectedFile) return toast.warning("Please select a file first");
    setUploading(true);
    const formData = new FormData();
    formData.append('report', selectedFile);
    formData.append('appointmentId', appointment.id);
    formData.append('remarks', newRemark);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/api/documents/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("File Uploaded!");
      setSelectedFile(null);
      setNewRemark('');
      fetchDocuments();
    } catch (err) { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this file?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("File Deleted");
      fetchDocuments();
    } catch (err) { toast.error("Delete Failed"); }
  };

  const handleUpdateRemark = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/documents/remarks/${id}`, { remarks: editingRemark }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Remarks Updated");
      setExpandedFileId(null);
      fetchDocuments();
    } catch (err) { toast.error("Update Failed"); }
  };

  const toggleRemarks = (file) => {
    if (expandedFileId === file.id) {
      setExpandedFileId(null);
    } else {
      setExpandedFileId(file.id);
      setEditingRemark(file.remarks || '');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Records" size="lg">
      <div className="space-y-5">
        {/* File List */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Attached Documents</h3>
          {files.length === 0 ? (
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-[var(--border-primary)]">
              <FolderOpen className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--text-muted)]">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hidden">
              {files.map((file) => (
                <div key={file.id} className="glass-card !p-0 overflow-hidden">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <FileText className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[180px]">{file.file_name}</p>
                        {file.remarks && <p className="text-[10px] text-[var(--text-muted)] italic truncate max-w-[180px]">"{file.remarks}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a href={`${backendUrl}/${file.file_path}`} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg glass border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-cyan-500 hover:border-cyan-500/30 transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <button onClick={() => toggleRemarks(file)}
                        className={`p-2 rounded-lg glass border transition-colors ${expandedFileId === file.id ? 'border-cyan-500/30 text-cyan-500' : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-cyan-500'}`} title="Remarks">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      {userRole === 'patient' && (
                        <button onClick={() => handleDelete(file.id)}
                          className="p-2 rounded-lg glass border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/30 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedFileId === file.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Remarks</label>
                          <div className="flex gap-2">
                            <input type="text" value={editingRemark} onChange={(e) => setEditingRemark(e.target.value)}
                              className="glass-input flex-1 text-sm" placeholder="Add a remark..." />
                            <button onClick={() => handleUpdateRemark(file.id)}
                              className="px-3 py-2 rounded-xl gradient-primary text-white text-sm font-semibold">
                              <Save className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Section (Patient Only) */}
        {userRole === 'patient' && (
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <h4 className="text-sm font-bold text-cyan-500 mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Report
            </h4>
            <input type="text" placeholder="Optional remarks (e.g., Blood Test Report)" value={newRemark} onChange={(e) => setNewRemark(e.target.value)}
              className="glass-input w-full mb-3 text-sm" />
            <div className="flex gap-2">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block flex-1 text-sm text-[var(--text-muted)]
                  file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                  file:text-xs file:font-semibold file:bg-[var(--bg-tertiary)] file:text-[var(--text-primary)]
                  hover:file:bg-cyan-500/10 cursor-pointer" />
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleUpload} disabled={!selectedFile || uploading}
                className="gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Upload</>}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RecordsModal;