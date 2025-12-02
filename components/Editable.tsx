
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (val: string) => void;
  isAdmin: boolean;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onSave, 
  isAdmin, 
  className = "", 
  placeholder = "Edit...", 
  multiline = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempValue.trim() !== value) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (!isAdmin && !isEditing) {
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
    const commonClasses = "bg-white dark:bg-stone-800 text-charcoal dark:text-white border border-gold rounded px-2 py-1 outline-none min-w-[100px] w-full shadow-lg";
    
    if (multiline) {
      return (
        <div className="relative w-full">
          <textarea
            ref={inputRef as any}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${commonClasses} ${className} min-h-[100px]`}
          />
          <button onMouseDown={handleSave} className="absolute bottom-2 right-2 p-1 bg-gold text-white rounded-full z-20">
            <Check className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <input
        ref={inputRef as any}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${commonClasses} ${className}`}
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`relative group cursor-pointer border border-transparent hover:border-dashed hover:border-gold/50 rounded transition-all ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-stone-400 italic">{placeholder}</span>}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-gold text-white p-1 rounded-full shadow-sm transition-opacity">
        <Edit3 className="w-3 h-3" />
      </div>
    </div>
  );
};

interface EditableImageProps {
  src?: string;
  onSave: (base64: string) => void;
  isAdmin: boolean;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  onSave,
  isAdmin,
  className = "",
  fallbackIcon
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান?")) {
      onSave('');
    }
  };

  if (!isAdmin) {
    if (!src) return null;
    return <img src={src} alt="content" className={className} />;
  }

  return (
    <div 
      className={`relative group cursor-pointer ${className}`} 
      onClick={() => fileInputRef.current?.click()}
    >
      {src ? (
        <>
          <img src={src} alt="editable" className="w-full h-full object-cover" />
          <button 
            onClick={handleDelete}
            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 shadow-md"
            title="ছবি মুছে ফেলুন"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400 border border-dashed border-stone-300 dark:border-stone-700 hover:border-gold transition-colors">
           {fallbackIcon || <Upload className="w-5 h-5" />}
        </div>
      )}
      
      {src && (
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <Upload className="w-6 h-6 text-white" />
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
