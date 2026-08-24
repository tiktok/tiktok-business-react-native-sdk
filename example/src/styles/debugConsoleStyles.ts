import { StyleSheet } from 'react-native';

export const debugConsoleColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  border: '#d8d8d8',
  borderStrong: '#b8b8b8',
  primary: '#2563eb',
  primaryMuted: '#eff6ff',
  text: '#111827',
  mutedText: '#4b5563',
  subtleText: '#6b7280',
  success: '#15803d',
  successBg: '#dcfce7',
  error: '#b91c1c',
  errorBg: '#fee2e2',
  warning: '#b45309',
  warningBg: '#fef3c7',
  neutralBg: '#e5e7eb',
  codeBg: '#f9fafb',
};

export const debugConsoleStyles = StyleSheet.create({
  screenSection: {
    gap: 10,
  },
  page: {
    gap: 16,
  },
  pageHeader: {
    gap: 6,
  },
  pageEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: debugConsoleColors.primary,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: debugConsoleColors.text,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: debugConsoleColors.mutedText,
  },
  card: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    borderRadius: 10,
    backgroundColor: debugConsoleColors.surface,
    padding: 14,
    gap: 12,
  },
  panel: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    backgroundColor: debugConsoleColors.surface,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stack16: {
    gap: 16,
  },
  stack12: {
    gap: 12,
  },
  stack8: {
    gap: 8,
  },
  stack4: {
    gap: 4,
  },
  flex1Gap4: {
    flex: 1,
    gap: 4,
  },
  flex1Gap6: {
    flex: 1,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: debugConsoleColors.primary,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: debugConsoleColors.text,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: debugConsoleColors.mutedText,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: debugConsoleColors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: debugConsoleColors.mutedText,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: debugConsoleColors.subtleText,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: debugConsoleColors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: debugConsoleColors.borderStrong,
    borderRadius: 10,
    backgroundColor: debugConsoleColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: debugConsoleColors.text,
  },
  multilineInput: {
    minHeight: 140,
    textAlignVertical: 'top',
    fontFamily: 'Menlo',
  },
  selectorField: {
    borderWidth: 1,
    borderColor: debugConsoleColors.borderStrong,
    borderRadius: 10,
    backgroundColor: debugConsoleColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  selectorFieldText: {
    fontSize: 14,
    color: debugConsoleColors.text,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: debugConsoleColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: debugConsoleColors.surface,
  },
  checkboxBoxChecked: {
    borderColor: debugConsoleColors.primary,
    backgroundColor: debugConsoleColors.primary,
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: debugConsoleColors.borderStrong,
    borderRadius: 10,
    backgroundColor: debugConsoleColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownTriggerText: {
    flex: 1,
    fontSize: 14,
    color: debugConsoleColors.text,
  },
  dropdownChevron: {
    fontSize: 14,
    color: debugConsoleColors.subtleText,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.24)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownSheet: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    borderRadius: 12,
    backgroundColor: debugConsoleColors.surface,
    padding: 14,
    gap: 12,
    maxHeight: '70%',
  },
  dropdownList: {
    maxHeight: 420,
  },
  dropdownListContent: {
    gap: 8,
    paddingBottom: 4,
  },
  dropdownOption: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: debugConsoleColors.surface,
  },
  dropdownOptionSelected: {
    borderColor: debugConsoleColors.primary,
    backgroundColor: debugConsoleColors.primaryMuted,
  },
  dropdownOptionText: {
    fontSize: 13,
    color: debugConsoleColors.text,
  },
  dropdownOptionTextSelected: {
    color: debugConsoleColors.primary,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: debugConsoleColors.border,
    paddingBottom: 8,
  },
  tabButton: {
    gap: 8,
    paddingBottom: 2,
  },
  tabText: {
    fontSize: 15,
    color: debugConsoleColors.mutedText,
  },
  tabTextActive: {
    color: debugConsoleColors.primary,
    fontWeight: '600',
  },
  tabUnderline: {
    height: 2,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: debugConsoleColors.primary,
  },
  actionGroup: {
    gap: 12,
  },
  actionBlock: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: debugConsoleColors.border,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: debugConsoleColors.mutedText,
  },
  actionMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: debugConsoleColors.subtleText,
  },
  actionButton: {
    borderRadius: 8,
    backgroundColor: debugConsoleColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  codeBlock: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    backgroundColor: debugConsoleColors.codeBg,
    padding: 10,
  },
  codeText: {
    fontSize: 12,
    lineHeight: 18,
    color: debugConsoleColors.text,
    fontFamily: 'Menlo',
  },
  previewBox: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    backgroundColor: debugConsoleColors.codeBg,
    padding: 10,
  },
  previewText: {
    fontSize: 12,
    lineHeight: 18,
    color: debugConsoleColors.text,
    fontFamily: 'Menlo',
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: debugConsoleColors.neutralBg,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: debugConsoleColors.text,
  },
  successChip: {
    backgroundColor: debugConsoleColors.successBg,
  },
  errorChip: {
    backgroundColor: debugConsoleColors.errorBg,
  },
  warningChip: {
    backgroundColor: debugConsoleColors.warningBg,
  },
  successChipText: {
    color: debugConsoleColors.success,
  },
  errorChipText: {
    color: debugConsoleColors.error,
  },
  warningChipText: {
    color: debugConsoleColors.warning,
  },
  timelineRow: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    backgroundColor: debugConsoleColors.surface,
    padding: 12,
    gap: 8,
  },
  logEntry: {
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: debugConsoleColors.border,
  },
  divider: {
    height: 1,
    backgroundColor: debugConsoleColors.border,
  },
  placeholderPanel: {
    borderWidth: 1,
    borderColor: debugConsoleColors.border,
    backgroundColor: debugConsoleColors.codeBg,
    padding: 12,
  },
  inlineStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  successText: {
    color: debugConsoleColors.success,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: debugConsoleColors.error,
  },
  warningText: {
    color: debugConsoleColors.warning,
  },
});
