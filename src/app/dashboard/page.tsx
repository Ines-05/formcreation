'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Search, ExternalLink, Copy, EllipsisVertical, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

interface FormStats {
  formId: string;
  title: string;
  description?: string;
  submissionCount: number;
  createdAt: string;
  shareableLink: string;
  shortLink?: string;
  tool?: string;
  platform?: string;
}

interface DashboardStats {
  totalForms: number;
  formsThisMonth: number;
  favoriteTools: Record<string, number>;
}

export default function Dashboard() {
  const router = useRouter();
  const [forms, setForms] = useState<FormStats[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    formsThisMonth: 0,
    favoriteTools: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'google' | 'tally' | 'typeform'>('all');

  const { user, isLoaded } = useUser();
  const userId = user?.id || 'anonymous';

  // Helper function pour afficher les logos des outils
  const getToolLogo = (tool: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };

    switch (tool) {
      case 'google':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Image
              src="/googeform.png"
              alt="Google Forms"
              fill
              className="object-contain"
              sizes={size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px'}
            />
          </div>
        );
      case 'typeform':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Image
              src="/typeformlogo.jpg"
              alt="Typeform"
              fill
              className="object-contain rounded"
              sizes={size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px'}
            />
          </div>
        );
      case 'tally':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Image
              src="/logo_v2.png"
              alt="Tally"
              fill
              className="object-contain"
              sizes={size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px'}
            />
          </div>
        );
      default:
        return (
          <div className={`${sizeClasses[size]} text-gray-600 flex items-center justify-center`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
    }
  };

  useEffect(() => {
    if (isLoaded && userId !== 'anonymous') {
      fetchDashboardData();
    }
  }, [isLoaded, userId]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('Invalid response from server');
      }

      const data = await response.json();

      if (data.success) {
        setForms(data.forms || []);
        setStats(data.stats || { totalForms: 0, formsThisMonth: 0, favoriteTools: {} });
      } else {
        console.error('Error fetching dashboard data:', data.error);
        // Fallback vers des données vides
        setForms([]);
        setStats({ totalForms: 0, formsThisMonth: 0, favoriteTools: {} });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback vers des données vides
      setForms([]);
      setStats({ totalForms: 0, formsThisMonth: 0, favoriteTools: {} });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return forms.filter(fm => {
      const q = query.trim().toLowerCase();
      const matchQuery = q.length === 0 ||
        fm.title.toLowerCase().includes(q) ||
        (fm.shareableLink && fm.shareableLink.toLowerCase().includes(q));

      let host = 'all';
      if (fm.tool) {
        host = fm.tool;
      } else if (fm.shareableLink) {
        if (fm.shareableLink.includes('tally.so')) host = 'tally';
        else if (fm.shareableLink.includes('typeform.com')) host = 'typeform';
        else if (fm.shareableLink.includes('docs.google.com/forms')) host = 'google';
      }

      const matchFilter = filter === 'all' || filter === host;
      return matchQuery && matchFilter;
    });
  }, [forms, query, filter]);

  const getFavoriteTool = () => {
    const tools = stats.favoriteTools;
    if (Object.keys(tools).length === 0) {
      return getToolLogo('default', 'lg');
    }

    const favorite = Object.entries(tools).reduce((a, b) =>
      tools[a[0]] > tools[b[0]] ? a : b
    );

    return getToolLogo(favorite[0], 'lg');
  };

  return (
    <div className="min-h-screen bg-gradient-mesh-light relative overflow-hidden font-sans text-foreground">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      {/* Header / Actions */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12">
        <div className="flex items-center justify-between gap-6">
          <button
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 hover:opacity-80 transition-opacity"
            onClick={() => router.push('/')}
            aria-label="Aller au chat FormBuilder"
          >
            Dashboard
          </button>
          <div className="flex items-center gap-4 pr-12 md:pr-14">
            <Button
              className="rounded-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
              onClick={() => router.push('/')}
            >
              <Plus className="w-4 h-4" />
              Nouveau formulaire
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-12 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Mes formulaires</h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
            Gérez, analysez et partagez vos créations. Vos formulaires les plus impactants sont ici.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 mb-10">
          <div className="flex-1 w-full bg-white/50 hover:bg-white/80 transition-colors rounded-xl px-4 py-3 flex items-center gap-3 border border-white/40 focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un formulaire par titre ou outil..."
              className="w-full bg-transparent outline-none text-base placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {([
              { k: 'all', label: 'Tous', logo: null },
              { k: 'google', label: 'Google', logo: 'google' },
              { k: 'tally', label: 'Tally', logo: 'tally' },
              { k: 'typeform', label: 'Typeform', logo: 'typeform' },
            ] as const).map((chip) => (
              <button
                key={chip.k}
                onClick={() => setFilter(chip.k as 'all' | 'google' | 'tally' | 'typeform')}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                    ${filter === chip.k
                    ? 'bg-white text-primary shadow-md shadow-gray-100 ring-1 ring-black/5'
                    : 'hover:bg-white/40 text-muted-foreground hover:text-foreground'}
                  `}
              >
                {chip.logo && getToolLogo(chip.logo, 'sm')}
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse p-6 space-y-4">
                <div className="h-6 w-1/3 bg-gray-200 rounded-md" />
                <div className="h-4 w-2/3 bg-gray-200 rounded-md" />
                <div className="flex-1" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex justify-center items-center w-20 h-20 bg-primary/5 rounded-full mb-6 text-primary">
                <Search className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                {query ? 'Essayez de modifier vos termes de recherche ou vos filtres.' : 'Commencez par créer votre premier formulaire intelligent avec l\'IA.'}
              </p>
              <Button
                className="rounded-full h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                onClick={() => router.push('/')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer maintenant
              </Button>
            </div>
          ) : (
            filtered.map((form, index) => {
              // Logic for display
              const toolDisplay = form.tool || (
                form.shareableLink?.includes('tally.so') ? 'tally' :
                  form.shareableLink?.includes('typeform.com') ? 'typeform' :
                    form.shareableLink?.includes('docs.google.com/forms') ? 'google' : 'unknown'
              );

              const host = toolDisplay === 'tally' ? 'Tally' :
                toolDisplay === 'typeform' ? 'Typeform' :
                  toolDisplay === 'google' ? 'Google' : 'Inconnu';

              const badgeStyle = toolDisplay === 'tally' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                toolDisplay === 'typeform' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-blue-50 text-blue-700 border-blue-200';

              return (
                <motion.div
                  key={form.formId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card hover:border-primary/30 p-6 flex flex-col group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Decorative gradient blob on hover */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${badgeStyle}`}>
                      {getToolLogo(toolDisplay, 'sm')} {host}
                    </span>
                    <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <EllipsisVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{form.title}</h3>
                    {form.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{form.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <span>{new Date(form.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-70">📊</span>
                        <span>{form.submissionCount} réponses</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3 relative z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-primary/30 text-xs h-10 rounded-xl"
                      onClick={() => {
                        const linkToCopy = form.shortLink || form.shareableLink;
                        if (linkToCopy) navigator.clipboard.writeText(linkToCopy);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2 opacity-70" />
                      Copier
                    </Button>
                    <Button
                      size="sm"
                      className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-xl h-10 shadow-lg shadow-primary/20"
                      onClick={() => {
                        const linkToOpen = form.shortLink || form.shareableLink;
                        if (linkToOpen) window.open(linkToOpen, '_blank');
                      }}
                      disabled={!form.shareableLink}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Ouvrir
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-2 p-3 bg-blue-50 text-blue-600 rounded-full">
              <span className="text-xl">📈</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Formulaires</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalForms}</p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-2 p-3 bg-purple-50 text-purple-600 rounded-full">
              <span className="text-xl">📅</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Créations ce mois</p>
            <p className="text-4xl font-bold text-gray-900">{stats.formsThisMonth}</p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-2 p-3 bg-orange-50 text-orange-600 rounded-full">
              <span className="text-xl">🏆</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Outil Favori</p>
            <div className="mt-1 transform scale-125">{getFavoriteTool()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
