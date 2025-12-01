import React, { useState, useEffect, useRef } from 'react';
import { MapPin, BookOpen, Coffee, Camera } from 'lucide-react';

export const About: React.FC = () => {
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
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 dark:border-stone-700 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
          {/* Image Section */}
          <div className="relative shrink-0 group">
             <div 
               className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white dark:border-stone-700 shadow-xl relative bg-stone-200 cursor-pointer"
               onClick={triggerFileInput}
             >
               <img 
                 src={profileImage} 
                 alt="আব্দুল্লাহ সাআদ" 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
               {/* Overlay hint */}
               <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <Camera className="w-8 h-8 text-white drop-shadow-lg" />
               </div>
             </div>
             
             <button 
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                className="absolute bottom-2 right-4 md:right-2 bg-stone-800 text-white p-2.5 rounded-full shadow-lg hover:bg-stone-700 transition-colors border-2 border-white dark:border-stone-800 hover:scale-110 transform duration-200"
                title="ছবি পরিবর্তন করুন"
             >
               <Camera className="w-4 h-4" />
             </button>
             
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               accept="image/*" 
               className="hidden" 
             />
          </div>

          {/* Text Section */}
          <div className="text-center md:text-left space-y-6">
            <div>
              <h2 className="text-4xl font-hind font-bold text-stone-800 dark:text-stone-100 mb-3">আব্দুল্লাহ সাআদ</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-stone-500 dark:text-stone-400 font-medium">
                 <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full"><MapPin className="w-3.5 h-3.5" /> কিশোরগঞ্জ</span>
                 <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full"><BookOpen className="w-3.5 h-3.5" /> নোয়াখালী</span>
                 <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full"><Coffee className="w-3.5 h-3.5" /> ভবঘুরে</span>
              </div>
            </div>
            
            <div className="prose dark:prose-invert font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-lg text-justify">
              <p className="mb-4">
                আমি আব্দুল্লাহ সাআদ। আমার ধমনীতে কিশোরগঞ্জের পলিমাটির ঘ্রাণ, আর স্মৃতির পাতায় মেঘনা-বিধৌত নোয়াখালীর নোনা বাতাস। জন্ম ও শৈশবের সোনালী দিনগুলো কেটেছে কিশোরগঞ্জের মায়াবী পরিবেশে। পরবর্তীতে বেড়ে ওঠা এবং বিদ্যার্জনের পাঠ চুকিয়েছি নোয়াখালীর ব্যস্ত জনপদে।
              </p>
              <p>
                স্বভাবে আমি কিছুটা ভবঘুরে, আর খানিকটা হেয়ালি। ধরাবাঁধা জীবনের ছক কষতে আমার ভালো লাগে না; বরং অজানাকে জানার, অচেনাকে চেনার নেশায় আমি খুঁজে ফিরি জীবনের ভিন্ন অর্থ। আমার লেখায় উঠে আসে এই ভবঘুরে জীবনের গল্প, প্রকৃতির প্রেম আর মানুষের মনের অব্যক্ত কথা।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};