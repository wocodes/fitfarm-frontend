'use client';

import React, { useState } from 'react';

interface ClassItem {
  id: string;
  name: string;
  category: 'Strength' | 'Cardio' | 'Combat' | 'Yoga';
  time: string;
  duration: string;
  trainer: string;
  intensity: 'High' | 'Moderate' | 'Low';
  capacity: string;
  room: string;
  image: string;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayName = typeof WEEK_DAYS[number];

const SCHEDULE_DATA: Record<DayName, ClassItem[]> = {
  Monday: [
    {
      id: 'm1',
      name: 'Olympic Strength & Barbell',
      category: 'Strength',
      time: '06:30 AM - 07:30 AM',
      duration: '60 min',
      trainer: 'Marcus Vance',
      intensity: 'High',
      capacity: '14 / 16 Booked',
      room: 'Main Rig & Racks',
      image: '/images/classes/l1.webp',
    },
    {
      id: 'm2',
      name: 'High-Octane HIIT Blast',
      category: 'Cardio',
      time: '09:00 AM - 10:00 AM',
      duration: '60 min',
      trainer: 'Sarah Jenkins',
      intensity: 'High',
      capacity: '18 / 20 Booked',
      room: 'Functional Turf Zone',
      image: '/images/classes/l2.webp',
    },
    {
      id: 'm3',
      name: 'Power Vinyasa & Core',
      category: 'Yoga',
      time: '12:00 PM - 01:00 PM',
      duration: '60 min',
      trainer: 'Elena Rostova',
      intensity: 'Moderate',
      capacity: '10 / 15 Booked',
      room: 'Mind & Body Studio',
      image: '/images/classes/l3.webp',
    },
    {
      id: 'm4',
      name: 'Muay Thai & Heavy Bag Drills',
      category: 'Combat',
      time: '06:00 PM - 07:15 PM',
      duration: '75 min',
      trainer: 'David Chen',
      intensity: 'High',
      capacity: '12 / 12 Full',
      room: 'Combat Ring & Bags',
      image: '/images/classes/l4.webp',
    },
  ],
  Tuesday: [
    {
      id: 't1',
      name: 'Functional Athletic Conditioning',
      category: 'Strength',
      time: '07:00 AM - 08:00 AM',
      duration: '60 min',
      trainer: 'Marcus Vance',
      intensity: 'High',
      capacity: '15 / 16 Booked',
      room: 'Turf & Power Sleds',
      image: '/images/classes/l5.webp',
    },
    {
      id: 't2',
      name: 'Spin & Endurance Sprint',
      category: 'Cardio',
      time: '10:00 AM - 11:00 AM',
      duration: '60 min',
      trainer: 'Sarah Jenkins',
      intensity: 'High',
      capacity: '20 / 22 Booked',
      room: 'Cardio Studio A',
      image: '/images/classes/l6.webp',
    },
    {
      id: 't3',
      name: 'Boxing Fundamentals & Footwork',
      category: 'Combat',
      time: '05:30 PM - 06:45 PM',
      duration: '75 min',
      trainer: 'David Chen',
      intensity: 'High',
      capacity: '8 / 14 Booked',
      room: 'Combat Ring & Bags',
      image: '/images/classes/l4.webp',
    },
    {
      id: 't4',
      name: 'Deep Fascial Mobility & Recovery',
      category: 'Yoga',
      time: '07:30 PM - 08:30 PM',
      duration: '60 min',
      trainer: 'Elena Rostova',
      intensity: 'Low',
      capacity: '9 / 18 Booked',
      room: 'Mind & Body Studio',
      image: '/images/classes/l3.webp',
    },
  ],
  Wednesday: [
    {
      id: 'w1',
      name: 'Deadlift & Posterior Chain Lab',
      category: 'Strength',
      time: '06:30 AM - 07:45 AM',
      duration: '75 min',
      trainer: 'Marcus Vance',
      intensity: 'High',
      capacity: '12 / 12 Full',
      room: 'Olympic Platforms',
      image: '/images/classes/l1.webp',
    },
    {
      id: 'w2',
      name: 'MetCon Calorie Furnace',
      category: 'Cardio',
      time: '09:00 AM - 10:00 AM',
      duration: '60 min',
      trainer: 'Sarah Jenkins',
      intensity: 'High',
      capacity: '16 / 20 Booked',
      room: 'Functional Turf Zone',
      image: '/images/classes/l2.webp',
    },
    {
      id: 'w3',
      name: 'Ashtanga Yoga Flow',
      category: 'Yoga',
      time: '05:00 PM - 06:00 PM',
      duration: '60 min',
      trainer: 'Elena Rostova',
      intensity: 'Moderate',
      capacity: '14 / 15 Booked',
      room: 'Mind & Body Studio',
      image: '/images/classes/l3.webp',
    },
    {
      id: 'w4',
      name: 'Kickboxing Padwork & Sparring',
      category: 'Combat',
      time: '06:30 PM - 07:45 PM',
      duration: '75 min',
      trainer: 'David Chen',
      intensity: 'High',
      capacity: '11 / 14 Booked',
      room: 'Combat Ring & Bags',
      image: '/images/classes/l4.webp',
    },
  ],
  Thursday: [
    {
      id: 'th1',
      name: 'Hypertrophy Upper Body Blitz',
      category: 'Strength',
      time: '07:00 AM - 08:00 AM',
      duration: '60 min',
      trainer: 'Marcus Vance',
      intensity: 'High',
      capacity: '14 / 16 Booked',
      room: 'Main Free Weights',
      image: '/images/classes/l5.webp',
    },
    {
      id: 'th2',
      name: 'Row & Ski-Erg Interval Matrix',
      category: 'Cardio',
      time: '11:00 AM - 12:00 PM',
      duration: '60 min',
      trainer: 'Sarah Jenkins',
      intensity: 'High',
      capacity: '10 / 12 Booked',
      room: 'Cardio Theater',
      image: '/images/classes/l6.webp',
    },
    {
      id: 'th3',
      name: 'Combat Conditioning & Clinch',
      category: 'Combat',
      time: '05:30 PM - 06:45 PM',
      duration: '75 min',
      trainer: 'David Chen',
      intensity: 'High',
      capacity: '13 / 14 Booked',
      room: 'Combat Ring & Bags',
      image: '/images/classes/l4.webp',
    },
    {
      id: 'th4',
      name: 'Restorative Yin Yoga & Sound Bath',
      category: 'Yoga',
      time: '07:15 PM - 08:15 PM',
      duration: '60 min',
      trainer: 'Elena Rostova',
      intensity: 'Low',
      capacity: '17 / 18 Booked',
      room: 'Mind & Body Studio',
      image: '/images/classes/l3.webp',
    },
  ],
  Friday: [
    {
      id: 'f1',
      name: 'Full Body Barbell Complex',
      category: 'Strength',
      time: '06:30 AM - 07:30 AM',
      duration: '60 min',
      trainer: 'Marcus Vance',
      intensity: 'High',
      capacity: '16 / 16 Full',
      room: 'Olympic Platforms',
      image: '/images/classes/l1.webp',
    },
    {
      id: 'f2',
      name: 'Friday Sunset HIIT & Burn',
      category: 'Cardio',
      time: '05:00 PM - 06:00 PM',
      duration: '60 min',
      trainer: 'Sarah Jenkins',
      intensity: 'High',
      capacity: '19 / 20 Booked',
      room: 'Functional Turf Zone',
      image: '/images/classes/l2.webp',
    },
    {
      id: 'f3',
      name: 'Friday Night Fight Club Boxing',
      category: 'Combat',
      time: '06:30 PM - 08:00 PM',
      duration: '90 min',
      trainer: 'David Chen',
      intensity: 'High',
      capacity: '14 / 14 Full',
      room: 'Combat Ring & Bags',
      image: '/images/classes/l4.webp',
    },
  ],
  Saturday: [
    {
      id: 'sa1',
      name: 'Weekend Warrior Strongman Session',
      category: 'Strength',
      time: '08:30 AM - 10:00 AM',
      duration: '90 min',
      trainer: 'Marcus Vance',
      intensity: 'High',
      capacity: '18 / 20 Booked',
      room: 'Turf & Free Weight Rig',
      image: '/images/classes/l5.webp',
    },
    {
      id: 'sa2',
      name: 'Cardio Endurance Camp',
      category: 'Cardio',
      time: '10:30 AM - 11:45 AM',
      duration: '75 min',
      trainer: 'Sarah Jenkins',
      intensity: 'High',
      capacity: '15 / 20 Booked',
      room: 'Functional Turf Zone',
      image: '/images/classes/l6.webp',
    },
    {
      id: 'sa3',
      name: 'Weekend Recovery Yoga & Alignment',
      category: 'Yoga',
      time: '12:15 PM - 01:30 PM',
      duration: '75 min',
      trainer: 'Elena Rostova',
      intensity: 'Low',
      capacity: '12 / 18 Booked',
      room: 'Mind & Body Studio',
      image: '/images/classes/l3.webp',
    },
  ],
  Sunday: [
    {
      id: 'su1',
      name: 'Active Recovery & Guided Mobility',
      category: 'Yoga',
      time: '09:00 AM - 10:15 AM',
      duration: '75 min',
      trainer: 'Elena Rostova',
      intensity: 'Low',
      capacity: '14 / 18 Booked',
      room: 'Mind & Body Studio',
      image: '/images/classes/l3.webp',
    },
    {
      id: 'su2',
      name: 'Open Gym Free Weight Technique',
      category: 'Strength',
      time: '11:00 AM - 01:00 PM',
      duration: '120 min',
      trainer: 'Marcus Vance',
      intensity: 'Moderate',
      capacity: 'Open Floor Access',
      room: 'Olympic Free Weights',
      image: '/images/classes/l1.webp',
    },
    {
      id: 'su3',
      name: 'Muay Thai Sparring Lab (Advanced)',
      category: 'Combat',
      time: '03:00 PM - 04:30 PM',
      duration: '90 min',
      trainer: 'David Chen',
      intensity: 'High',
      capacity: '8 / 10 Booked',
      room: 'Combat Ring & Bags',
      image: '/images/classes/l4.webp',
    },
  ],
};

interface ClassScheduleSectionProps {
  tenantName?: string;
  schedule?: Record<string, ClassItem[]>;
  onSelectClass?: (className: string) => void;
}

export default function ClassScheduleSection({
  tenantName = 'PolanFit Arena',
  schedule,
  onSelectClass,
}: ClassScheduleSectionProps) {
  // Get current day of week to default smartly
  const todayName = WEEK_DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [selectedDay, setSelectedDay] = useState<DayName>(todayName);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reservedMsg, setReservedMsg] = useState<string | null>(null);

  const activeSchedule = schedule && Object.keys(schedule).length > 0 ? schedule : SCHEDULE_DATA;
  const classes = activeSchedule[selectedDay] || [];
  const filteredClasses = selectedCategory === 'All'
    ? classes
    : classes.filter((c) => c.category === selectedCategory);

  const handleReserve = (cls: ClassItem) => {
    if (onSelectClass) {
      onSelectClass(cls.name);
    }
    setReservedMsg(`✨ Class slot selected for "${cls.name}" with ${cls.trainer} on ${selectedDay}. Sign in to confirm reservation.`);
    setTimeout(() => setReservedMsg(null), 5000);
  };

  return (
    <section className="w-full py-16 px-6 max-w-6xl mx-auto space-y-8" id="schedule">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
              Weekly Timetable
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Class Schedule & Group Sessions
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            From high-octane morning strength to evening combat drills. Turnstile entry is included with all active memberships at {tenantName}.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center flex-wrap gap-1.5 bg-[#0e0e12] p-1.5 rounded-2xl border border-gray-800">
          {['All', 'Strength', 'Cardio', 'Combat', 'Yoga'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reservation Notification */}
      {reservedMsg && (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{reservedMsg}</span>
          <button onClick={() => setReservedMsg(null)} className="text-orange-400 hover:text-white ml-3 font-mono">✕</button>
        </div>
      )}

      {/* Days of Week Tab Bar */}
      <div className="grid grid-cols-7 gap-2 overflow-x-auto pt-3.5 pb-2">
        {WEEK_DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = day === todayName;
          const dayClassesCount = activeSchedule[day]?.length || 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition border text-center relative ${
                isSelected
                  ? 'bg-orange-500/15 border-orange-500/50 shadow-lg shadow-orange-500/10'
                  : 'bg-[#0e0e12] border-gray-800/80 hover:border-gray-700 hover:bg-[#121217]'
              }`}
            >
              {isToday && (
                <span className="absolute -top-2.5 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-full bg-orange-500 text-[9px] font-black text-black uppercase tracking-wider shadow-md shadow-orange-500/40 z-10 pointer-events-none">
                  Today
                </span>
              )}
              <span className={`text-xs font-extrabold ${isSelected ? 'text-orange-400' : 'text-gray-300'}`}>
                {day.slice(0, 3)}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5 font-mono">
                {dayClassesCount} classes
              </span>
            </button>
          );
        })}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClasses.length === 0 ? (
          <div className="col-span-2 py-12 text-center rounded-3xl bg-[#0e0e12] border border-gray-800/80">
            <p className="text-sm text-gray-400">No {selectedCategory} classes scheduled for {selectedDay}.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-3 px-4 py-1.5 text-xs font-bold text-orange-400 hover:underline"
            >
              View all {selectedDay} classes
            </button>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const isFull = cls.capacity.includes('Full');
            return (
              <div
                key={cls.id}
                className="group relative rounded-3xl bg-[#0e0e12] border border-gray-800/80 hover:border-orange-500/40 transition-all p-5 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-orange-500/5 overflow-hidden"
              >
                {/* Background Subtle Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/10 transition"></div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[11px] font-bold">
                      {cls.time}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-gray-800 text-[10px] font-bold text-gray-300">
                        {cls.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        cls.intensity === 'High'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : cls.intensity === 'Moderate'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {cls.intensity === 'High' ? '🔥 High' : cls.intensity === 'Moderate' ? '⚡ Moderate' : '🧘 Low'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span>📍 {cls.room}</span>
                      <span>•</span>
                      <span>⏱️ {cls.duration}</span>
                    </p>
                  </div>
                </div>

                {/* Trainer & Booking Bar */}
                <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-xs font-black text-black">
                      {cls.trainer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-200">{cls.trainer}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{cls.capacity}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReserve(cls)}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                      isFull
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-black shadow-md shadow-orange-500/20'
                    }`}
                  >
                    {isFull ? 'Waitlist Only' : 'Reserve Spot'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
