import React, { useState, useEffect, useRef } from 'react';
import { MapPin, BookOpen, Coffee, Camera } from 'lucide-react';
import { SiteConfig } from '../types';
import { EditableText } from './Editable';

interface AboutProps {
  config: SiteConfig;
  updateConfig: (c: Partial<SiteConfig>) => void;
  isAdmin: boolean;
}

export const About: React.FC<AboutProps> = ({ config, updateConfig, isAdmin }) => {
  const [profileImage, setProfileImage] = useState<string>('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=387&auto=format&fit=crop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('saadwrites_profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        localStorage.setItem('saadwrites_profile_image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isAdmin) fileInputRef.current?.click();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-16">
      <div className="bg-white dark:bg-[#161413] rounded-sm p-8 md:p-16 shadow-2xl border border-stone-100 dark:border-stone-800 relative overflow-hidden">
        
        {/* Artistic accent */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>

        <div className="flex flex-col md:flex-row items-start gap-12 md:gap-20 relative z-10">
          {/* Image Section - Premium Frame */}
          <div className="relative shrink-0 group mx-auto md:mx-0">
             <div className="absolute inset-0 bg-gold/20 transform translate-x-4 translate-y-4 rounded-sm"></div>
             <div 
               className={`w-64 h-80 md:w-72 md:h-96 rounded-sm overflow-hidden shadow-xl relative bg-stone-200 ${isAdmin ? 'cursor-pointer' : ''}`}
               onClick={triggerFileInput}
             >
               <img 
                 src={profileImage} 
                 alt={config.aboutName} 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
               />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
               
               {/* Overlay hint */}
               {isAdmin && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <Camera className="w-8 h-8 text-white" />
                 </div>
               )}
             </div>
             
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>

          {/* Text Section */}
          <div className="flex-1 space-y-10 text-center md:text-left">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">লেখক পরিচিতি</p>
              <div className="text-5xl md:text-6xl font-kalpurush font-bold text-charcoal dark:text-stone-100 leading-tight">
                <EditableText 
                  value={config.aboutName} 
                  onSave={(val) => updateConfig({ aboutName: val })} 
                  isAdmin={isAdmin}
                />
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                 <div className="flex items-center gap-2 text-stone-500 text-sm font-bold uppercase tracking-wider">
                   <MapPin className="w-4 h-4 text-gold" /> 
                   <EditableText value={config.aboutLocation1} onSave={val => updateConfig({ aboutLocation1: val })} isAdmin={isAdmin} />
                 </div>
                 <div className="flex items-center gap-2 text-stone-500 text-sm font-bold uppercase tracking-wider">
                   <BookOpen className="w-4 h-4 text-gold" /> 
                   <EditableText value={config.aboutLocation2} onSave={val => updateConfig({ aboutLocation2: val })} isAdmin={isAdmin} />
                 </div>
                 <div className="flex items-center gap-2 text-stone-500 text-sm font-bold uppercase tracking-wider">
                   <Coffee className="w-4 h-4 text-gold" /> 
                   <EditableText value={config.aboutTrait} onSave={val => updateConfig({ aboutTrait: val })} isAdmin={isAdmin} />
                 </div>
              </div>
            </div>
            
            <div className="h-px w-20 bg-stone-300 dark:bg-stone-700 mx-auto md:mx-0"></div>
            
            <div className="prose dark:prose-invert font-serif text-charcoal dark:text-stone-300 leading-loose text-xl text-justify">
               <EditableText 
                 value={config.aboutBio} 
                 onSave={(val) => updateConfig({ aboutBio: val })} 
                 isAdmin={isAdmin} 
                 multiline
                 className="whitespace-pre-wrap"
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};