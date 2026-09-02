<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reverb UI - {{ config('app.name') }}</title>
    <link rel="icon" type="image/png" href="{{ asset('vendor/reverb-ui/logo.png') }}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        [x-cloak] { display: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #020617; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-50 font-sans antialiased" x-data="reverbUI" x-cloak>
    <div id="reverb-ui" class="min-h-screen flex flex-col">
        <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-500/20 bg-slate-800">
                        <img src="{{ asset('vendor/reverb-ui/logo.png') }}" alt="Knowclerk Logo" class="w-full h-full object-cover">
                    </div>
                    <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Reverb UI - {{ config('app.name') }}</h1>
                </div>
                <div class="flex items-center gap-4">
                    <button @click="showDocs = true" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Docs</span>
                    </button>
                    
                    <button @click="clearDashboard" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest border border-red-500/20" :disabled="clearing">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span x-text="clearing ? 'Resetting...' : 'Reset Log'"></span>
                    </button>
                </div>
            </div>
        </header>

        <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm transform transition hover:scale-[1.02]">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Total Messages</p>
                        <span class="text-[9px] text-slate-600 italic">captured</span>
                    </div>
                    <p class="text-3xl font-black text-indigo-400 font-mono" x-text="filtered_stats.total_messages.toLocaleString()"></p>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm transform transition hover:scale-[1.02]">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Connections</p>
                        <span class="text-[9px] text-slate-600 italic">captured</span>
                    </div>
                    <p class="text-3xl font-black text-emerald-400 font-mono" x-text="filtered_stats.total_connections.toLocaleString()"></p>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm transform transition hover:scale-[1.02]">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Unique Events</p>
                        <span class="text-[9px] text-slate-600 italic">filtered</span>
                    </div>
                    <p class="text-3xl font-black text-amber-400 font-mono" x-text="filtered_stats.unique_events.toLocaleString()"></p>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm transform transition hover:scale-[1.02]">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Unique Channels</p>
                        <span class="text-[9px] text-slate-600 italic">filtered</span>
                    </div>
                    <p class="text-3xl font-black text-purple-400 font-mono" x-text="filtered_stats.unique_channels.toLocaleString()"></p>
                </div>
            </div>

            <!-- Visual Analytics Section (Ignored by Alpine to prevent Proxy recursion) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" x-ignore>
                <!-- Line Chart: Message Influx -->
                <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Traffic Influx (30m)</h3>
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span class="text-[9px] text-slate-500 uppercase font-bold">Real-time</span>
                        </div>
                    </div>
                    <div class="flex-1 min-h-[300px] relative">
                        <canvas id="influxChart"></canvas>
                    </div>
                </div>

                <!-- Pie Chart: Top Events & Channels -->
                <div class="lg:col-span-1 flex flex-col gap-6">
                    <div class="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
                        <h3 class="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-6 border-b border-slate-800 pb-2">Event Distribution</h3>
                        <div class="h-[180px] relative">
                            <canvas id="eventChart"></canvas>
                        </div>
                    </div>
                    <div class="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
                        <h3 class="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-6 border-b border-slate-800 pb-2">Channel Distribution</h3>
                        <div class="h-[180px] relative">
                            <canvas id="channelChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col mb-8" x-data="{ showFilters: true }">
                <!-- Card Header -->
                <div class="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <h2 class="text-lg font-semibold flex items-center gap-2">
                            Recent Events
                            <span class="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-tighter border border-indigo-500/20" :class="auto_refresh ? 'opacity-100' : 'opacity-40'">Live Stream</span>
                        </h2>
                        
                        <!-- Auto-Refresh Toggle -->
                        <div class="flex items-center gap-2 ml-2">
                            <button @click="auto_refresh = !auto_refresh" 
                                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900"
                                :class="auto_refresh ? 'bg-indigo-600' : 'bg-slate-700'"
                                role="switch" :aria-checked="auto_refresh">
                                <span class="sr-only">Toggle auto-refresh</span>
                                <span aria-hidden="true" 
                                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                    :class="auto_refresh ? 'translate-x-4' : 'translate-x-0'"></span>
                            </button>
                            <span class="text-[9px] uppercase font-bold tracking-widest text-slate-500" :class="auto_refresh ? 'text-indigo-400' : ''" x-text="auto_refresh ? 'ON' : 'OFF'"></span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <button @click="showFilters = !showFilters" class="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition-colors">
                            <svg class="w-4 h-4" :class="showFilters ? 'text-indigo-400' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span x-text="showFilters ? 'Hide Filters' : 'Show Filters'"></span>
                        </button>
                        <div class="h-4 w-px bg-slate-800 hidden sm:block"></div>
                        <span class="text-[10px] text-slate-500 font-medium">Page <span x-text="meta.current_page"></span> of <span x-text="meta.last_page"></span></span>
                    </div>
                </div>

                <!-- Advanced Filters Bar -->
                <div id="reverb-filters" x-show="showFilters" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-4 items-end">
                        <div class="xl:col-span-3">
                            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-widest">Search Payload</label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input type="text" x-model.debounce.300ms="filters.search" id="search-input" placeholder="Keyword..." 
                                    class="block w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-3 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all h-[38px]">
                            </div>
                        </div>

                        <!-- Custom Searchable Select: Event Type -->
                        <div class="xl:col-span-2 relative" x-data="{ open: false, query: '' }">
                            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-widest">Event Type</label>
                            <div @click.away="open = false" class="relative">
                                <button @click="open = !open" 
                                    class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 text-left flex items-center justify-between h-[38px] focus:ring-1 focus:ring-indigo-500/50 hover:bg-slate-900 transition-colors">
                                    <div class="flex items-center gap-2 truncate">
                                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                        <span x-text="filters.event || 'All Events'" class="truncate"></span>
                                    </div>
                                    <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div x-show="open" class="absolute z-20 mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <div class="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
                                        <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <input type="text" x-model="query" placeholder="Filter..." 
                                            class="w-full bg-transparent border-none p-0 text-[11px] text-slate-300 focus:outline-none focus:ring-0">
                                    </div>
                                    <div class="max-h-48 overflow-auto custom-scrollbar">
                                        <button @click="filters.event = ''; filters.page = 1; open = false; query = ''" 
                                            class="w-full text-left px-3 py-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">All Events</button>
                                        <template x-for="item in options.events.filter(i => i.toLowerCase().includes(query.toLowerCase()))" :key="item">
                                            <button @click="filters.event = item; filters.page = 1; open = false; query = ''" 
                                                class="w-full text-left px-3 py-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" x-text="item"></button>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Custom Searchable Select: Target Channel -->
                        <div class="xl:col-span-2 relative" x-data="{ open: false, query: '' }">
                            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-widest">Target Channel</label>
                            <div @click.away="open = false" class="relative">
                                <button @click="open = !open" 
                                    class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 text-left flex items-center justify-between h-[38px] focus:ring-1 focus:ring-indigo-500/50 hover:bg-slate-900 transition-colors">
                                    <div class="flex items-center gap-2 truncate">
                                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                        <span x-text="filters.channel || 'All Channels'" class="truncate"></span>
                                    </div>
                                    <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div x-show="open" class="absolute z-20 mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <div class="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
                                        <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <input type="text" x-model="query" placeholder="Filter..." 
                                            class="w-full bg-transparent border-none p-0 text-[11px] text-slate-300 focus:outline-none focus:ring-0">
                                    </div>
                                    <div class="max-h-48 overflow-auto custom-scrollbar">
                                        <button @click="filters.channel = ''; filters.page = 1; open = false; query = ''" 
                                            class="w-full text-left px-3 py-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">All Channels</button>
                                        <template x-for="item in options.channels.filter(i => i.toLowerCase().includes(query.toLowerCase()))" :key="item">
                                            <button @click="filters.channel = item; filters.page = 1; open = false; query = ''" 
                                                class="w-full text-left px-3 py-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" x-text="item"></button>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="xl:col-span-4">
                            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-widest">Date Range</label>
                            <div class="flex items-center gap-2">
                                <input type="datetime-local" x-model="filters.from" class="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 sm:px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 h-[38px]">
                                <span class="text-slate-700 font-bold">-</span>
                                <input type="datetime-local" x-model="filters.to" class="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 sm:px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 h-[38px]">
                            </div>
                        </div>

                        <div class="xl:col-span-1 flex items-center justify-start sm:justify-end gap-2">
                            <button @click="resetFilters" 
                                class="flex-1 sm:flex-none p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-700 h-[38px]" 
                                title="Reset Filters">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                <span class="sm:hidden text-[10px] font-bold uppercase tracking-widest">Reset</span>
                            </button>
                            <button @click="fetchEvents" 
                                class="flex-1 sm:flex-none p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500/30 h-[38px]" 
                                title="Run Search">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <span class="sm:hidden text-[10px] font-bold uppercase tracking-widest">Search</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Table Section -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-800/50 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                            <tr>
                                <th class="px-6 py-3">Event</th>
                                <th class="px-6 py-3">Channel / Conn</th>
                                <th class="px-6 py-3">Size</th>
                                <th class="px-6 py-3">Payload</th>
                                <th class="px-6 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800">
                            <template x-for="event in events" :key="event.id">
                                <tr class="hover:bg-slate-800/30 transition-colors group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <div class="w-1.5 h-1.5 rounded-full" :class="event.type === 'connection' ? 'bg-emerald-500' : 'bg-indigo-500'"></div>
                                            <span class="font-mono text-indigo-400 font-medium" x-text="event.event"></span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <template x-if="event.channel">
                                                <div class="relative group cursor-help">
                                                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 transition-all hover:bg-indigo-500/20">
                                                        <svg class="w-3 h-3 mr-1.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                        <span x-text="event.channel"></span>
                                                    </span>
                                                    <!-- Tooltip -->
                                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-xl">
                                                        Broadcast Channel
                                                    </div>
                                                </div>
                                            </template>
                                            <template x-if="!event.channel && (event.connection || event.type === 'connection')">
                                                <div class="relative group cursor-help">
                                                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition-all hover:bg-emerald-500/20">
                                                        <svg class="w-3 h-3 mr-1.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <span x-text="event.connection || 'Anonymous'"></span>
                                                    </span>
                                                    <!-- Tooltip -->
                                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-xl">
                                                        Socket Connection ID
                                                    </div>
                                                </div>
                                            </template>
                                            <template x-if="!event.channel && !event.connection && event.type !== 'connection'">
                                                <span class="text-slate-600 text-[10px] italic">Internal</span>
                                            </template>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono tracking-tighter" x-text="formatBytes(event.size_bytes)"></span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <button @click="showPayload(event)" class="text-[10px] uppercase font-bold tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">View Payload</button>
                                    </td>
                                    <td class="px-6 py-4 text-right text-slate-600 font-mono text-xs" x-text="formatTime(event.created_at)"></td>
                                </tr>
                            </template>
                            <tr x-show="events.length === 0">
                                <td colspan="5" class="px-6 py-12 text-center text-slate-500 italic" x-text="loading ? 'Polling server...' : 'No matching events found...'"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Footer -->
                <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div class="text-xs text-slate-500">
                        Showing <span class="font-bold text-slate-300" x-text="events.length"></span> of <span class="font-bold text-slate-300" x-text="meta.total"></span> events
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="prevPage" 
                            :disabled="meta.current_page <= 1"
                            class="px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Previous
                        </button>
                        <div class="flex items-center gap-1">
                            <template x-for="p in pageRange" :key="p">
                                <button @click="goToPage(p)" 
                                    class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors"
                                    :class="p === meta.current_page ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'"
                                    x-text="p"></button>
                            </template>
                        </div>
                        <button @click="nextPage" 
                            :disabled="meta.current_page >= meta.last_page"
                            class="px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Payload Modal -->
    <div x-show="modal.open" class="fixed inset-0 z-50 overflow-hidden" x-transition.opacity @keydown.escape.window="modal.open = false" style="display: none;">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="modal.open = false"></div>
        <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div class="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-200">
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
                    <div>
                        <h3 class="font-bold text-lg text-white" x-text="modal.title"></h3>
                        <p class="text-xs text-slate-500 font-mono" x-text="modal.subtitle"></p>
                    </div>
                    <button @click="modal.open = false" class="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-auto p-6 bg-[#020617] custom-scrollbar">
                    <pre class="font-mono text-sm leading-relaxed" x-html="modal.content"></pre>
                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end flex-shrink-0">
                    <button @click="copyPayload" class="text-xs px-4 py-2 rounded-lg font-medium transition-all active:scale-95" 
                        :class="copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
                        x-text="copied ? 'Copied!' : 'Copy JSON'"></button>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirm Reset Modal -->
    <div x-show="confirmReset.open" class="fixed inset-0 z-[60] overflow-hidden" x-transition.opacity @keydown.escape.window="confirmReset.open = false" style="display: none;">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="confirmReset.open = false"></div>
        <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-200">
                <div class="p-8 text-center">
                    <div class="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Clear All Data?</h3>
                    <p class="text-slate-400 text-sm mb-8 leading-relaxed">This will permanently delete all captured Reverb events and reset the message counters. This action cannot be undone.</p>
                    
                    <div class="flex gap-3">
                        <button @click="confirmReset.open = false" class="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors font-medium text-sm">Cancel</button>
                        <button @click="performReset" class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm" :disabled="clearing" x-text="clearing ? 'Clearing...' : 'Yes, Delete All'"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Documentation Modal -->
    <div x-show="showDocs" 
        x-cloak
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="showDocs = false"></div>
        
        <div class="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[85vh] overflow-hidden">
            
            <!-- Modal Header (Fixed) -->
            <div class="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-white tracking-tight text-lg">Knowledge Base</h3>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-1">System Documentation</p>
                    </div>
                </div>
                <button @click="showDocs = false" class="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Modal Content (Scrollable) -->
            <div class="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 pb-20">
                <!-- 1. Technical Overview -->
                <section>
                    <div class="flex items-center gap-2 mb-6">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                        <h4 class="text-indigo-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">Technical Overview</h4>
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                    </div>
                    <div class="space-y-4">
                        <p class="text-slate-300 leading-relaxed text-sm text-justify">
                            Reverb UI is a premium, low-overhead telemetry engine architected for <a href="https://reverb.laravel.com" target="_blank" class="text-white font-medium underline underline-offset-8 decoration-indigo-500/50 hover:decoration-indigo-500 transition-all">Laravel Reverb</a>. It transforms raw WebSocket packets into actionable intelligence, providing developers with a real-time window into their server's pulse without sacrificing performance or scalability.
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 text-center group hover:border-indigo-500/30 transition-all">
                                <div class="text-indigo-400 font-black text-xl mb-1">98%</div>
                                <div class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">I/O Efficiency</div>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 text-center group hover:border-emerald-500/30 transition-all">
                                <div class="text-emerald-400 font-black text-xl mb-1">&lt;1ms</div>
                                <div class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Capture Latency</div>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 text-center group hover:border-amber-500/30 transition-all">
                                <div class="text-amber-400 font-black text-xl mb-1">0%</div>
                                <div class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">User Impact</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 2. Command Center -->
                <section class="space-y-6">
                    <h4 class="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4">Command Center (CLI)</h4>
                    <div class="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                        <div class="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Artisan Interface</span>
                            <div class="flex gap-1.5">
                                <div class="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40"></div>
                            </div>
                        </div>
                        <div class="p-6 font-mono text-xs space-y-6">
                            <div class="group">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-slate-500 italic"># Wipe entire telemetry database</span>
                                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-bold">Destructive</span>
                                </div>
                                <p class="text-indigo-300 bg-indigo-500/5 p-2 rounded border border-indigo-500/10">php artisan reverb-ui:prune --all</p>
                            </div>
                            <div class="group">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-slate-500 italic"># Targeted cleanup by channel & date</span>
                                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">Surgical</span>
                                </div>
                                <p class="text-indigo-300 bg-indigo-500/5 p-2 rounded border border-indigo-500/10">php artisan reverb-ui:prune --channel="orders" --from="2024-01-01"</p>
                            </div>
                            <div class="group">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-slate-500 italic"># Silent execution (for CRON jobs)</span>
                                </div>
                                <p class="text-indigo-300 bg-indigo-500/5 p-2 rounded border border-indigo-500/10">php artisan reverb-ui:prune --all --force</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 3. Configuration Breakdown -->
                <section class="space-y-8">
                    <h4 class="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Configuration Matrix</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <h6 class="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Path & Routing
                            </h6>
                            <p class="text-[11px] text-slate-500 leading-relaxed pl-3.5">
                                Modify <code class="text-indigo-400">'path'</code> in <code class="text-slate-300 text-[10px]">config/reverb-ui.php</code> to change the dashboard URI. Default: <code class="text-slate-400">/reverb-ui</code>.
                            </p>
                        </div>
                        <div class="space-y-2">
                            <h6 class="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Global Guard
                            </h6>
                            <p class="text-[11px] text-slate-500 leading-relaxed pl-3.5">
                                Add system events to <code class="text-emerald-400">'ignored_events'</code> to block them from the logs. Default: <code class="text-slate-400">pusher:ping/pong</code>.
                            </p>
                        </div>
                        <div class="space-y-2">
                            <h6 class="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Storage Driver
                            </h6>
                            <p class="text-[11px] text-slate-500 leading-relaxed pl-3.5">
                                Toggle between <code class="text-amber-400">'database'</code> and <code class="text-amber-400">'cache'</code> (Redis) for real-time stats persistence.
                            </p>
                        </div>
                        <div class="space-y-2">
                            <h6 class="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Retention Policy
                            </h6>
                            <p class="text-[11px] text-slate-500 leading-relaxed pl-3.5">
                                Set <code class="text-purple-400">'max_events'</code> to control table size. The background engine auto-prunes 1% of the time.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- 4. Security & Authorization -->
                <section class="space-y-6">
                    <h4 class="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Infrastructure Controls</h4>
                    <div class="space-y-4">
                        <div class="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                </div>
                                <div>
                                    <h5 class="text-white font-bold text-sm mb-1">Live Stream Control</h5>
                                    <p class="text-[11px] text-slate-400 leading-relaxed">
                                        Use the <code class="text-indigo-400">Auto-Refresh</code> toggle in the 'Recent Events' header to pause the incoming feed. This stabilizes the list for deep payload audits without stopping the background capture engine.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                </div>
                                <div>
                                    <h5 class="text-white font-bold text-sm mb-1">Environment Awareness</h5>
                                    <p class="text-[11px] text-slate-400 leading-relaxed">
                                        The UI is automatically enabled in <code class="text-indigo-400">local</code> to streamline development. You can customize the <code class="text-indigo-400">'always_allow_environments'</code> array in the config to add staging or testing environments.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                            <div class="flex items-start gap-4 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <div>
                                    <h5 class="text-white font-bold text-sm mb-1">Gate Authorization</h5>
                                    <p class="text-[11px] text-slate-400 leading-relaxed">
                                        Reverb UI is locked by default. Define the <code class="text-emerald-400">viewReverbUI</code> gate in your <code class="text-slate-300">AppServiceProvider</code> to grant access to specific admins.
                                    </p>
                                </div>
                            </div>
                            <div class="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-indigo-400/90 leading-relaxed border border-slate-800">
                                <div>Gate::define('viewReverbUI', function ($user) {</div>
                                <div class="pl-4 text-slate-500">// Only allow specific techies</div>
                                <div class="pl-4">return in_array($user->email, ['admin@techies.africa']);</div>
                                <div>});</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 5. Documentation & Credits -->
                <section class="space-y-6">
                    <h4 class="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Official Resources</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href="https://github.com/Techies-Africa/reverb-ui-laravel" target="_blank" class="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
                            <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </div>
                            <div>
                                <h6 class="text-white font-bold text-xs">Source Code</h6>
                                <p class="text-[10px] text-slate-500">View on GitHub</p>
                            </div>
                        </a>
                        <a href="https://reverb.laravel.com/" target="_blank" class="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all group">
                            <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <div>
                                <h6 class="text-white font-bold text-xs">Reverb Docs</h6>
                                <p class="text-[10px] text-slate-500">Official Laravel Docs</p>
                            </div>
                        </a>
                    </div>
                </section>

                <div class="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

                <!-- Final Words -->
                <div class="relative p-8 overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                    <div class="absolute inset-0 bg-indigo-500/[0.02]"></div>
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500"></div>
                    <p class="relative text-[11px] text-slate-400 italic leading-relaxed text-justify">
                        "Reverb UI is more than a dashboard; it's an engineering commitment to observability. Designed for industrial high-throughput, it ensures that your WebSocket infrastructure remains transparent, secure, and performant. Monitor with confidence, build with scale."
                    </p>
                    <div class="mt-4 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">System Operational</span>
                        </div>
                        <span class="text-[9px] text-slate-600 font-bold uppercase tracking-widest">v1.2.0-STABLE</span>
                    </div>
                </div>
            </div>

            <!-- Modal Footer (Fixed) -->
            <div class="px-6 py-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-md">
                <div class="flex items-center gap-2">
                    <img src="{{ asset('vendor/reverb-ui/logo.png') }}" class="w-4 h-4 opacity-50 grayscale">
                    <span class="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Techies Africa &copy; 2026</span>
                </div>
                <button @click="showDocs = false" class="px-6 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 border border-indigo-500/50">
                    Acknowledge
                </button>
            </div>
        </div>
    </div>

    <script>
        // High-level isolation: Move charts completely outside Alpine's reactivity scope
        window.reverbUICharts = { influx: null, events: null, channels: null };

        document.addEventListener('alpine:init', () => {
            Alpine.data('reverbUI', () => ({
                events: [],
                stats: { messages_count: 0, active_connections: 0 },
                filtered_stats: { total_messages: 0, total_connections: 0, unique_events: 0, unique_channels: 0 },
                filters: { search: '', event: '', channel: '', from: '', to: '', page: 1 },
                options: { events: [], channels: [] },
                meta: { current_page: 1, last_page: 1, total: 0 },
                loading: false,
                clearing: false,
                copied: false,
                modal: { open: false, title: '', subtitle: '', content: '', raw: '' },
                confirmReset: { open: false },
                showDocs: false,
                auto_refresh: true,

                init() {
                    this.fetchStats();
                    this.fetchEvents();
                    this.fetchFilterOptions();
                    this.initCharts();
                    this.fetchChartData();

                    setInterval(() => this.fetchStats(), 2000);
                    setInterval(() => {
                        if (!this.isInteractingWithFilters()) {
                            this.fetchFilterOptions();
                        }
                        this.fetchChartData();
                    }, 10000);

                    setInterval(() => {
                        if (this.auto_refresh && this.meta.current_page === 1 && !this.loading && !this.isInteractingWithFilters()) {
                            this.fetchEvents();
                        }
                    }, 5000);
                    
                    this.$watch('filters', (val, old) => {
                        if (JSON.stringify(val) !== JSON.stringify(old)) {
                            this.fetchEvents();
                        }
                    }, { deep: true });
                },

                isInteractingWithFilters() {
                    const focused = document.activeElement;
                    if (!focused) return false;
                    return focused.closest('#reverb-filters') !== null && (
                        focused.tagName === 'INPUT' || focused.tagName === 'SELECT'
                    );
                },

                async refresh() {
                    this.fetchStats();
                    this.fetchEvents();
                    this.fetchFilterOptions();
                    this.fetchChartData();
                },

                initCharts() {
                    const influxCtx = document.getElementById('influxChart');
                    const eventCtx = document.getElementById('eventChart');
                    const channelCtx = document.getElementById('channelChart');

                    if (!influxCtx || !eventCtx || !channelCtx) return;

                    Chart.defaults.color = '#64748b';
                    Chart.defaults.font.family = 'Inter, sans-serif';

                    window.reverbUICharts.influx = new Chart(influxCtx, {
                        type: 'line',
                        data: { labels: [], datasets: [{ 
                            label: 'Messages', 
                            data: [], 
                            borderColor: '#6366f1', 
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            borderWidth: 2
                        }]},
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false,
                            interaction: { intersect: false, mode: 'index' },
                            plugins: { legend: { display: false } },
                            scales: { 
                                y: { beginAtZero: true, grid: { color: 'rgba(30, 41, 59, 0.5)' } },
                                x: { grid: { display: false } }
                            }
                        }
                    });

                    const pieOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: { 
                            legend: { position: 'right', labels: { boxWidth: 10, font: { size: 9 }, padding: 10 } } 
                        }
                    };

                    window.reverbUICharts.events = new Chart(eventCtx, {
                        type: 'doughnut',
                        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'], borderWidth: 0 }] },
                        options: pieOptions
                    });

                    window.reverbUICharts.channels = new Chart(channelCtx, {
                        type: 'doughnut',
                        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'], borderWidth: 0 }] },
                        options: pieOptions
                    });
                },

                async fetchChartData() {
                    const charts = window.reverbUICharts;
                    if (!charts.influx) return;
                    
                    try {
                        const res = await fetch('{{ route('reverb-ui.api.chart-data') }}');
                        const data = await res.json();
                        
                        // Update Influx
                        const influx = data.influx || [];
                        charts.influx.data.labels = influx.map(i => i.minute + 'm');
                        charts.influx.data.datasets[0].data = influx.map(i => i.total);
                        charts.influx.update('none');

                        // Update Events
                        const events = data.events || [];
                        charts.events.data.labels = events.map(e => e.event);
                        charts.events.data.datasets[0].data = events.map(e => e.total);
                        charts.events.update('none');

                        // Update Channels
                        const channels = data.channels || [];
                        charts.channels.data.labels = channels.map(c => c.channel);
                        charts.channels.data.datasets[0].data = channels.map(c => c.total);
                        charts.channels.update('none');
                    } catch (e) {
                        console.error('ReverbUI Chart Error:', e);
                    }
                },

                async fetchStats() {
                    try {
                        const res = await fetch('{{ route('reverb-ui.api.stats') }}');
                        this.stats = await res.json();
                    } catch (e) {}
                },

                async fetchEvents() {
                    if (this.loading) return;
                    this.loading = true;
                    try {
                        const params = new URLSearchParams({
                            ...this.filters,
                            per_page: 50
                        });
                        const res = await fetch('{{ route('reverb-ui.api.events') }}?' + params.toString());
                        const data = await res.json();
                        this.events = data.data;
                        this.meta = data.meta;
                        this.filtered_stats = data.filtered_stats;
                    } catch (e) {
                    } finally {
                        this.loading = false;
                    }
                },

                async fetchFilterOptions() {
                    try {
                        const res = await fetch('{{ route('reverb-ui.api.filter-options') }}');
                        const data = await res.json();
                        this.options.events = data.events;
                        this.options.channels = data.channels;
                    } catch (e) {}
                },

                prevPage() { if (this.meta.current_page > 1) this.filters.page--; },
                nextPage() { if (this.meta.current_page < this.meta.last_page) this.filters.page++; },
                goToPage(p) { this.filters.page = p; },

                get pageRange() {
                    const range = [];
                    const start = Math.max(1, this.meta.current_page - 2);
                    const end = Math.min(this.meta.last_page, start + 4);
                    for (let i = start; i <= end; i++) range.push(i);
                    return range;
                },

                async clearDashboard() {
                    this.confirmReset.open = true;
                },

                async performReset() {
                    this.clearing = true;
                    try {
                        await fetch('{{ route('reverb-ui.api.clear') }}', { 
                            method: 'POST', 
                            headers: { 
                                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                                'Accept': 'application/json'
                            } 
                        });
                        this.filters.page = 1;
                        await this.refresh();
                    } catch (e) {
                    } finally {
                        this.clearing = false;
                        this.confirmReset.open = false;
                    }
                },

                showPayload(event) {
                    this.modal.title = event.event;
                    this.modal.subtitle = event.channel || event.connection || 'Internal';
                    const parsed = this.deepParse(event.payload);
                    this.modal.raw = JSON.stringify(parsed, null, 4);
                    this.modal.content = this.syntaxHighlight(this.modal.raw);
                    this.modal.open = true;
                },

                async copyPayload() {
                    await navigator.clipboard.writeText(this.modal.raw);
                    this.copied = true;
                    setTimeout(() => this.copied = false, 2000);
                },

                resetFilters() {
                    this.filters = { search: '', event: '', channel: '', from: '', to: '', page: 1 };
                },

                formatBytes(bytes) {
                    if (!bytes) return '0 B';
                    const k = 1024, sizes = ['B', 'KB', 'MB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                },

                formatTime(dateStr) {
                    return new Date(dateStr).toLocaleTimeString();
                },

                deepParse(obj) {
                    if (typeof obj === 'string') {
                        try {
                            const parsed = JSON.parse(obj);
                            if (parsed && typeof parsed === 'object') return this.deepParse(parsed);
                        } catch (e) {}
                    } else if (Array.isArray(obj)) {
                        return obj.map(item => this.deepParse(item));
                    } else if (obj !== null && typeof obj === 'object') {
                        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, this.deepParse(v)]));
                    }
                    return obj;
                },

                syntaxHighlight(json) {
                    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                        let cls = 'text-amber-400';
                        if (/^"/.test(match)) {
                            cls = /:$/.test(match) ? 'text-indigo-300' : 'text-emerald-400';
                        } else if (/true|false/.test(match)) {
                            cls = 'text-purple-400';
                        } else if (/null/.test(match)) {
                            cls = 'text-slate-500';
                        }
                        return '<span class="' + cls + '">' + match + '</span>';
                    });
                }
            }));
        });
    </script>
</body>
</html>
