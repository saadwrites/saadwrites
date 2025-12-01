import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, Phone, Copy, Check, ExternalLink } from 'lucide-react';

export const Contact: React.FC = () => {
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
    // Simulate API call
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
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8 pb-10">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">যোগাযোগ করুন</h2>
        <p className="text-stone-600 dark:text-stone-400">যেকোনো প্রয়োজনে বা মতামত জানাতে আমার সাথে যোগাযোগ করুন</p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full">
            <Mail className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">ইমেইল</p>
            <p className="font-medium text-stone-800 dark:text-stone-200 truncate" title="abdullahsaadbd61@gmail.com">
              abdullahsaadbd61@gmail.com
            </p>
          </div>
          <div className="flex items-center gap-1">
            <a 
              href="mailto:abdullahsaadbd61@gmail.com"
              className="p-2 text-stone-400 hover:text-accent transition-colors"
              title="সরাসরি ইমেইল করুন"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button 
              onClick={() => copyToClipboard('abdullahsaadbd61@gmail.com', 'email')}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              title="কপি করুন"
            >
              {copied === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
            <Phone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">ওয়াটসএপ</p>
            <p className="font-medium text-stone-800 dark:text-stone-200 font-mono">+880 1883-672961</p>
          </div>
          <div className="flex items-center gap-1">
            <a 
              href="https://wa.me/8801883672961"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-400 hover:text-green-600 transition-colors"
              title="হোয়াটসঅ্যাপে মেসেজ করুন"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button 
              onClick={() => copyToClipboard('+8801883672961', 'whatsapp')}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              title="কপি করুন"
            >
              {copied === 'whatsapp' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 dark:border-stone-700 my-8"></div>

      {/* Contact Form */}
      <div>
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6 text-center font-serif">সরাসরি বার্তা পাঠান</h3>
        
        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-8 rounded-2xl text-center space-y-4 border border-green-100 dark:border-green-800 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-xl font-bold">ধন্যবাদ!</h3>
            <p>আপনার বার্তা সফলভাবে পাঠানো হয়েছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।</p>
            <button 
              onClick={() => setStatus('idle')}
              className="text-sm font-medium underline hover:text-green-900 dark:hover:text-green-100"
            >
              আবার বার্তা পাঠান
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-stone-800 p-8 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <User className="w-4 h-4" /> আপনার নাম
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-stone-800 dark:text-stone-100 dark:placeholder-stone-400"
                placeholder="আপনার পুরো নাম লিখুন"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> ইমেইল ঠিকানা
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-stone-800 dark:text-stone-100 dark:placeholder-stone-400"
                placeholder="hello@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> বার্তা
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none font-serif text-stone-800 dark:text-stone-100 dark:placeholder-stone-400"
                placeholder="আপনার বার্তা এখানে লিখুন..."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-all flex items-center justify-center gap-2"
            >
              {status === 'sending' ? (
                'পাঠানো হচ্ছে...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> বার্তা পাঠান
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};