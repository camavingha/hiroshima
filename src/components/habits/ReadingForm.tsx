'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Reading } from '@/types/habits';

interface ReadingFormProps {
  onReadingAdded?: (reading: Reading) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export default function ReadingForm({ onReadingAdded, isOpen = false, onToggle }: ReadingFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_pages: '',
    pages_read: '',
    genre: 'fiction' as Reading['genre'],
    status: 'reading' as Reading['status'],
    rating: '',
    notes: '',
    started_date: new Date().toISOString().split('T')[0],
    completed_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

const uploadImage = async (file: File, bookTitle: string): Promise<string | null> => {
  try {
    setUploading(true);
    
    // 1. Get the original file extension (e.g., .png, .jpg, .jpeg)
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    // 2. Create a clean filename using the actual extension
    const fileName = `${timestamp}-${bookTitle.replace(/\s+/g, '-')}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(`public/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type, // 3. Set the correct MIME type (image/png, etc.)
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from('book-covers')
      .getPublicUrl(`public/${fileName}`);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        alert('Error: Could not get user. Please log in.');
        return;
      }

      let coverImageUrl: string | undefined;

      // Upload image if selected
      if (imageFile) {
        coverImageUrl = await uploadImage(imageFile, formData.title) || undefined;
      }

      const newReading = {
        user_id: user.id,
        title: formData.title,
        author: formData.author,
        total_pages: parseInt(formData.total_pages),
        pages_read: parseInt(formData.pages_read),
        is_completed: false,
        genre: formData.genre,
        status: formData.status,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        notes: formData.notes || undefined,
        started_date: formData.started_date,
        completed_date: formData.completed_date || undefined,
        cover_image_url: coverImageUrl,
      };

      const { data, error } = await supabase
        .from('books')
        .insert([newReading])
        .select()
        .single();

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Book added successfully!');
        onReadingAdded?.(data);
        onToggle?.(false);
        setFormData({
          title: '',
          author: '',
          total_pages: '',
          pages_read: '',
          genre: 'fiction',
          status: 'reading',
          rating: '',
          notes: '',
          started_date: new Date().toISOString().split('T')[0],
          completed_date: '',
        });
        setImageFile(null);
        setImagePreview('');
      }
    } catch (err) {
      alert('Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => onToggle?.(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold hover:shadow-xl hover:scale-110 transition-all transform z-50"
      >
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>

      {/* Modal Overlay & Form */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => onToggle?.(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
              <button
                onClick={() => onToggle?.(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Book Cover Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Book Cover (optional)</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        id="cover-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="cover-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="text-sm text-green-600 font-semibold">✓ Image selected</div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            <div className="text-2xl mb-1">📸</div>
                            <p>Click to upload cover image</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Book title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Genre</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="science">Science</option>
                    <option value="biography">Biography</option>
                    <option value="history">History</option>
                    <option value="self-help">Self-Help</option>
                    <option value="mystery">Mystery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Rating (optional)</label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Not rated</option>
                    <option value="1">⭐ 1 Star</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Total Pages</label>
                  <input
                    type="number"
                    name="total_pages"
                    value={formData.total_pages}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Pages Read</label>
                  <input
                    type="number"
                    name="pages_read"
                    value={formData.pages_read}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Start Date</label>
                  <input
                    type="date"
                    name="started_date"
                    value={formData.started_date}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {formData.status === 'completed' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Completion Date</label>
                  <input
                    type="date"
                    name="completed_date"
                    value={formData.completed_date}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Your thoughts on this book..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                {loading || uploading ? (uploading ? 'Uploading image...' : 'Adding...') : 'Add Book'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
