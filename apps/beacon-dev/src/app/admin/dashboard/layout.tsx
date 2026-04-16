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
import { VolcanoNav } from './viz/hazards/volcanoes/nav/volcano-nav';
import { VOLCANOES_HREF } from './viz/hazards/volcanoes/nav/volcano-nav-tree';
import './dashboard.css';

// Module Manager groups — Base Map / Hazards
const vizGroups = [
  {
    label: 'A. Base Map',
    docsHref: '/admin/dashboard/modules/base-map/docs',
    items: [
      { label: '1. 2D', href: '/admin/dashboard/modules/base-map/views/flat', icon: Map },
      { label: '2. 2D Satellite', href: '/admin/dashboard/modules/base-map/views/satellite', icon: Map },
      { label: '3. 3D Clay', href: '/admin/dashboard/modules/base-map/views/clay', icon: Layers },
      { label: '4. 3D Google Tiles', href: '/admin/dashboard/modules/base-map/views/google-3d', icon: Layers },
    ],
  },
  {
    label: 'B. Hazards',
    docsHref: '/admin/dashboard/modules/hazards/docs',
    items: [
      { label: '1. Volcanoes', href: '/admin/dashboard/viz/hazards/volcanoes', icon: Flame },
    ],
  },
];

// Module Manager groups (remaining modules)
const moduleGroups = [
  {
    label: 'B. Base Map',
    docsHref: '/admin/dashboard/modules/base-map/docs',
    items: [
      { label: '1. Periodic Regional Layers', href: '/admin/dashboard/modules/base-map/layers', icon: Map, hasLayerDropdown: true },
      { label: '2. Event-Triggered Updates', href: '/admin/dashboard/modules/base-map/event-updates', icon: RefreshCw },
      { label: '3. User Map Adjustments', href: '/admin/dashboard/modules/base-map/user-adjustments', icon: PenTool },
      { label: '4. User-Created Layers', href: '/admin/dashboard/modules/base-map/user-layers', icon: Layers },
      { label: '5. Sensor-Driven Attributes', href: '/admin/dashboard/modules/base-map/sensor-attributes', icon: Radar },
    ],
  },
  {
    label: 'C. Condition Monitoring',
    docsHref: '/admin/dashboard/modules/condition-monitoring/docs',
    items: [
      { label: '1. Official Situation Data', href: '/admin/dashboard/modules/condition-monitoring/situation-data', icon: Radio },
    ],
  },
  {
    label: 'D. Risk Monitoring',
    docsHref: '/admin/dashboard/modules/risk-monitoring/docs',
    items: [
      { label: '1. Official Conditions', href: '/admin/dashboard/modules/risk-monitoring/conditions', icon: AlertTriangle },
    ],
  },
  {
    label: 'E. Event Triggers',
    docsHref: '/admin/dashboard/modules/event-triggers/docs',
    items: [
      { label: '1. Sensor-Based Detection', href: '/admin/dashboard/modules/event-triggers/sensor-detection', icon: Zap },
      { label: '2. Device-Driven Triggers', href: '/admin/dashboard/modules/event-triggers/device-triggers', icon: Radar },
      { label: '3. User Sighting Triggers', href: '/admin/dashboard/modules/event-triggers/sighting-triggers', icon: Eye },
      { label: '4. EMS Declaration', href: '/admin/dashboard/modules/event-triggers/ems-declaration', icon: Siren },
      { label: '5. Official Source Events', href: '/admin/dashboard/modules/event-triggers/official-events', icon: Radio },
    ],
  },
  {
    label: 'F. Hazard Onset Response',
    docsHref: '/admin/dashboard/modules/hazard-onset/docs',
    items: [
      { label: '1. Onset Response Manager', href: '/admin/dashboard/modules/hazard-onset/response-manager', icon: Siren },
      { label: '2. Data & Polling Protocols', href: '/admin/dashboard/modules/hazard-onset/data-protocols', icon: Clock },
      { label: '3. User Status & Requests', href: '/admin/dashboard/modules/hazard-onset/user-status', icon: Users },
      { label: '4. Cache & Guidance Protocols', href: '/admin/dashboard/modules/hazard-onset/cache-guidance', icon: Navigation },
    ],
  },
  {
    label: 'G. Event Management',
    docsHref: '/admin/dashboard/modules/event-management/docs',
    items: [
      { label: '1. Event Manager', href: '/admin/dashboard/modules/event-management/event-manager', icon: CalendarClock },
      { label: '2. User Sighting Reports', href: '/admin/dashboard/modules/event-management/sighting-reports', icon: Eye },
      { label: '3. Hazard Models', href: '/admin/dashboard/modules/event-management/hazard-models', icon: Brain },
      { label: '4. User Danger', href: '/admin/dashboard/modules/event-management/user-danger', icon: TriangleAlert },
      { label: '5. User Location', href: '/admin/dashboard/modules/event-management/user-location', icon: MapPin },
    ],
  },
  {
    label: 'H. Navigation & Terrain',
    docsHref: '/admin/dashboard/modules/navigation/docs',
    items: [
      { label: '1. Passable Terrain', href: '/admin/dashboard/modules/navigation/passable-terrain', icon: Route },
      { label: '2. Evacuation Manager', href: '/admin/dashboard/modules/navigation/evacuation', icon: Navigation },
    ],
  },
  {
    label: 'I. Event Operations',
    docsHref: '/admin/dashboard/modules/operations/docs',
    items: [
      { label: '1. Teams Manager', href: '/admin/dashboard/modules/operations/teams', icon: UsersRound },
      { label: '2. Resource & Dispatch', href: '/admin/dashboard/modules/operations/resource-dispatch', icon: Crosshair },
    ],
  },
  {
    label: 'J. People & Community',
    docsHref: '/admin/dashboard/modules/people/docs',
    items: [
      { label: '1. Public User Accounts', href: '/admin/dashboard/modules/people/accounts', icon: Users },
      { label: '2. Groups Manager', href: '/admin/dashboard/modules/people/groups', icon: FolderKanban },
      { label: '3. People Helping People', href: '/admin/dashboard/modules/people/helping', icon: Heart },
      { label: '4. Animal Rescue', href: '/admin/dashboard/modules/people/animal-rescue', icon: PawPrint },
    ],
  },
  {
    label: 'K. Communications & Alerts',
    docsHref: '/admin/dashboard/modules/comms/docs',
    items: [
      { label: '1. Notifications & Alerts', href: '/admin/dashboard/modules/comms/notifications', icon: Bell },
      { label: '2. Mesh Network', href: '/admin/dashboard/modules/comms/mesh-network', icon: Wifi },
    ],
  },
  {
    label: 'L. Post-Operations',
    docsHref: '/admin/dashboard/modules/post-ops/docs',
    items: [
      { label: '1. Post-Event Manager', href: '/admin/dashboard/modules/post-ops/post-event', icon: FileSearch },
    ],
  },
];

// Top-level pages that aren't part of the module manager
const topNavItems = [
  { label: '2. Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { label: '3. Clients', href: '/admin/dashboard/clients', icon: UserCog },
  { label: '4. Employees', href: '/admin/dashboard/employees', icon: Users },
  { label: '5. Partnerships', href: '/admin/dashboard/partnerships', icon: Handshake },
];

// Product Manager - top-level section, one subtab per public app page
const productPages = [
  { label: '1. Live Test Account', href: '/admin/dashboard/live-map', icon: Globe },
];

// Community > Project Manager (feature planning, CONFolders, specs)
const communityProjectTabs = [
  { label: '1. Feature Overview', href: '/admin/dashboard/product/community/project/overview', icon: FolderKanban },
  { label: '2. CONFolders', href: '/admin/dashboard/product/community/project/confolders', icon: FileSearch },
  { label: '3. Notification Manager', href: '/admin/dashboard/product/community/notifications', icon: Bell },
];

// Community > DEV (module hierarchy, build, test)
const communityDevTabs = [
  { label: '1. Module Hierarchy', href: '/admin/dashboard/product/community/dev/modules', icon: Network },
  { label: '2. Standalone UI', href: '/admin/dashboard/product/community/dev/ui', icon: Smartphone },
  { label: '3. Dev Monitor', href: '/admin/dashboard/product/community/dev-monitor', icon: Activity },
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
            <span>1. Product Manager</span>
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

              {/* Module Manager (formerly Visualization Manager) */}
              <button
                className={`nav-section-toggle ${vizManagerOpen ? 'open' : ''}`}
                onClick={() => setVizManagerOpen(!vizManagerOpen)}
              >
                {vizManagerOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>1a. Module Manager</span>
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

                              // Volcanoes item gets its own nested subtree component.
                              if (item.href === VOLCANOES_HREF) {
                                return <VolcanoNav key={item.href} pathname={pathname} />;
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

              {/* Module Manager Old */}
              <button
                className={`nav-section-toggle ${moduleManagerOpen ? 'open' : ''}`}
                onClick={() => setModuleManagerOpen(!moduleManagerOpen)}
              >
                {moduleManagerOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>1b. Module Manager Old</span>
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
                      <span>A. Community</span>
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
                            <span>A-i. Project Manager</span>
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
                            <span>A-ii. DEV</span>
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
            <span>6. Integrations</span>
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
