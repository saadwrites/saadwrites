
import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, Phone, Copy, Check, ExternalLink } from 'lucide-react';
import { SiteConfig } from '../types';
import { EditableText } from './Editable';

interface ContactProps {
  config: SiteConfig;
  updateConfig: (c: Partial<SiteConfig>) => void;
  isAdmin: boolean;
}

export const Contact: React.FC<ContactProps> = ({ config, updateConfig, isAdmin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-12 pb-16">
      <div className="text-center space-y-6 mb-12">
        <h2 className="text-5xl font-kalpurush font-bold text-charcoal dark:text-stone-100">যোগাযোগ করুন</h2>
        <p className="text-stone-500 dark:text-stone-400 font-serif text-lg">আপনার মতামত বা জিজ্ঞাসার অপেক্ষায়</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
           <div className="p-8 bg-white dark:bg-stone-900 rounded-sm shadow-xl border-t-4 border-gold group hover:-translate-y-1 transition-transform duration-300">
             <div className="flex items-start gap-5">
               <div className="p-4 bg-cream dark:bg-stone-800 text-gold rounded-full">
                 <Mail className="w-6 h-6" />
               </div>
               <div className="flex-1 space-y-2">
                 <p className="text-xs font-bold uppercase tracking-widest text-stone-400">ইমেইল</p>
                 <div className="font-serif text-lg text-charcoal dark:text-stone-200">
                    <EditableText 
                      value={config.contactEmail} 
                      onSave={(val) => updateConfig({ contactEmail: val })} 
                      isAdmin={isAdmin}
                    />
                 </div>
                 <div className="flex gap-4 pt-2">
                   <a href={`mailto:${config.contactEmail}`} className="text-xs font-bold uppercase tracking-wide text-gold hover:underline">মেইল পাঠান</a>
                   <button onClick={() => copyToClipboard(config.contactEmail, 'email')} className="text-xs font-bold uppercase tracking-wide text-stone-400 hover:text-charcoal transition-colors">
                     {copied === 'email' ? 'কপি হয়েছে' : 'কপি করুন'}
                   </button>
                 </div>
               </div>
             </div>
           </div>

           <div className="p-8 bg-white dark:bg-stone-900 rounded-sm shadow-xl border-t-4 border-green-600 group hover:-translate-y-1 transition-transform duration-300">
             <div className="flex items-start gap-5">
               <div className="p-4 bg-cream dark:bg-stone-800 text-green-600 rounded-full">
                 <Phone className="w-6 h-6" />
               </div>
               <div className="flex-1 space-y-2">
                 <p className="text-xs font-bold uppercase tracking-widest text-stone-400">হোয়াটসঅ্যাপ</p>
                 <div className="font-serif text-lg text-charcoal dark:text-stone-200 font-mono">
                    <EditableText 
                      value={config.contactPhone} 
                      onSave={(val) => updateConfig({ contactPhone: val })} 
                      isAdmin={isAdmin}
                    />
                 </div>
                 <div className="flex gap-4 pt-2">
                   <a href={`https://wa.me/${config.contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-wide text-green-600 hover:underline">মেসেজ দিন</a>
                   <button onClick={() => copyToClipboard(config.contactPhone, 'whatsapp')} className="text-xs font-bold uppercase tracking-wide text-stone-400 hover:text-charcoal transition-colors">
                     {copied === 'whatsapp' ? 'কপি হয়েছে' : 'কপি করুন'}
                   </button>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-sm shadow-xl border border-stone-100 dark:border-stone-800">
        {status === 'success' ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-kalpurush font-bold text-charcoal dark:text-stone-100">বার্তা পাঠানো হয়েছে</h3>
            <p className="text-stone-500 font-serif">ধন্যবাদ যোগাযোগ করার জন্য। শীঘ্রই উত্তর দেওয়া হবে।</p>
            <button onClick={() => setStatus('idle')} className="text-sm font-bold uppercase tracking-widest text-gold hover:underline">আরেকটি বার্তা পাঠান</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">আপনার নাম</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-0 py-3 bg-transparent border-b-2 border-stone-200 dark:border-stone-700 focus:border-gold outline-none transition-colors text-charcoal dark:text-stone-100 font-serif text-lg" placeholder="নাম লিখুন" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">ইমেইল</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-0 py-3 bg-transparent border-b-2 border-stone-200 dark:border-stone-700 focus:border-gold outline-none transition-colors text-charcoal dark:text-stone-100 font-serif text-lg" placeholder="example@mail.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">বার্তা</label>
              <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-0 py-3 bg-transparent border-b-2 border-stone-200 dark:border-stone-700 focus:border-gold outline-none transition-colors text-charcoal dark:text-stone-100 font-serif text-lg resize-none" placeholder="আপনার কথা লিখুন..." />
            </div>
            <button type="submit" disabled={status === 'sending'} className="w-full py-4 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal text-sm font-bold uppercase tracking-widest hover:bg-gold dark:hover:bg-gold transition-colors shadow-lg">
              {status === 'sending' ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};
