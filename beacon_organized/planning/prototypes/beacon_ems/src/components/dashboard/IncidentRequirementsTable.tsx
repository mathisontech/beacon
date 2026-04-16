import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { spacing, typography, borderRadius } from '../../theme/tokens';
import {
  INCIDENT_TYPES,
  type IncidentTypeDefinition,
  type ResponseRequirement,
  getIncidentCategories,
} from '../../data/incidentTypes';

// Light theme colors
const colors = {
  background: '#f8f9fa',
  backgroundHover: '#f0f1f2',
  card: '#ffffff',
  cardBorder: '#e5e7eb',
  text: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  accent: '#0097b2',
  accentLight: '#e0f7fa',
};

const severityColors = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

const categoryLabels: Record<string, string> = {
  fire: 'Fire',
  medical: 'Medical',
  rescue: 'Rescue',
  hazmat: 'Hazmat',
  weather: 'Weather',
  traffic: 'Traffic',
  utility: 'Utility',
  crime: 'Crime',
  welfare: 'Welfare',
  other: 'Other',
};

interface IncidentRequirementsTableProps {
  onUpdateRequirement?: (typeId: string, updates: Partial<IncidentTypeDefinition>) => void;
}

interface EditModalProps {
  visible: boolean;
  incidentType: IncidentTypeDefinition | null;
  onClose: () => void;
  onSave: (typeId: string, updates: Partial<IncidentTypeDefinition>) => void;
}

const EditModal: React.FC<EditModalProps> = ({ visible, incidentType, onClose, onSave }) => {
  const [minPersonnel, setMinPersonnel] = useState('');
  const [optimalPersonnel, setOptimalPersonnel] = useState('');
  const [maxResponseTime, setMaxResponseTime] = useState('');
  const [escalationThreshold, setEscalationThreshold] = useState('');
  const [responseRequirements, setResponseRequirements] = useState<ResponseRequirement[]>([]);

  React.useEffect(() => {
    if (incidentType) {
      setMinPersonnel(incidentType.minPersonnel.toString());
      setOptimalPersonnel(incidentType.optimalPersonnel.toString());
      setMaxResponseTime(incidentType.maxResponseTime.toString());
      setEscalationThreshold(incidentType.escalationThreshold.toString());
      setResponseRequirements([...incidentType.standardResponse]);
    }
  }, [incidentType]);

  const handleSave = () => {
    if (!incidentType) return;

    onSave(incidentType.id, {
      minPersonnel: parseInt(minPersonnel) || incidentType.minPersonnel,
      optimalPersonnel: parseInt(optimalPersonnel) || incidentType.optimalPersonnel,
      maxResponseTime: parseInt(maxResponseTime) || incidentType.maxResponseTime,
      escalationThreshold: parseInt(escalationThreshold) || incidentType.escalationThreshold,
      standardResponse: responseRequirements,
    });
    onClose();
  };

  const updateVehicleCount = (index: number, count: string) => {
    const updated = [...responseRequirements];
    updated[index] = { ...updated[index], minCount: parseInt(count) || 0 };
    setResponseRequirements(updated);
  };

  const addVehicleRequirement = () => {
    setResponseRequirements([
      ...responseRequirements,
      { vehicleType: 'new_unit', minCount: 1 },
    ]);
  };

  const removeVehicleRequirement = (index: number) => {
    setResponseRequirements(responseRequirements.filter((_, i) => i !== index));
  };

  if (!incidentType) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Requirements</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalIncidentName}>{incidentType.name}</Text>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Personnel Requirements */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Personnel Requirements</Text>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Minimum</Text>
                  <TextInput
                    style={styles.formInput}
                    value={minPersonnel}
                    onChangeText={setMinPersonnel}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Optimal</Text>
                  <TextInput
                    style={styles.formInput}
                    value={optimalPersonnel}
                    onChangeText={setOptimalPersonnel}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Response Time */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Response Time (minutes)</Text>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Target</Text>
                  <TextInput
                    style={styles.formInput}
                    value={maxResponseTime}
                    onChangeText={setMaxResponseTime}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Escalate After</Text>
                  <TextInput
                    style={styles.formInput}
                    value={escalationThreshold}
                    onChangeText={setEscalationThreshold}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Vehicle Requirements */}
            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <Text style={styles.formSectionTitle}>Vehicle Requirements</Text>
                <TouchableOpacity onPress={addVehicleRequirement} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {responseRequirements.map((req, index) => (
                <View key={index} style={styles.vehicleRow}>
                  <TextInput
                    style={[styles.formInput, styles.vehicleTypeInput]}
                    value={req.vehicleType.replace(/_/g, ' ')}
                    onChangeText={(text) => {
                      const updated = [...responseRequirements];
                      updated[index] = { ...updated[index], vehicleType: text.replace(/ /g, '_') };
                      setResponseRequirements(updated);
                    }}
                  />
                  <Text style={styles.vehicleCountLabel}>×</Text>
                  <TextInput
                    style={[styles.formInput, styles.vehicleCountInput]}
                    value={req.minCount.toString()}
                    onChangeText={(text) => updateVehicleCount(index, text)}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => removeVehicleRequirement(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>−</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const IncidentRequirementsTable: React.FC<IncidentRequirementsTableProps> = ({
  onUpdateRequirement,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('fire');
  const [editingType, setEditingType] = useState<IncidentTypeDefinition | null>(null);
  const [localTypes, setLocalTypes] = useState<Record<string, IncidentTypeDefinition>>({ ...INCIDENT_TYPES });

  const categories = getIncidentCategories();

  const handleSave = (typeId: string, updates: Partial<IncidentTypeDefinition>) => {
    setLocalTypes(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], ...updates },
    }));
    onUpdateRequirement?.(typeId, updates);
  };

  const getTypesByCategory = (category: string) => {
    return Object.values(localTypes).filter(type => type.category === category);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Standard Response Requirements</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map(category => {
          const types = getTypesByCategory(category);
          if (types.length === 0) return null;

          const isExpanded = expandedCategory === category;

          return (
            <View key={category} style={styles.categorySection}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(isExpanded ? null : category)}
              >
                <Text style={styles.categoryTitle}>{categoryLabels[category] || category}</Text>
                <View style={styles.categoryHeaderRight}>
                  <Text style={styles.categoryCount}>{types.length} types</Text>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.typesList}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.typeNameCell]}>Incident Type</Text>
                    <Text style={[styles.tableHeaderCell, styles.personnelCell]}>Personnel</Text>
                    <Text style={[styles.tableHeaderCell, styles.vehiclesCell]}>Vehicles</Text>
                    <Text style={[styles.tableHeaderCell, styles.timeCell]}>Target</Text>
                    <Text style={[styles.tableHeaderCell, styles.actionCell]}></Text>
                  </View>

                  {types.map(type => (
                    <View key={type.id} style={styles.tableRow}>
                      <View style={[styles.tableCell, styles.typeNameCell]}>
                        <View style={[styles.severityDot, { backgroundColor: severityColors[type.severity] }]} />
                        <Text style={styles.typeName} numberOfLines={1}>{type.name}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.personnelCell]}>
                        <Text style={styles.cellValue}>{type.minPersonnel}</Text>
                        <Text style={styles.cellSubvalue}>min</Text>
                      </View>
                      <View style={[styles.tableCell, styles.vehiclesCell]}>
                        <Text style={styles.vehiclesList} numberOfLines={1}>
                          {type.standardResponse.map(r => `${r.minCount}× ${r.vehicleType.replace(/_/g, ' ')}`).join(', ')}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.timeCell]}>
                        <Text style={styles.cellValue}>{type.maxResponseTime}m</Text>
                      </View>
                      <View style={[styles.tableCell, styles.actionCell]}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => setEditingType(type)}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Edit Modal */}
      <EditModal
        visible={editingType !== null}
        incidentType={editingType}
        onClose={() => setEditingType(null)}
        onSave={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },

  // Category Section
  categorySection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  expandIcon: {
    fontSize: 10,
    color: colors.textMuted,
  },

  // Table
  typesList: {
    backgroundColor: colors.backgroundHover,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeNameCell: {
    flex: 2,
    gap: spacing.xs,
  },
  personnelCell: {
    width: 60,
    justifyContent: 'center',
    gap: 2,
  },
  vehiclesCell: {
    flex: 2,
  },
  timeCell: {
    width: 50,
    justifyContent: 'center',
  },
  actionCell: {
    width: 50,
    justifyContent: 'flex-end',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeName: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  cellValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  cellSubvalue: {
    fontSize: 9,
    color: colors.textMuted,
  },
  vehiclesList: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.accentLight,
  },
  editButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: colors.textMuted,
  },
  modalIncidentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  // Form
  formSection: {
    marginBottom: spacing.md,
  },
  formSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  vehicleTypeInput: {
    flex: 1,
  },
  vehicleCountLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  vehicleCountInput: {
    width: 50,
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.accentLight,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundHover,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default IncidentRequirementsTable;
