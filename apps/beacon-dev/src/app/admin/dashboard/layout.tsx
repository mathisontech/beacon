'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Map,
  Layers,
  RefreshCw,
  PenTool,
  FolderKanban,
  Radar,
  Radio,
  AlertTriangle,
  Zap,
  Siren,
  Clock,
  CalendarClock,
  Eye,
  Crosshair,
  Brain,
  TriangleAlert,
  MapPin,
  Navigation,
  Route,
  Users,
  UserCog,
  UsersRound,
  Handshake,
  Heart,
  PawPrint,
  Bell,
  Wifi,
  FileSearch,
  Network,
  Flame,
  Plug,
  Globe,
  Package,
  MessageSquare,
  Contact,
  ShieldCheck,
  Activity,
  Smartphone,
} from 'lucide-react';
import { baseLayerCategories } from '@/data/baseLayerCategories';
import { baseMapSubmodules } from '@/data/baseMapSubmodules';
import { integrations } from '@/data/integrations';
import './dashboard.css';

// Visualization Manager groups — Base Map / Hazards / Live
const vizGroups = [
  {
    label: 'Base Map',
    docsHref: '/admin/dashboard/modules/base-map/docs',
    items: [
      { label: '2D', href: '/admin/dashboard/modules/base-map/views/flat', icon: Map },
      { label: '2D Satellite', href: '/admin/dashboard/modules/base-map/views/satellite', icon: Map },
      { label: '3D Clay', href: '/admin/dashboard/modules/base-map/views/clay', icon: Layers },
      { label: '3D Google Tiles', href: '/admin/dashboard/modules/base-map/views/google-3d', icon: Layers },
    ],
  },
  {
    label: 'Hazards',
    docsHref: '/admin/dashboard/modules/hazards/docs',
    items: [
      { label: 'Volcanoes', href: '/admin/dashboard/viz/hazards/volcanoes', icon: Flame },
      { label: 'Risk Layers', href: '/admin/dashboard/viz/hazards/risk-layers', icon: AlertTriangle },
      { label: 'Hazard Perimeters', href: '/admin/dashboard/viz/hazards/perimeters', icon: TriangleAlert },
      { label: 'Building Status Overlays', href: '/admin/dashboard/viz/hazards/building-status', icon: Layers },
    ],
  },
  {
    label: 'Live',
    docsHref: '/admin/dashboard/modules/live/docs',
    items: [
      { label: 'Vehicles', href: '/admin/dashboard/viz/live/vehicles', icon: Navigation },
      { label: 'Animals', href: '/admin/dashboard/viz/live/animals', icon: PawPrint },
      { label: 'Sensors & Cameras', href: '/admin/dashboard/viz/live/sensors', icon: Radar },
    ],
  },
];

// Module Manager groups (remaining modules)
const moduleGroups = [
  {
    label: 'Base Map',
    docsHref: '/admin/dashboard/modules/base-map/docs',
    items: [
      { label: 'Periodic Regional Layers', href: '/admin/dashboard/modules/base-map/layers', icon: Map, hasLayerDropdown: true },
      { label: 'Event-Triggered Updates', href: '/admin/dashboard/modules/base-map/event-updates', icon: RefreshCw },
      { label: 'User Map Adjustments', href: '/admin/dashboard/modules/base-map/user-adjustments', icon: PenTool },
      { label: 'User-Created Layers', href: '/admin/dashboard/modules/base-map/user-layers', icon: Layers },
      { label: 'Sensor-Driven Attributes', href: '/admin/dashboard/modules/base-map/sensor-attributes', icon: Radar },
    ],
  },
  {
    label: 'Condition Monitoring',
    docsHref: '/admin/dashboard/modules/condition-monitoring/docs',
    items: [
      { label: 'Official Situation Data', href: '/admin/dashboard/modules/condition-monitoring/situation-data', icon: Radio },
    ],
  },
  {
    label: 'Risk Monitoring',
    docsHref: '/admin/dashboard/modules/risk-monitoring/docs',
    items: [
      { label: 'Official Conditions', href: '/admin/dashboard/modules/risk-monitoring/conditions', icon: AlertTriangle },
    ],
  },
  {
    label: 'Event Triggers',
    docsHref: '/admin/dashboard/modules/event-triggers/docs',
    items: [
      { label: 'Sensor-Based Detection', href: '/admin/dashboard/modules/event-triggers/sensor-detection', icon: Zap },
      { label: 'Device-Driven Triggers', href: '/admin/dashboard/modules/event-triggers/device-triggers', icon: Radar },
      { label: 'User Sighting Triggers', href: '/admin/dashboard/modules/event-triggers/sighting-triggers', icon: Eye },
      { label: 'EMS Declaration', href: '/admin/dashboard/modules/event-triggers/ems-declaration', icon: Siren },
      { label: 'Official Source Events', href: '/admin/dashboard/modules/event-triggers/official-events', icon: Radio },
    ],
  },
  {
    label: 'Hazard Onset Response',
    docsHref: '/admin/dashboard/modules/hazard-onset/docs',
    items: [
      { label: 'Onset Response Manager', href: '/admin/dashboard/modules/hazard-onset/response-manager', icon: Siren },
      { label: 'Data & Polling Protocols', href: '/admin/dashboard/modules/hazard-onset/data-protocols', icon: Clock },
      { label: 'User Status & Requests', href: '/admin/dashboard/modules/hazard-onset/user-status', icon: Users },
      { label: 'Cache & Guidance Protocols', href: '/admin/dashboard/modules/hazard-onset/cache-guidance', icon: Navigation },
    ],
  },
  {
    label: 'Event Management',
    docsHref: '/admin/dashboard/modules/event-management/docs',
    items: [
      { label: 'Event Manager', href: '/admin/dashboard/modules/event-management/event-manager', icon: CalendarClock },
      { label: 'User Sighting Reports', href: '/admin/dashboard/modules/event-management/sighting-reports', icon: Eye },
      { label: 'Hazard Models', href: '/admin/dashboard/modules/event-management/hazard-models', icon: Brain },
      { label: 'User Danger', href: '/admin/dashboard/modules/event-management/user-danger', icon: TriangleAlert },
      { label: 'User Location', href: '/admin/dashboard/modules/event-management/user-location', icon: MapPin },
    ],
  },
  {
    label: 'Navigation & Terrain',
    docsHref: '/admin/dashboard/modules/navigation/docs',
    items: [
      { label: 'Passable Terrain', href: '/admin/dashboard/modules/navigation/passable-terrain', icon: Route },
      { label: 'Evacuation Manager', href: '/admin/dashboard/modules/navigation/evacuation', icon: Navigation },
    ],
  },
  {
    label: 'Event Operations',
    docsHref: '/admin/dashboard/modules/operations/docs',
    items: [
      { label: 'Teams Manager', href: '/admin/dashboard/modules/operations/teams', icon: UsersRound },
      { label: 'Resource & Dispatch', href: '/admin/dashboard/modules/operations/resource-dispatch', icon: Crosshair },
    ],
  },
  {
    label: 'People & Community',
    docsHref: '/admin/dashboard/modules/people/docs',
    items: [
      { label: 'Public User Accounts', href: '/admin/dashboard/modules/people/accounts', icon: Users },
      { label: 'Groups Manager', href: '/admin/dashboard/modules/people/groups', icon: FolderKanban },
      { label: 'People Helping People', href: '/admin/dashboard/modules/people/helping', icon: Heart },
      { label: 'Animal Rescue', href: '/admin/dashboard/modules/people/animal-rescue', icon: PawPrint },
    ],
  },
  {
    label: 'Communications & Alerts',
    docsHref: '/admin/dashboard/modules/comms/docs',
    items: [
      { label: 'Notifications & Alerts', href: '/admin/dashboard/modules/comms/notifications', icon: Bell },
      { label: 'Mesh Network', href: '/admin/dashboard/modules/comms/mesh-network', icon: Wifi },
    ],
  },
  {
    label: 'Post-Operations',
    docsHref: '/admin/dashboard/modules/post-ops/docs',
    items: [
      { label: 'Post-Event Manager', href: '/admin/dashboard/modules/post-ops/post-event', icon: FileSearch },
    ],
  },
];

// Top-level pages that aren't part of the module manager
const topNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Clients', href: '/admin/dashboard/clients', icon: UserCog },
  { label: 'Employees', href: '/admin/dashboard/employees', icon: Users },
  { label: 'Partnerships', href: '/admin/dashboard/partnerships', icon: Handshake },
];

// Product Manager - top-level section, one subtab per public app page
const productPages = [
  { label: 'Live Test Account', href: '/admin/dashboard/live-map', icon: Globe },
];

// Community > Project Manager (feature planning, CONFolders, specs)
const communityProjectTabs = [
  { label: 'Feature Overview', href: '/admin/dashboard/product/community/project/overview', icon: FolderKanban },
  { label: 'CONFolders', href: '/admin/dashboard/product/community/project/confolders', icon: FileSearch },
  { label: 'Notification Manager', href: '/admin/dashboard/product/community/notifications', icon: Bell },
];

// Community > DEV (module hierarchy, build, test)
const communityDevTabs = [
  { label: 'Module Hierarchy', href: '/admin/dashboard/product/community/dev/modules', icon: Network },
  { label: 'Standalone UI', href: '/admin/dashboard/product/community/dev/ui', icon: Smartphone },
  { label: 'Dev Monitor', href: '/admin/dashboard/product/community/dev-monitor', icon: Activity },
];

// Volcanoes > subtabs in the sidebar
const VOLCANOES_HREF = '/admin/dashboard/viz/hazards/volcanoes';
const VOLCANO_DM_HREF = `${VOLCANOES_HREF}/data-manager`;
const volcanoDmTabs = [
  { label: 'Data Source Manager', href: `${VOLCANO_DM_HREF}/sources`, icon: Globe },
  { label: 'Nations', href: `${VOLCANO_DM_HREF}/nations`, icon: Flame },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [lastTrackedPath, setLastTrackedPath] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [vizManagerOpen, setVizManagerOpen] = useState(false);
  const [moduleManagerOpen, setModuleManagerOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSubmodules, setOpenSubmodules] = useState<Record<string, boolean>>({});
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [productMgmtOpen, setProductMgmtOpen] = useState(false);
  const [productOpenTabs, setProductOpenTabs] = useState<Record<string, boolean>>({});
  const [communityProjectOpen, setCommunityProjectOpen] = useState(false);
  const [communityDevOpen, setCommunityDevOpen] = useState(false);
  const [volcanoesNavOpen, setVolcanoesNavOpen] = useState(false);
  const [volcanoDmNavOpen, setVolcanoDmNavOpen] = useState(false);

  const employee = session?.user;

  // Auto-open the group that contains the active page
  useEffect(() => {
    if (!pathname) return;
    // Auto-open Visualization Manager groups
    for (const group of vizGroups) {
      if (group.items.some(item => pathname.startsWith(item.href))) {
        setOpenGroups(prev => ({ ...prev, [`viz:${group.label}`]: true }));
        setVizManagerOpen(true);
        setProductMgmtOpen(true);
      }
    }
    // Auto-open Module Manager groups
    for (const group of moduleGroups) {
      if (group.items.some(item => pathname.startsWith(item.href))) {
        setOpenGroups(prev => ({ ...prev, [`mod:${group.label}`]: true }));
        setModuleManagerOpen(true);
        setProductMgmtOpen(true);
      }
    }
    // Auto-open integrations if on an integration page
    if (pathname?.startsWith('/admin/dashboard/integrations')) {
      setIntegrationsOpen(true);
    }
    // Auto-open product management if on a product page
    if (pathname?.startsWith('/admin/dashboard/product')) {
      setProductMgmtOpen(true);
      for (const page of productPages) {
        if (pathname.startsWith(page.href)) {
          setProductOpenTabs(prev => ({ ...prev, [page.label]: true }));
        }
      }
    }
    // Auto-open layer categories if navigating to a layer page
    const layerPrefix = '/admin/dashboard/modules/base-map/layers/';
    if (pathname?.startsWith(layerPrefix)) {
      setLayersOpen(true);
      for (const cat of baseLayerCategories) {
        const catPrefix = `${layerPrefix}${cat.slug}/`;
        if (pathname.startsWith(catPrefix)) {
          setOpenCategories(prev => ({ ...prev, [cat.slug]: true }));
        }
      }
    }
    // Auto-open Volcanoes subtree when on any volcano route
    if (pathname?.startsWith(VOLCANOES_HREF)) {
      setVolcanoesNavOpen(true);
      if (pathname.startsWith(VOLCANO_DM_HREF)) {
        setVolcanoDmNavOpen(true);
      }
    }
    // Auto-open submodule tabs
    for (const sub of baseMapSubmodules) {
      const subPrefix = `/admin/dashboard/modules/base-map/${sub.key}/`;
      if (pathname?.startsWith(subPrefix)) {
        setOpenSubmodules(prev => ({ ...prev, [sub.key]: true }));
      }
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Track page navigation
  useEffect(() => {
    if (employee?.id && pathname && pathname !== lastTrackedPath) {
      setLastTrackedPath(pathname);
      fetch('/api/admin/activity/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'page_view',
          target: 'page',
          targetId: pathname,
          details: { pathname },
        }),
      }).catch(console.error);
    }
  }, [pathname, employee?.id, lastTrackedPath]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/session/end', { method: 'POST' });
      await signOut({ redirect: false });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownOpen && !(e.target as Element).closest('.user-profile-container')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userDropdownOpen]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) && href !== '/admin/dashboard';
  };

  return (
    <div className="beacon-dashboard-container">
      <aside className="beacon-sidebar">
        <div className="sidebar-header">
          <Link href="/admin/dashboard" className="sidebar-logo-link">
            <Image src="/logo.png" alt="Beacon" width={42} height={24} style={{ flexShrink: 0, objectFit: 'contain' }} />
            <span className="sidebar-logo-text">BEACON</span>
            <span className="sidebar-logo-badge">DEV</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {/* Product Manager */}
          <button
            className={`nav-section-toggle ${productMgmtOpen ? 'open' : ''}`}
            onClick={() => setProductMgmtOpen(!productMgmtOpen)}
          >
            {productMgmtOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Product Manager</span>
          </button>

          {productMgmtOpen && (
            <div className="module-manager-content">
              {productPages.map((page) => {
                const Icon = page.icon;
                const active = pathname?.startsWith(page.href);
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={`nav-item nav-item-nested ${active ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" size={15} />
                    <span className="nav-text">{page.label}</span>
                  </Link>
                );
              })}

              {/* Visualization Manager */}
              <button
                className={`nav-section-toggle ${vizManagerOpen ? 'open' : ''}`}
                onClick={() => setVizManagerOpen(!vizManagerOpen)}
              >
                {vizManagerOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Visualization Manager</span>
              </button>
              {vizManagerOpen && (
                <div className="module-manager-content">
                  {vizGroups.map((group) => {
                    const grpKey = `viz:${group.label}`;
                    const grpOpen = openGroups[grpKey] || false;
                    const hasActive = group.items.some(item => pathname?.startsWith(item.href));
                    return (
                      <div key={grpKey} className="nav-group">
                        <button
                          className={`nav-group-toggle ${hasActive ? 'has-active' : ''}`}
                          onClick={() => toggleGroup(grpKey)}
                        >
                          {grpOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span>{group.label}</span>
                        </button>
                        {grpOpen && (
                          <div className="nav-group-items">
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              const itemActive = pathname?.startsWith(item.href);

                              // Volcanoes item gets nested subtabs in the sidebar.
                              if (item.href === VOLCANOES_HREF) {
                                const mapActive = pathname === VOLCANOES_HREF;
                                const dmActive = pathname?.startsWith(VOLCANO_DM_HREF);
                                return (
                                  <div key={item.href} className="nav-group">
                                    <button
                                      className={`nav-item nav-item-nested nav-submodule-toggle ${itemActive ? 'active' : ''}`}
                                      onClick={() => setVolcanoesNavOpen(p => !p)}
                                    >
                                      {volcanoesNavOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                      <ItemIcon className="nav-icon" size={15} />
                                      <span className="nav-text">{item.label}</span>
                                    </button>
                                    {volcanoesNavOpen && (
                                      <div className="nav-group-items">
                                        <Link
                                          href={VOLCANOES_HREF}
                                          className={`nav-item nav-item-nested ${mapActive ? 'active' : ''}`}
                                          style={{ paddingLeft: 44 }}
                                        >
                                          <Map className="nav-icon" size={13} />
                                          <span className="nav-text">Map</span>
                                        </Link>
                                        <button
                                          className={`nav-group-toggle ${dmActive ? 'has-active' : ''}`}
                                          onClick={() => setVolcanoDmNavOpen(p => !p)}
                                          style={{ paddingLeft: 44 }}
                                        >
                                          {volcanoDmNavOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                          <span>Volcano Data Manager</span>
                                        </button>
                                        {volcanoDmNavOpen && (
                                          <div className="nav-group-items">
                                            {volcanoDmTabs.map((tab) => {
                                              const TabIcon = tab.icon;
                                              const tabActive = pathname?.startsWith(tab.href);
                                              return (
                                                <Link
                                                  key={tab.href}
                                                  href={tab.href}
                                                  className={`nav-item nav-item-nested ${tabActive ? 'active' : ''}`}
                                                  style={{ paddingLeft: 60 }}
                                                >
                                                  <TabIcon className="nav-icon" size={12} />
                                                  <span className="nav-text">{tab.label}</span>
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`nav-item nav-item-nested ${itemActive ? 'active' : ''}`}
                                >
                                  <ItemIcon className="nav-icon" size={15} />
                                  <span className="nav-text">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Module Manager */}
              <button
                className={`nav-section-toggle ${moduleManagerOpen ? 'open' : ''}`}
                onClick={() => setModuleManagerOpen(!moduleManagerOpen)}
              >
                {moduleManagerOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Module Manager</span>
              </button>
              {moduleManagerOpen && (
                <div className="module-manager-content">
                  {/* Community */}
                  <div className="nav-group">
                    <button
                      className={`nav-group-toggle ${pathname?.includes('/community') ? 'has-active' : ''}`}
                      onClick={() => toggleGroup('Community')}
                    >
                      {openGroups['Community'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span>Community</span>
                    </button>
                    {openGroups['Community'] && (
                      <div className="nav-group-items">
                        {/* Project Manager */}
                        <div className="nav-group">
                          <button
                            className={`nav-group-toggle ${pathname?.includes('/community/project') || pathname?.includes('/community/notifications') ? 'has-active' : ''}`}
                            onClick={() => setCommunityProjectOpen(p => !p)}
                            style={{ paddingLeft: 28 }}
                          >
                            {communityProjectOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span>Project Manager</span>
                          </button>
                          {communityProjectOpen && (
                            <div className="nav-group-items">
                              {communityProjectTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                const tabActive = pathname?.startsWith(tab.href);
                                return (
                                  <Link key={tab.href} href={tab.href} className={`nav-item nav-item-nested ${tabActive ? 'active' : ''}`} style={{ paddingLeft: 44 }}>
                                    <TabIcon className="nav-icon" size={13} />
                                    <span className="nav-text">{tab.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {/* DEV */}
                        <div className="nav-group">
                          <button
                            className={`nav-group-toggle ${pathname?.includes('/community/dev') ? 'has-active' : ''}`}
                            onClick={() => setCommunityDevOpen(p => !p)}
                            style={{ paddingLeft: 28 }}
                          >
                            {communityDevOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span>DEV</span>
                          </button>
                          {communityDevOpen && (
                            <div className="nav-group-items">
                              {communityDevTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                const tabActive = pathname?.startsWith(tab.href);
                                return (
                                  <Link key={tab.href} href={tab.href} className={`nav-item nav-item-nested ${tabActive ? 'active' : ''}`} style={{ paddingLeft: 44 }}>
                                    <TabIcon className="nav-icon" size={13} />
                                    <span className="nav-text">{tab.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {moduleGroups.map((group) => {
                    const grpKey = `mod:${group.label}`;
                    const grpOpen = openGroups[grpKey] || false;
                    const hasActive = group.items.some(item => pathname?.startsWith(item.href));
                    return (
                      <div key={grpKey} className="nav-group">
                        <button
                          className={`nav-group-toggle ${hasActive ? 'has-active' : ''}`}
                          onClick={() => toggleGroup(grpKey)}
                        >
                          {grpOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span>{group.label}</span>
                        </button>
                        {grpOpen && (
                          <div className="nav-group-items">
                            <Link
                              href={group.docsHref}
                              className={`nav-item nav-item-nested nav-item-docs ${pathname === group.docsHref ? 'active' : ''}`}
                            >
                              <span className="nav-text">View Docs</span>
                            </Link>
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              const itemActive = pathname?.startsWith(item.href);

                              if ('hasLayerDropdown' in item && item.hasLayerDropdown) {
                                return (
                                  <div key={item.href} className="nav-layer-manager">
                                    <button
                                      className={`nav-item nav-item-nested nav-layer-toggle ${itemActive ? 'active' : ''}`}
                                      onClick={() => setLayersOpen(!layersOpen)}
                                    >
                                      {layersOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                      <span className="nav-text">{item.label}</span>
                                    </button>
                                    {layersOpen && (
                                      <div className="nav-layer-categories">
                                        {baseLayerCategories.map((cat) => {
                                          const catOpen = openCategories[cat.slug] || false;
                                          const catPrefix = `/admin/dashboard/modules/base-map/layers/${cat.slug}`;
                                          const catActive = pathname?.startsWith(catPrefix);
                                          return (
                                            <div key={cat.slug} className="nav-layer-category">
                                              <button
                                                className={`nav-category-toggle ${catActive ? 'has-active' : ''}`}
                                                onClick={() => setOpenCategories(prev => ({ ...prev, [cat.slug]: !prev[cat.slug] }))}
                                              >
                                                {catOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                                <span>{cat.label}</span>
                                              </button>
                                              {catOpen && (
                                                <div className="nav-layer-items">
                                                  {cat.layers.map((layer) => {
                                                    const layerHref = `${catPrefix}/${layer.slug}`;
                                                    const layerActive = pathname === layerHref;
                                                    return (
                                                      <Link
                                                        key={layer.slug}
                                                        href={layerHref}
                                                        className={`nav-item nav-item-layer ${layerActive ? 'active' : ''}`}
                                                      >
                                                        <span className="nav-text">{layer.label}</span>
                                                      </Link>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              const hrefKey = item.href.split('/').pop() || '';
                              const submodule = baseMapSubmodules.find(s => s.key === hrefKey);

                              if (submodule) {
                                const subOpen = openSubmodules[submodule.key] || false;
                                return (
                                  <div key={item.href} className="nav-submodule">
                                    <button
                                      className={`nav-item nav-item-nested nav-submodule-toggle ${itemActive ? 'active' : ''}`}
                                      onClick={() => setOpenSubmodules(prev => ({ ...prev, [submodule.key]: !prev[submodule.key] }))}
                                    >
                                      {subOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                      <span className="nav-text">{item.label}</span>
                                    </button>
                                    {subOpen && (
                                      <div className="nav-submodule-tabs">
                                        {submodule.tabs.map((tab) => {
                                          const tabHref = `${item.href}/${tab.slug}`;
                                          const tabActive = pathname === tabHref;
                                          return (
                                            <Link
                                              key={tab.slug}
                                              href={tabHref}
                                              className={`nav-item nav-item-tab ${tabActive ? 'active' : ''}`}
                                            >
                                              <span className="nav-text">{tab.label}</span>
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`nav-item nav-item-nested ${itemActive ? 'active' : ''}`}
                                >
                                  <ItemIcon className="nav-icon" size={15} />
                                  <span className="nav-text">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="nav-divider" />

          {/* Top-level pages */}
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <Icon className="nav-icon" size={18} />
                <span className="nav-text">{item.label}</span>
              </Link>
            );
          })}

          <div className="nav-divider" />

          {/* Integrations toggle */}
          <button
            className={`nav-section-toggle ${integrationsOpen ? 'open' : ''}`}
            onClick={() => setIntegrationsOpen(!integrationsOpen)}
          >
            {integrationsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Integrations</span>
          </button>

          {integrationsOpen && (
            <div className="module-manager-content">
              {integrations.map((integ) => {
                const Icon = integ.icon;
                const active = pathname?.startsWith(integ.href);
                if (integ.status === 'coming-soon') {
                  return (
                    <span key={integ.key} className="nav-item nav-item-nested nav-item-disabled">
                      <Icon className="nav-icon" size={15} />
                      <span className="nav-text">{integ.label}</span>
                    </span>
                  );
                }
                return (
                  <Link
                    key={integ.key}
                    href={integ.href}
                    className={`nav-item nav-item-nested ${active ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" size={15} />
                    <span className="nav-text">{integ.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-container">
            <div className="user-profile" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
              <div className="user-avatar">
                {employee?.name ? getInitials(employee.name) : '?'}
              </div>
              <div className="user-info">
                <span className="user-name">{employee?.name || 'Admin'}</span>
                <ChevronDown className={`user-dropdown-icon ${userDropdownOpen ? 'open' : ''}`} size={16} />
              </div>
            </div>
            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className={`beacon-main-content${pathname === '/admin/dashboard/live-map' || pathname?.startsWith('/admin/dashboard/modules/base-map/views') || pathname?.startsWith('/admin/dashboard/viz/hazards/volcanoes') ? ' no-padding' : ''}`}>
        {children}
      </main>
    </div>
  );
}
