'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, X, Layers, Map, Flame, Route, Network, Settings, GripVertical, ChevronRight, ChevronDown, Cloud, CloudOff, Loader2 } from 'lucide-react';

// Types
interface ComponentInput {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface ComponentTrigger {
  id: string;
  name: string;
  type: 'user-action' | 'system-event' | 'api-call' | 'scheduled' | 'data-change';
  description: string;
}

interface ComponentOutput {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface DatabaseEffect {
  id: string;
  table: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  description: string;
}

interface Subcomponent {
  id: string;
  name: string;
  status: 'planned' | 'in-progress' | 'testing' | 'complete';
  inputs: ComponentInput[];
  triggers: ComponentTrigger[];
  outputs: ComponentOutput[];
  databaseEffects: DatabaseEffect[];
  subcomponents: Subcomponent[];
}

interface SystemComponent {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'testing' | 'complete';
  priority: 'critical' | 'high' | 'medium' | 'low';
  inputs: ComponentInput[];
  triggers: ComponentTrigger[];
  outputs: ComponentOutput[];
  databaseEffects: DatabaseEffect[];
  subcomponents: Subcomponent[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// System modules for tabs
const systemModules = [
  { id: 'atlas', name: 'Atlas - Map Manager', icon: Map },
  { id: 'jupiter', name: 'Jupiter - Hazard Modeling', icon: Flame },
  { id: 'exodus', name: 'Exodus - Routing', icon: Route },
  { id: 'beaconmesh', name: 'BeaconMesh - Network', icon: Network },
  { id: 'core', name: 'Core Platform', icon: Settings },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  'planned': { bg: '#f3f4f6', text: '#6b7280' },
  'in-progress': { bg: '#dbeafe', text: '#2563eb' },
  'testing': { bg: '#fef3c7', text: '#d97706' },
  'complete': { bg: '#dcfce7', text: '#16a34a' },
};

const triggerTypeLabels: Record<string, string> = {
  'user-action': 'User Action',
  'system-event': 'System Event',
  'api-call': 'API Call',
  'scheduled': 'Scheduled',
  'data-change': 'Data Change',
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Local storage key (used as cache/fallback)
const STORAGE_KEY = 'beacon-dev-components';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('atlas');
  const [components, setComponents] = useState<Record<string, SystemComponent[]>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'offline'>('saved');
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSavesRef = useRef<Set<string>>(new Set());

  // Load from API on mount
  useEffect(() => {
    const loadComponents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/components');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Initialize with empty arrays for all modules, then overlay API data
            const initial: Record<string, SystemComponent[]> = {};
            systemModules.forEach(m => { initial[m.id] = []; });
            setComponents({ ...initial, ...result.data });
            // Cache to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initial, ...result.data }));
          }
        } else {
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setComponents(JSON.parse(saved));
          } else {
            const initial: Record<string, SystemComponent[]> = {};
            systemModules.forEach(m => { initial[m.id] = []; });
            setComponents(initial);
          }
          setSaveStatus('offline');
        }
      } catch (error) {
        console.error('Error loading components:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setComponents(JSON.parse(saved));
        } else {
          const initial: Record<string, SystemComponent[]> = {};
          systemModules.forEach(m => { initial[m.id] = []; });
          setComponents(initial);
        }
        setSaveStatus('offline');
      }
      setIsLoading(false);
    };

    loadComponents();
  }, []);

  // Debounced save to API
  const saveModuleToAPI = useCallback(async (module: string, moduleComponents: SystemComponent[]) => {
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/admin/components', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, components: moduleComponents }),
      });

      if (response.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving components:', error);
      setSaveStatus('error');
    }
    pendingSavesRef.current.delete(module);
  }, []);

  // Save to localStorage immediately and debounce API save
  useEffect(() => {
    if (Object.keys(components).length > 0 && !isLoading) {
      // Always save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(components));

      // Mark current tab as needing save
      pendingSavesRef.current.add(activeTab);

      // Debounce API save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('saving');
      saveTimeoutRef.current = setTimeout(() => {
        // Save all pending modules
        pendingSavesRef.current.forEach((module) => {
          if (components[module]) {
            saveModuleToAPI(module, components[module]);
          }
        });
      }, 1000); // 1 second debounce
    }
  }, [components, activeTab, isLoading, saveModuleToAPI]);

  const currentComponents = components[activeTab] || [];

  // Toggle component expansion
  const toggleExpanded = (componentId: string) => {
    setExpandedComponents(prev => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  // Add new component
  const addComponent = () => {
    const newComponent: SystemComponent = {
      id: generateId(),
      name: '',
      description: '',
      status: 'planned',
      priority: 'medium',
      inputs: [],
      triggers: [],
      outputs: [],
      databaseEffects: [],
      subcomponents: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComponents(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newComponent],
    }));
  };

  // Update component
  const updateComponent = (id: string, updates: Partial<SystemComponent>) => {
    setComponents(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  };

  // Delete component
  const deleteComponent = (id: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      setComponents(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).filter(c => c.id !== id),
      }));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      setComponents(prev => {
        const items = [...(prev[activeTab] || [])];
        const [draggedItem] = items.splice(draggedIndex, 1);
        items.splice(dragOverIndex, 0, draggedItem);
        return { ...prev, [activeTab]: items };
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Add input to component
  const addInput = (componentId: string) => {
    const newInput: ComponentInput = {
      id: generateId(),
      name: '',
      type: '',
      description: '',
      required: false,
    };
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, { inputs: [...component.inputs, newInput] });
    }
  };

  // Update input
  const updateInput = (componentId: string, inputId: string, updates: Partial<ComponentInput>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        inputs: component.inputs.map(i => i.id === inputId ? { ...i, ...updates } : i),
      });
    }
  };

  // Delete input
  const deleteInput = (componentId: string, inputId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        inputs: component.inputs.filter(i => i.id !== inputId),
      });
    }
  };

  // Add trigger to component
  const addTrigger = (componentId: string) => {
    const newTrigger: ComponentTrigger = {
      id: generateId(),
      name: '',
      type: 'user-action',
      description: '',
    };
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, { triggers: [...component.triggers, newTrigger] });
    }
  };

  // Update trigger
  const updateTrigger = (componentId: string, triggerId: string, updates: Partial<ComponentTrigger>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        triggers: component.triggers.map(t => t.id === triggerId ? { ...t, ...updates } : t),
      });
    }
  };

  // Delete trigger
  const deleteTrigger = (componentId: string, triggerId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        triggers: component.triggers.filter(t => t.id !== triggerId),
      });
    }
  };

  // Add output to component
  const addOutput = (componentId: string) => {
    const newOutput: ComponentOutput = {
      id: generateId(),
      name: '',
      type: '',
      description: '',
    };
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, { outputs: [...component.outputs, newOutput] });
    }
  };

  // Update output
  const updateOutput = (componentId: string, outputId: string, updates: Partial<ComponentOutput>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        outputs: component.outputs.map(o => o.id === outputId ? { ...o, ...updates } : o),
      });
    }
  };

  // Delete output
  const deleteOutput = (componentId: string, outputId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        outputs: component.outputs.filter(o => o.id !== outputId),
      });
    }
  };

  // Add database effect to component
  const addDatabaseEffect = (componentId: string) => {
    const newEffect: DatabaseEffect = {
      id: generateId(),
      table: '',
      operation: 'read',
      description: '',
    };
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, { databaseEffects: [...component.databaseEffects, newEffect] });
    }
  };

  // Update database effect
  const updateDatabaseEffect = (componentId: string, effectId: string, updates: Partial<DatabaseEffect>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        databaseEffects: component.databaseEffects.map(e => e.id === effectId ? { ...e, ...updates } : e),
      });
    }
  };

  // Delete database effect
  const deleteDatabaseEffect = (componentId: string, effectId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        databaseEffects: component.databaseEffects.filter(e => e.id !== effectId),
      });
    }
  };

  // Add subcomponent to component
  const addSubcomponent = (componentId: string) => {
    const newSubcomponent: Subcomponent = {
      id: generateId(),
      name: '',
      status: 'planned',
      inputs: [],
      triggers: [],
      outputs: [],
      databaseEffects: [],
      subcomponents: [],
    };
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        subcomponents: [...(component.subcomponents || []), newSubcomponent]
      });
      // Auto-expand when adding a subcomponent
      setExpandedComponents(prev => new Set(prev).add(componentId));
    }
  };

  // Update subcomponent
  const updateSubcomponent = (componentId: string, subcomponentId: string, updates: Partial<Subcomponent>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        subcomponents: (component.subcomponents || []).map(s =>
          s.id === subcomponentId ? { ...s, ...updates } : s
        ),
      });
    }
  };

  // Delete subcomponent
  const deleteSubcomponent = (componentId: string, subcomponentId: string) => {
    if (confirm('Are you sure you want to delete this subcomponent?')) {
      const component = currentComponents.find(c => c.id === componentId);
      if (component) {
        updateComponent(componentId, {
          subcomponents: (component.subcomponents || []).filter(s => s.id !== subcomponentId),
        });
      }
    }
  };

  // Subcomponent field handlers
  const addSubInput = (componentId: string, subcomponentId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        inputs: [...subcomponent.inputs, { id: generateId(), name: '', type: '', description: '', required: false }],
      });
    }
  };

  const updateSubInput = (componentId: string, subcomponentId: string, inputId: string, updates: Partial<ComponentInput>) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        inputs: subcomponent.inputs.map(i => i.id === inputId ? { ...i, ...updates } : i),
      });
    }
  };

  const deleteSubInput = (componentId: string, subcomponentId: string, inputId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        inputs: subcomponent.inputs.filter(i => i.id !== inputId),
      });
    }
  };

  const addSubTrigger = (componentId: string, subcomponentId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        triggers: [...subcomponent.triggers, { id: generateId(), name: '', type: 'user-action', description: '' }],
      });
    }
  };

  const updateSubTrigger = (componentId: string, subcomponentId: string, triggerId: string, updates: Partial<ComponentTrigger>) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        triggers: subcomponent.triggers.map(t => t.id === triggerId ? { ...t, ...updates } : t),
      });
    }
  };

  const deleteSubTrigger = (componentId: string, subcomponentId: string, triggerId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        triggers: subcomponent.triggers.filter(t => t.id !== triggerId),
      });
    }
  };

  const addSubOutput = (componentId: string, subcomponentId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        outputs: [...subcomponent.outputs, { id: generateId(), name: '', type: '', description: '' }],
      });
    }
  };

  const updateSubOutput = (componentId: string, subcomponentId: string, outputId: string, updates: Partial<ComponentOutput>) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        outputs: subcomponent.outputs.map(o => o.id === outputId ? { ...o, ...updates } : o),
      });
    }
  };

  const deleteSubOutput = (componentId: string, subcomponentId: string, outputId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        outputs: subcomponent.outputs.filter(o => o.id !== outputId),
      });
    }
  };

  const addSubDbEffect = (componentId: string, subcomponentId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        databaseEffects: [...subcomponent.databaseEffects, { id: generateId(), table: '', operation: 'read', description: '' }],
      });
    }
  };

  const updateSubDbEffect = (componentId: string, subcomponentId: string, effectId: string, updates: Partial<DatabaseEffect>) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        databaseEffects: subcomponent.databaseEffects.map(e => e.id === effectId ? { ...e, ...updates } : e),
      });
    }
  };

  const deleteSubDbEffect = (componentId: string, subcomponentId: string, effectId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    const subcomponent = component?.subcomponents?.find(s => s.id === subcomponentId);
    if (subcomponent) {
      updateSubcomponent(componentId, subcomponentId, {
        databaseEffects: subcomponent.databaseEffects.filter(e => e.id !== effectId),
      });
    }
  };

  // Helper to recursively find and update a subcomponent by path
  const findSubcomponentByPath = (subcomponents: Subcomponent[], path: string[]): Subcomponent | null => {
    if (path.length === 0) return null;
    const [currentId, ...rest] = path;
    const found = subcomponents.find(s => s.id === currentId);
    if (!found) return null;
    if (rest.length === 0) return found;
    return findSubcomponentByPath(found.subcomponents || [], rest);
  };

  // Helper to recursively update subcomponents
  const updateSubcomponentsRecursive = (
    subcomponents: Subcomponent[],
    path: string[],
    updater: (sub: Subcomponent) => Subcomponent
  ): Subcomponent[] => {
    if (path.length === 0) return subcomponents;
    const [currentId, ...rest] = path;
    return subcomponents.map(sub => {
      if (sub.id !== currentId) return sub;
      if (rest.length === 0) {
        return updater(sub);
      }
      return {
        ...sub,
        subcomponents: updateSubcomponentsRecursive(sub.subcomponents || [], rest, updater),
      };
    });
  };

  // Add nested subcomponent (path is array of subcomponent IDs leading to parent)
  const addNestedSubcomponent = (componentId: string, path: string[]) => {
    const newSub: Subcomponent = {
      id: generateId(),
      name: '',
      status: 'planned',
      inputs: [],
      triggers: [],
      outputs: [],
      databaseEffects: [],
      subcomponents: [],
    };

    setComponents(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(c => {
        if (c.id !== componentId) return c;
        return {
          ...c,
          subcomponents: updateSubcomponentsRecursive(c.subcomponents || [], path, (sub) => ({
            ...sub,
            subcomponents: [...(sub.subcomponents || []), newSub],
          })),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    // Auto-expand all items in path
    setExpandedComponents(prev => {
      const next = new Set(prev);
      next.add(componentId);
      path.forEach(id => next.add(id));
      return next;
    });
  };

  // Update nested subcomponent
  const updateNestedSubcomponent = (componentId: string, path: string[], updates: Partial<Subcomponent>) => {
    setComponents(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(c => {
        if (c.id !== componentId) return c;
        return {
          ...c,
          subcomponents: updateSubcomponentsRecursive(c.subcomponents || [], path, (sub) => ({
            ...sub,
            ...updates,
          })),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  // Delete nested subcomponent
  const deleteNestedSubcomponent = (componentId: string, path: string[]) => {
    if (!confirm('Are you sure you want to delete this subcomponent?')) return;

    const parentPath = path.slice(0, -1);
    const targetId = path[path.length - 1];

    setComponents(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(c => {
        if (c.id !== componentId) return c;
        if (parentPath.length === 0) {
          // Direct child of component
          return {
            ...c,
            subcomponents: (c.subcomponents || []).filter(s => s.id !== targetId),
            updatedAt: new Date().toISOString(),
          };
        }
        return {
          ...c,
          subcomponents: updateSubcomponentsRecursive(c.subcomponents || [], parentPath, (sub) => ({
            ...sub,
            subcomponents: (sub.subcomponents || []).filter(s => s.id !== targetId),
          })),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  // Nested subcomponent field handlers
  const addNestedInput = (componentId: string, path: string[]) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        inputs: [...sub.inputs, { id: generateId(), name: '', type: '', description: '', required: false }],
      });
    }
  };

  const updateNestedInput = (componentId: string, path: string[], inputId: string, updates: Partial<ComponentInput>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        inputs: sub.inputs.map(i => i.id === inputId ? { ...i, ...updates } : i),
      });
    }
  };

  const deleteNestedInput = (componentId: string, path: string[], inputId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        inputs: sub.inputs.filter(i => i.id !== inputId),
      });
    }
  };

  const addNestedTrigger = (componentId: string, path: string[]) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        triggers: [...sub.triggers, { id: generateId(), name: '', type: 'user-action', description: '' }],
      });
    }
  };

  const updateNestedTrigger = (componentId: string, path: string[], triggerId: string, updates: Partial<ComponentTrigger>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        triggers: sub.triggers.map(t => t.id === triggerId ? { ...t, ...updates } : t),
      });
    }
  };

  const deleteNestedTrigger = (componentId: string, path: string[], triggerId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        triggers: sub.triggers.filter(t => t.id !== triggerId),
      });
    }
  };

  const addNestedOutput = (componentId: string, path: string[]) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        outputs: [...sub.outputs, { id: generateId(), name: '', type: '', description: '' }],
      });
    }
  };

  const updateNestedOutput = (componentId: string, path: string[], outputId: string, updates: Partial<ComponentOutput>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        outputs: sub.outputs.map(o => o.id === outputId ? { ...o, ...updates } : o),
      });
    }
  };

  const deleteNestedOutput = (componentId: string, path: string[], outputId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        outputs: sub.outputs.filter(o => o.id !== outputId),
      });
    }
  };

  const addNestedDbEffect = (componentId: string, path: string[]) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        databaseEffects: [...sub.databaseEffects, { id: generateId(), table: '', operation: 'read', description: '' }],
      });
    }
  };

  const updateNestedDbEffect = (componentId: string, path: string[], effectId: string, updates: Partial<DatabaseEffect>) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        databaseEffects: sub.databaseEffects.map(e => e.id === effectId ? { ...e, ...updates } : e),
      });
    }
  };

  const deleteNestedDbEffect = (componentId: string, path: string[], effectId: string) => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return;
    const sub = findSubcomponentByPath(component.subcomponents || [], path);
    if (sub) {
      updateNestedSubcomponent(componentId, path, {
        databaseEffects: sub.databaseEffects.filter(e => e.id !== effectId),
      });
    }
  };

  // Render cell content for list items (inputs, triggers, outputs, db effects)
  const renderCellList = (
    componentId: string,
    items: Array<{ id: string; name?: string; table?: string; type?: string; operation?: string }>,
    onAdd: () => void,
    onUpdate: (itemId: string, value: string) => void,
    onDelete: (itemId: string) => void,
    placeholder: string
  ) => (
    <div className="cell-list">
      {items.map((item) => (
        <div key={item.id} className="cell-item">
          <input
            type="text"
            value={item.name || item.table || ''}
            onChange={(e) => onUpdate(item.id, e.target.value)}
            placeholder={placeholder}
          />
          <button className="cell-delete" onClick={() => onDelete(item.id)}>
            <X size={10} />
          </button>
        </div>
      ))}
      <button className="cell-add" onClick={onAdd}>
        <Plus size={12} />
      </button>
    </div>
  );

  // Recursive function to render subcomponents at any depth
  const renderSubcomponents = (
    componentId: string,
    subcomponents: Subcomponent[],
    parentNumbering: number[],
    depth: number
  ): React.ReactNode => {
    return subcomponents.map((sub, subIndex) => {
      const currentNumbering = [...parentNumbering, subIndex + 1];
      const numberString = currentNumbering.join('.');
      const path = getPathToSubcomponent(componentId, sub.id, depth);
      const isExpanded = expandedComponents.has(sub.id);
      const hasChildren = (sub.subcomponents || []).length > 0;
      const indentPadding = depth * 16;

      return (
        <React.Fragment key={sub.id}>
          <tr className={`subcomponent-row depth-${depth}`}>
            <td className="col-order">
              <div className="sub-order-cell">
                <button
                  className={`expand-btn sub-expand ${hasChildren ? 'has-children' : ''}`}
                  onClick={() => toggleExpanded(sub.id)}
                  style={{ marginLeft: indentPadding }}
                >
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                <span className="sub-order-number">{numberString}</span>
              </div>
            </td>
            <td className="col-name">
              <div className="sub-name-cell" style={{ paddingLeft: indentPadding }}>
                <span className="sub-indent">└</span>
                <input
                  type="text"
                  className="name-input sub-name"
                  value={sub.name}
                  onChange={(e) => updateNestedSubcomponent(componentId, path, { name: e.target.value })}
                  placeholder="Subcomponent name..."
                />
              </div>
            </td>
            <td className="col-inputs">
              {renderCellList(
                sub.id,
                sub.inputs,
                () => addNestedInput(componentId, path),
                (itemId, value) => updateNestedInput(componentId, path, itemId, { name: value }),
                (itemId) => deleteNestedInput(componentId, path, itemId),
                'Input'
              )}
            </td>
            <td className="col-triggers">
              {renderCellList(
                sub.id,
                sub.triggers,
                () => addNestedTrigger(componentId, path),
                (itemId, value) => updateNestedTrigger(componentId, path, itemId, { name: value }),
                (itemId) => deleteNestedTrigger(componentId, path, itemId),
                'Trigger'
              )}
            </td>
            <td className="col-outputs">
              {renderCellList(
                sub.id,
                sub.outputs,
                () => addNestedOutput(componentId, path),
                (itemId, value) => updateNestedOutput(componentId, path, itemId, { name: value }),
                (itemId) => deleteNestedOutput(componentId, path, itemId),
                'Output'
              )}
            </td>
            <td className="col-db">
              {renderCellList(
                sub.id,
                sub.databaseEffects,
                () => addNestedDbEffect(componentId, path),
                (itemId, value) => updateNestedDbEffect(componentId, path, itemId, { table: value }),
                (itemId) => deleteNestedDbEffect(componentId, path, itemId),
                'Table'
              )}
            </td>
            <td className="col-status">
              <select
                className="status-select"
                value={sub.status}
                onChange={(e) => updateNestedSubcomponent(componentId, path, { status: e.target.value as Subcomponent['status'] })}
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="complete">Complete</option>
              </select>
            </td>
            <td className="col-actions">
              <div className="action-buttons">
                <button className="add-sub-btn" onClick={() => addNestedSubcomponent(componentId, path)} title="Add nested subcomponent">
                  <Plus size={14} />
                </button>
                <button className="delete-btn" onClick={() => deleteNestedSubcomponent(componentId, path)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
          {/* Recursively render nested subcomponents */}
          {isExpanded && renderSubcomponents(componentId, sub.subcomponents || [], currentNumbering, depth + 1)}
        </React.Fragment>
      );
    });
  };

  // Helper to build path from component to a specific subcomponent
  const getPathToSubcomponent = (componentId: string, targetId: string, maxDepth: number): string[] => {
    const component = currentComponents.find(c => c.id === componentId);
    if (!component) return [];

    const findPath = (subs: Subcomponent[], path: string[]): string[] | null => {
      for (const sub of subs) {
        if (sub.id === targetId) {
          return [...path, sub.id];
        }
        if (sub.subcomponents && sub.subcomponents.length > 0) {
          const found = findPath(sub.subcomponents, [...path, sub.id]);
          if (found) return found;
        }
      }
      return null;
    };

    return findPath(component.subcomponents || [], []) || [];
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="save-status saving">
            <Loader2 size={14} className="spin" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="save-status saved">
            <Cloud size={14} />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="save-status error">
            <CloudOff size={14} />
            <span>Save failed</span>
          </div>
        );
      case 'offline':
        return (
          <div className="save-status offline">
            <CloudOff size={14} />
            <span>Offline mode</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="dev-manager-page">
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-manager-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <Layers className="page-icon" size={28} />
            <div>
              <h1>System Development Manager</h1>
              <p>Track and manage component development across all Beacon modules.</p>
            </div>
          </div>
          {renderSaveStatus()}
        </div>
      </div>

      {/* Module Tabs */}
      <div className="module-tabs">
        {systemModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <button
              key={module.id}
              className={`module-tab ${activeTab === module.id ? 'active' : ''}`}
              onClick={() => setActiveTab(module.id)}
            >
              <IconComponent className="tab-icon" size={18} />
              <span className="tab-name">{module.name}</span>
              <span className="tab-count">{(components[module.id] || []).length}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="content-header">
          <h2>{systemModules.find(m => m.id === activeTab)?.name} Components</h2>
          <button className="btn-primary" onClick={addComponent}>
            <Plus size={16} /> Add Component
          </button>
        </div>

        {currentComponents.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} color="#1f3348" />
            <h3>No components yet</h3>
            <p>Add your first component to start tracking development.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="components-table">
              <thead>
                <tr>
                  <th className="col-order">#</th>
                  <th className="col-name">Component Name</th>
                  <th className="col-inputs">Inputs</th>
                  <th className="col-triggers">Triggers</th>
                  <th className="col-outputs">Outputs</th>
                  <th className="col-db">DB Effects</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {currentComponents.map((component, index) => {
                  const isExpanded = expandedComponents.has(component.id);
                  const hasSubcomponents = (component.subcomponents || []).length > 0;

                  return (
                    <React.Fragment key={component.id}>
                      <tr
                        key={component.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`parent-row ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''} ${isExpanded ? 'expanded' : ''}`}
                      >
                        <td className="col-order">
                          <div className="order-cell">
                            <GripVertical size={14} className="drag-handle" />
                            <span className="order-number">{index + 1}</span>
                            <button
                              className={`expand-btn ${hasSubcomponents ? 'has-children' : ''}`}
                              onClick={() => toggleExpanded(component.id)}
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="col-name">
                          <input
                            type="text"
                            className="name-input"
                            value={component.name}
                            onChange={(e) => updateComponent(component.id, { name: e.target.value })}
                            placeholder="Component name..."
                          />
                        </td>
                        <td className="col-inputs">
                          {renderCellList(
                            component.id,
                            component.inputs,
                            () => addInput(component.id),
                            (itemId, value) => updateInput(component.id, itemId, { name: value }),
                            (itemId) => deleteInput(component.id, itemId),
                            'Input'
                          )}
                        </td>
                        <td className="col-triggers">
                          {renderCellList(
                            component.id,
                            component.triggers,
                            () => addTrigger(component.id),
                            (itemId, value) => updateTrigger(component.id, itemId, { name: value }),
                            (itemId) => deleteTrigger(component.id, itemId),
                            'Trigger'
                          )}
                        </td>
                        <td className="col-outputs">
                          {renderCellList(
                            component.id,
                            component.outputs,
                            () => addOutput(component.id),
                            (itemId, value) => updateOutput(component.id, itemId, { name: value }),
                            (itemId) => deleteOutput(component.id, itemId),
                            'Output'
                          )}
                        </td>
                        <td className="col-db">
                          {renderCellList(
                            component.id,
                            component.databaseEffects,
                            () => addDatabaseEffect(component.id),
                            (itemId, value) => updateDatabaseEffect(component.id, itemId, { table: value }),
                            (itemId) => deleteDatabaseEffect(component.id, itemId),
                            'Table'
                          )}
                        </td>
                        <td className="col-status">
                          <select
                            className="status-select"
                            value={component.status}
                            onChange={(e) => updateComponent(component.id, { status: e.target.value as SystemComponent['status'] })}
                          >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="testing">Testing</option>
                            <option value="complete">Complete</option>
                          </select>
                        </td>
                        <td className="col-actions">
                          <div className="action-buttons">
                            <button className="add-sub-btn" onClick={() => addSubcomponent(component.id)} title="Add subcomponent">
                              <Plus size={14} />
                            </button>
                            <button className="delete-btn" onClick={() => deleteComponent(component.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Subcomponent rows - recursive */}
                      {isExpanded && renderSubcomponents(component.id, component.subcomponents || [], [index + 1], 1)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .dev-manager-page {
          padding: 0;
          min-height: 100vh;
          background: #f9fafb;
        }

        .page-header {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          padding: 32px;
          margin: -24px -24px 0 -24px;
        }

        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .page-title-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .page-icon {
          color: #5ac8db;
          margin-top: 4px;
        }

        .page-header h1 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 14px;
        }

        .module-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
          margin: 0 -24px;
        }

        .module-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .module-tab:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .module-tab.active {
          background: #1f3348;
          color: white;
        }

        .tab-icon {
          color: #1f3348;
        }

        .module-tab.active .tab-icon {
          color: white;
        }

        .tab-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
        }

        .module-tab.active .tab-count {
          background: rgba(255, 255, 255, 0.2);
        }

        .content-area {
          padding: 24px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .content-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: #1f3348;
          color: white;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          background: white;
          color: #4b5563;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 2px dashed #e5e7eb;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 16px 0 8px;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        /* Main Components Table */
        .table-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .components-table {
          width: 100%;
          border-collapse: collapse;
        }

        .components-table th {
          text-align: left;
          padding: 14px 16px;
          font-weight: 600;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .components-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }

        .components-table tr:hover {
          background: #fafafa;
        }

        .col-order { width: 80px; }
        .col-name { width: 17%; }
        .col-inputs { width: 14%; }
        .col-triggers { width: 14%; }
        .col-outputs { width: 14%; }
        .col-db { width: 14%; }
        .col-status { width: 11%; }
        .col-actions { width: 6%; }

        .order-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .drag-handle {
          color: #d1d5db;
          cursor: grab;
          transition: color 0.2s;
        }

        .drag-handle:hover {
          color: #1f3348;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .order-number {
          font-size: 13px;
          font-weight: 600;
          color: #9ca3af;
        }

        /* Drag and Drop States */
        .components-table tr.dragging {
          opacity: 0.5;
          background: #e0f2fe;
        }

        .components-table tr.drag-over {
          border-top: 2px solid #1f3348;
        }

        .components-table tr[draggable="true"] {
          cursor: default;
        }

        /* Expand button */
        .expand-btn {
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          margin-left: 4px;
        }

        .expand-btn:hover {
          color: #1f3348;
          background: #f2f4f6;
        }

        .expand-btn.has-children {
          color: #1f3348;
        }

        /* Action buttons container */
        .action-buttons {
          display: flex;
          gap: 4px;
        }

        .add-sub-btn {
          width: 28px;
          height: 28px;
          border: 1px dashed #d1d5db;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }

        .add-sub-btn:hover {
          border-color: #1f3348;
          color: #1f3348;
          background: #f2f4f6;
        }

        /* Subcomponent rows */
        .subcomponent-row {
          background: #f9fafb;
        }

        .subcomponent-row:hover {
          background: #f3f4f6 !important;
        }

        .sub-order-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
        }

        .sub-order-number {
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
        }

        .sub-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sub-indent {
          color: #d1d5db;
          font-size: 14px;
          margin-left: 8px;
        }

        .sub-name {
          font-size: 13px;
        }

        /* Parent row when expanded */
        .parent-row.expanded {
          border-bottom: none;
        }

        .parent-row.expanded td {
          border-bottom: 1px dashed #e5e7eb;
        }

        .name-input {
          width: 100%;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
        }

        .name-input:hover {
          background: white;
          border-color: #e5e7eb;
        }

        .name-input:focus {
          background: white;
          border-color: #1f3348;
          outline: none;
        }

        .status-select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 13px;
          background: white;
          cursor: pointer;
        }

        .status-select:focus {
          border-color: #1f3348;
          outline: none;
        }

        .delete-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
        }

        .delete-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        /* Cell List Styles - moved to dashboard.css */

        /* Save Status */
        .save-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .save-status.saving {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        .save-status.saved {
          background: rgba(22, 163, 74, 0.2);
          color: #86efac;
        }

        .save-status.error {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .save-status.offline {
          background: rgba(234, 179, 8, 0.2);
          color: #fde047;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          color: #6b7280;
        }

        .loading-state p {
          margin-top: 16px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
