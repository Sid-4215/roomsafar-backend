import React, { useState } from 'react';
import { 
  ChevronDown, User, Search, SlidersHorizontal, 
  MapPin, Star, Heart, Building2, Coffee, Briefcase, 
  Home, Users, Sparkles, Bell
} from 'lucide-react';

const categories = ['All', 'Private Room', 'Co-living PGs', 'Full Flats', 'Roommates'];

const featuredProperties = [
  {
    id: 1,
    title: "Zolo Premium PG",
    location: "HSR Layout, Sector 2",
    price: "₹14,500",
    type: "Private",
    rating: "4.8",
    match: "98%",
    graphic: "amber" as const
  },
  {
    id: 2,
    title: "Minimalist 1 BHK",
    location: "Indiranagar, Stage 1",
    price: "₹22,000",
    type: "Entire Flat",
    rating: "4.9",
    match: "94%",
    graphic: "cyan" as const
  },
  {
    id: 3,
    title: "Stanza Living",
    location: "Koramangala, 4th Block",
    price: "₹11,000",
    type: "Shared",
    rating: "4.6",
    match: "88%",
    graphic: "violet" as const
  }
];

const popularAreas = [
  { name: "Indiranagar", count: "124 listings", icon: Building2, color: "from-teal-400 to-emerald-500" },
  { name: "HSR Layout", count: "208 listings", icon: MapPin, color: "from-rose-400 to-pink-500" },
  { name: "Koramangala", count: "186 listings", icon: Coffee, color: "from-amber-400 to-orange-500" },
  { name: "Whitefield", count: "342 listings", icon: Briefcase, color: "from-indigo-400 to-violet-500" }
];

const navItems = [
  { icon: Home, label: 'Home', active: true },
  { icon: Heart, label: 'Saved', active: false },
  { icon: Briefcase, label: 'Bookings', active: false },
  { icon: User, label: 'Profile', active: false },
];

const PropertyGraphic = ({ theme }: { theme: 'amber' | 'cyan' | 'violet' }) => {
  const themes = {
    amber: 'from-amber-200 via-orange-100 to-rose-100',
    cyan: 'from-cyan-200 via-sky-100 to-blue-100',
    violet: 'from-violet-200 via-purple-100 to-fuchsia-100'
  };
  
  const blobColors = {
    amber: 'bg-rose-300/30',
    cyan: 'bg-blue-300/30',
    violet: 'bg-fuchsia-300/30'
  };

  return (
    <div className={`w-full h-40 rounded-2xl bg-gradient-to-tr ${themes[theme]} relative overflow-hidden group border border-white/40 shadow-inner`}>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/50 via-transparent to-transparent"></div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className={`absolute top-8 -left-4 w-20 h-20 ${blobColors[theme]} rounded-full blur-xl group-hover:translate-x-2 transition-transform duration-700`}></div>
      <div className="absolute bottom-4 left-4 flex gap-1.5 items-end">
        <div className="w-2 h-6 bg-white/70 rounded-full backdrop-blur-sm shadow-sm"></div>
        <div className="w-2 h-10 bg-white/80 rounded-full backdrop-blur-sm shadow-sm"></div>
        <div className="w-2 h-4 bg-white/60 rounded-full backdrop-blur-sm shadow-sm"></div>
        <div className="w-2 h-7 bg-white/70 rounded-full backdrop-blur-sm shadow-sm"></div>
      </div>
    </div>
  );
};

export function HomeConcept() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [saved, setSaved] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <div className="w-full max-w-[390px] h-[844px] bg-slate-50 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] mx-auto flex flex-col font-sans sm:rounded-[40px] sm:border-[8px] sm:border-slate-900">
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10" style={{ scrollbarWidth: 'none' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 pt-14 pb-20 px-6 rounded-b-[2.5rem] relative shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent mix-blend-overlay"></div>
          
          <div className="relative z-10 flex justify-between items-center text-white mb-6">
            <div className="group cursor-pointer">
              <p className="text-indigo-200 text-[10px] font-semibold mb-0.5 uppercase tracking-wider">Current Location</p>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight">Bengaluru, KA</span>
                <ChevronDown className="w-4 h-4 text-indigo-300 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
            <button className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-colors active:scale-95">
              <div className="relative">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-indigo-800 rounded-full"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="px-6 -mt-9 relative z-20 shrink-0">
          <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-3 ring-1 ring-slate-100">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search PGs, flats, areas..." 
              className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm min-w-0"
            />
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-8 px-6 flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Properties */}
        <div className="mt-6">
          <div className="px-6 flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Curated for you</h2>
            <button className="text-indigo-600 text-sm font-bold hover:text-indigo-700 active:scale-95 transition-transform">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-6 pt-1" style={{ scrollbarWidth: 'none' }}>
            {featuredProperties.map((prop) => (
              <div key={prop.id} className="w-[260px] shrink-0 rounded-3xl bg-white p-3 shadow-[0_8px_20px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-3 group active:scale-[0.98] transition-all cursor-pointer hover:shadow-lg">
                <div className="relative">
                  <PropertyGraphic theme={prop.graphic} />
                  
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-800">{prop.rating}</span>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 bg-indigo-600/95 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {prop.match} Match
                  </div>
                </div>
                
                <div className="px-1 pb-1">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-bold text-slate-800 text-base leading-tight truncate pr-2">{prop.title}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSave(prop.id); }}
                      className="text-slate-300 hover:text-rose-500 active:scale-90 transition-all shrink-0 p-1 -m-1"
                    >
                      <Heart className={`w-5 h-5 transition-colors ${saved.includes(prop.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs font-medium mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> 
                    <span className="truncate">{prop.location}</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-extrabold text-indigo-700 text-lg">
                      {prop.price}<span className="text-xs text-slate-400 font-medium font-sans">/mo</span>
                    </p>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-2 py-1.5 rounded-md">
                      {prop.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Areas */}
        <div className="px-6 pb-6 mt-2">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Popular in Bengaluru</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularAreas.map((area, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center gap-3 shadow-[0_4px_10px_rgb(0,0,0,0.02)] hover:shadow-md active:scale-[0.97] transition-all cursor-pointer group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center text-white shadow-inner shrink-0 group-hover:scale-105 transition-transform`}>
                  <area.icon className="w-5 h-5 opacity-90" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{area.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{area.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roommate Banner */}
        <div className="px-6 mb-10 mt-2">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-transform cursor-pointer">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
            <div className="relative z-10 w-[70%]">
              <h2 className="text-lg font-bold mb-1.5 flex items-center gap-1.5">
                Find your tribe <Users className="w-4 h-4" />
              </h2>
              <p className="text-indigo-100 text-xs mb-4 leading-relaxed font-medium">Connect with verified professionals looking for shared flats.</p>
              <button className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">
                Browse Profiles
              </button>
            </div>
            <div className="absolute -right-4 -bottom-6 opacity-20 transform -rotate-12">
              <Users className="w-36 h-36" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 flex justify-between items-center z-50 shrink-0 h-[88px] pb-6 pt-2">
        {navItems.map((item, idx) => (
          <button key={idx} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors group ${item.active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <div className="relative">
              <item.icon className={`w-6 h-6 transition-transform ${item.active ? 'scale-110' : 'group-hover:scale-110'}`} />
              {item.active && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
              )}
            </div>
            <span className={`text-[10px] mt-1 ${item.active ? 'font-bold' : 'font-semibold'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
