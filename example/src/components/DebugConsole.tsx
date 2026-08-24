import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import type {
  AdvancedMatchingPayload,
  AndroidGooglePlayPurchasePayload,
  TrackAdRevenueEventOptions,
} from '@tiktok-business/react-native-sdk';
import {
  contentEventNames,
  defaultAndroidGooglePlayPurchasePayload,
  defaultContentEventName,
  defaultCustomEventName,
  defaultIdentifyPayload,
  defaultInitializeConfig,
  defaultStandardEventName,
  defaultTrackAdRevenueEventProperties,
  defaultTrackContentEventProperties,
  defaultTrackCustomEventProperties,
  defaultTrackEventProperties,
  standardEventNames,
} from '../constants/debugPayloads';
import { PayloadEditor } from './PayloadEditor';
import { SdkConfigForm } from './SdkConfigForm';
import { debugConsoleStyles } from '../styles/debugConsoleStyles';
import type {
  ActionStatus,
  EditablePayloads,
  RuntimeSdkConfig,
  SdkAction,
} from '../types/debugConsole';
import {
  parseJsonObject,
  validateInitializeConfig,
  validateOptionalObject,
} from '../utils/payloadValidation';
import { buildSdkActions } from '../utils/sdkActions';

const currentPlatform = Platform.OS === 'android' ? 'android' : 'ios';
type DebugTab = 'config' | 'actions' | 'identity' | 'platform';

const tabs: Array<{ key: DebugTab; label: string }> = [
  { key: 'config', label: 'Config' },
  { key: 'actions', label: 'Actions' },
  { key: 'identity', label: 'Identity' },
  { key: 'platform', label: 'Platform' },
];

function createInitialRuntimeConfig(): RuntimeSdkConfig {
  return defaultInitializeConfig;
}

function createInitialPayloads(): EditablePayloads {
  return {
    trackEventProperties: defaultTrackEventProperties,
    trackContentEventProperties: defaultTrackContentEventProperties,
    trackCustomEventProperties: defaultTrackCustomEventProperties,
    trackAdRevenueEventProperties: defaultTrackAdRevenueEventProperties,
    identifyPayload: defaultIdentifyPayload,
    androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    standardEventName: defaultStandardEventName,
    contentEventName: defaultContentEventName,
    customEventName: defaultCustomEventName,
  };
}

function getStatusLabel(status: ActionStatus) {
  switch (status) {
    case 'running':
      return 'Running';
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    default:
      return 'Idle';
  }
}

interface ActionButtonProps {
  action: SdkAction;
  status: ActionStatus;
  onRun: () => void;
}

function getActionPlatformLabel(action: SdkAction) {
  if (action.supportedPlatform === 'both') {
    return 'iOS and Android';
  }

  return action.supportedPlatform === 'ios' ? 'iOS' : 'Android';
}

function isTrackAdRevenueOptions(
  value: unknown
): value is TrackAdRevenueEventOptions {
  return (
    value !== null &&
    typeof value === 'object' &&
    'adNetwork' in value &&
    'revenue' in value &&
    'currency' in value
  );
}

function ActionButton({ action, status, onRun }: ActionButtonProps) {
  return (
    <View style={debugConsoleStyles.actionBlock}>
      <View style={debugConsoleStyles.stack4}>
        <Text style={debugConsoleStyles.inputLabel}>{action.label}</Text>
        <Text style={debugConsoleStyles.actionDescription}>
          {action.description}
        </Text>
        <Text style={debugConsoleStyles.actionMeta}>
          Available on: {getActionPlatformLabel(action)} {' · '}Status:{' '}
          {getStatusLabel(status)}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onRun}
        disabled={status === 'running'}
        style={[
          debugConsoleStyles.actionButton,
          status === 'running' ? debugConsoleStyles.actionButtonDisabled : null,
        ]}
      >
        <Text style={debugConsoleStyles.actionButtonText}>
          {status === 'running' ? 'Running…' : action.label}
        </Text>
      </Pressable>
    </View>
  );
}

interface EventNamePickerProps<T extends string> {
  options: T[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function EventNamePicker<T extends string>({
  options,
  selectedValue,
  onSelect,
}: EventNamePickerProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={debugConsoleStyles.dropdownTrigger}
      >
        <Text style={debugConsoleStyles.dropdownTriggerText}>
          {selectedValue}
        </Text>
        <Text style={debugConsoleStyles.dropdownChevron}>▾</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={debugConsoleStyles.dropdownOverlay}>
            <TouchableWithoutFeedback>
              <View style={debugConsoleStyles.dropdownSheet}>
                <Text style={debugConsoleStyles.sectionTitle}>
                  Select event name
                </Text>
                <ScrollView
                  style={debugConsoleStyles.dropdownList}
                  contentContainerStyle={debugConsoleStyles.dropdownListContent}
                  showsVerticalScrollIndicator
                >
                  {options.map((option) => {
                    const selected = selectedValue === option;

                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        onPress={() => {
                          onSelect(option);
                          setVisible(false);
                        }}
                        style={[
                          debugConsoleStyles.dropdownOption,
                          selected
                            ? debugConsoleStyles.dropdownOptionSelected
                            : null,
                        ]}
                      >
                        <Text
                          style={[
                            debugConsoleStyles.dropdownOptionText,
                            selected
                              ? debugConsoleStyles.dropdownOptionTextSelected
                              : null,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export function DebugConsole() {
  const [activeTab, setActiveTab] = useState<DebugTab>('config');
  const [runtimeConfig, setRuntimeConfig] = useState(
    createInitialRuntimeConfig
  );
  const [editablePayloads, setEditablePayloads] = useState(
    createInitialPayloads
  );
  const [actionStatuses, setActionStatuses] = useState<
    Record<string, ActionStatus>
  >({});
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [_generalError, setGeneralError] = useState<string | null>(null);
  const [trackEventPropertiesText, setTrackEventPropertiesText] = useState(
    JSON.stringify(defaultTrackEventProperties, null, 2)
  );
  const [trackContentEventPropertiesText, setTrackContentEventPropertiesText] =
    useState(JSON.stringify(defaultTrackContentEventProperties, null, 2));
  const [trackCustomEventPropertiesText, setTrackCustomEventPropertiesText] =
    useState(JSON.stringify(defaultTrackCustomEventProperties, null, 2));
  const [
    trackAdRevenueEventPropertiesText,
    setTrackAdRevenueEventPropertiesText,
  ] = useState(JSON.stringify(defaultTrackAdRevenueEventProperties, null, 2));
  const [identifyPayloadText, setIdentifyPayloadText] = useState(
    JSON.stringify(defaultIdentifyPayload, null, 2)
  );
  const [androidPurchasePayloadText, setAndroidPurchasePayloadText] = useState(
    JSON.stringify(defaultAndroidGooglePlayPurchasePayload, null, 2)
  );
  const [, setTrackEventPropertiesError] = useState<string | null>(null);
  const [, setTrackContentEventPropertiesError] = useState<string | null>(null);
  const [, setTrackCustomEventPropertiesError] = useState<string | null>(null);
  const [, setTrackAdRevenueEventPropertiesError] = useState<string | null>(
    null
  );
  const [, setIdentifyPayloadError] = useState<string | null>(null);
  const [androidPurchasePayloadError, setAndroidPurchasePayloadError] =
    useState<string | null>(null);

  const parsedTrackEventProperties = useMemo(
    () =>
      parseJsonObject(trackEventPropertiesText, 'Standard event properties'),
    [trackEventPropertiesText]
  );
  const parsedTrackContentEventProperties = useMemo(
    () =>
      parseJsonObject(
        trackContentEventPropertiesText,
        'Content event properties'
      ),
    [trackContentEventPropertiesText]
  );
  const parsedTrackCustomEventProperties = useMemo(
    () =>
      parseJsonObject(
        trackCustomEventPropertiesText,
        'Custom event properties'
      ),
    [trackCustomEventPropertiesText]
  );
  const parsedTrackAdRevenueEventProperties = useMemo(
    () =>
      parseJsonObject(
        trackAdRevenueEventPropertiesText,
        'Ad revenue event properties'
      ),
    [trackAdRevenueEventPropertiesText]
  );
  const parsedIdentifyPayload = useMemo(
    () =>
      parseJsonObject<AdvancedMatchingPayload>(
        identifyPayloadText,
        'Identify payload',
        {
          allowEmpty: false,
        }
      ),
    [identifyPayloadText]
  );
  const parsedAndroidPurchasePayload = useMemo(
    () =>
      parseJsonObject<AndroidGooglePlayPurchasePayload>(
        androidPurchasePayloadText,
        'Android Google Play purchase payload'
      ),
    [androidPurchasePayloadText]
  );

  const resolvedEditablePayloads = useMemo(
    () => ({
      ...editablePayloads,
      trackEventProperties:
        parsedTrackEventProperties.value ??
        editablePayloads.trackEventProperties,
      trackContentEventProperties:
        parsedTrackContentEventProperties.value ??
        editablePayloads.trackContentEventProperties,
      trackCustomEventProperties:
        parsedTrackCustomEventProperties.value ??
        editablePayloads.trackCustomEventProperties,
      trackAdRevenueEventProperties: isTrackAdRevenueOptions(
        parsedTrackAdRevenueEventProperties.value
      )
        ? parsedTrackAdRevenueEventProperties.value
        : editablePayloads.trackAdRevenueEventProperties,
    }),
    [
      editablePayloads,
      parsedTrackAdRevenueEventProperties.value,
      parsedTrackContentEventProperties.value,
      parsedTrackCustomEventProperties.value,
      parsedTrackEventProperties.value,
    ]
  );

  const actions = useMemo(
    () =>
      buildSdkActions({
        runtimeConfig,
        editablePayloads: resolvedEditablePayloads,
        trackEventProperties: resolvedEditablePayloads.trackEventProperties,
        identifyPayload: parsedIdentifyPayload.value,
        androidPurchasePayload: parsedAndroidPurchasePayload.value,
      }),
    [
      parsedAndroidPurchasePayload.value,
      parsedIdentifyPayload.value,
      resolvedEditablePayloads,
      runtimeConfig,
    ]
  );

  const actionsById = useMemo(
    () => Object.fromEntries(actions.map((action) => [action.id, action])),
    [actions]
  );

  const runAction = async (actionId: string) => {
    const action = actions.find((item) => item.id === actionId);

    if (!action) {
      return;
    }

    const validationErrors: string[] = [];

    if (actionId === 'root.initialize') {
      validationErrors.push(...validateInitializeConfig(runtimeConfig));
      setConfigErrors(validationErrors);
    }

    if (actionId === 'trackGooglePlayPurchase') {
      validationErrors.push(
        ...validateOptionalObject(
          'Android Google Play purchase payload',
          parsedAndroidPurchasePayload.error ?? androidPurchasePayloadError
        )
      );
    }

    if (validationErrors.length > 0) {
      setActionStatuses((current) => ({ ...current, [actionId]: 'error' }));
      setGeneralError(validationErrors.join(' '));
      return;
    }

    setGeneralError(null);
    setActionStatuses((current) => ({ ...current, [actionId]: 'running' }));

    try {
      await action.run();
      setActionStatuses((current) => ({ ...current, [actionId]: 'success' }));
    } catch (error) {
      setActionStatuses((current) => ({ ...current, [actionId]: 'error' }));
      setGeneralError(
        error instanceof Error ? error.message : 'Action failed.'
      );
    }
  };

  const renderAction = (actionId: string) => {
    const action = actionsById[actionId];

    if (!action) {
      return null;
    }

    return (
      <ActionButton
        key={action.id}
        action={action}
        status={actionStatuses[action.id] ?? 'idle'}
        onRun={() => {
          runAction(action.id).catch(() => undefined);
        }}
      />
    );
  };

  return (
    <View style={debugConsoleStyles.page}>
      <View style={debugConsoleStyles.tabRow}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => setActiveTab(tab.key)}
              style={debugConsoleStyles.tabButton}
            >
              <Text
                style={[
                  debugConsoleStyles.tabText,
                  active ? debugConsoleStyles.tabTextActive : null,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  debugConsoleStyles.tabUnderline,
                  active ? debugConsoleStyles.tabUnderlineActive : null,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'config' ? (
        <View style={debugConsoleStyles.stack16}>
          <View style={debugConsoleStyles.panel}>
            <SdkConfigForm
              value={runtimeConfig}
              errors={configErrors}
              onChange={(nextValue) => {
                setConfigErrors([]);
                setRuntimeConfig(nextValue);
              }}
            />
          </View>
        </View>
      ) : null}

      {activeTab === 'actions' ? (
        <View style={debugConsoleStyles.stack16}>
          <View style={debugConsoleStyles.panel}>
            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionLabel}>Actions</Text>
              <Text style={debugConsoleStyles.sectionTitle}>SDK setup</Text>
              <Text style={debugConsoleStyles.sectionHint}>
                Initialize first, then use the root APIs for common SDK flows.
              </Text>
            </View>
            <View style={debugConsoleStyles.actionGroup}>
              {renderAction('root.initialize')}
            </View>

            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionTitle}>
                Standard event
              </Text>
              <Text style={debugConsoleStyles.sectionHint}>
                Pick a standard event name and send shared event properties.
              </Text>
            </View>

            <View style={debugConsoleStyles.stack8}>
              <Text style={debugConsoleStyles.inputLabel}>Event name</Text>
              <EventNamePicker
                options={standardEventNames}
                selectedValue={editablePayloads.standardEventName}
                onSelect={(standardEventName) =>
                  setEditablePayloads((current) => ({
                    ...current,
                    standardEventName,
                  }))
                }
              />
            </View>

            <PayloadEditor
              label="Standard event properties"
              value={editablePayloads.trackEventProperties}
              helperText="JSON object passed to trackEvent(). Parsing happens in the example UI only; payload acceptance is decided by native."
              onRawChange={setTrackEventPropertiesText}
              onParsedValueChange={(value) => {
                if (value) {
                  setEditablePayloads((current) => ({
                    ...current,
                    trackEventProperties: value,
                  }));
                }
              }}
              onValidationChange={setTrackEventPropertiesError}
            />

            {renderAction('root.trackEvent')}

            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionTitle}>Content event</Text>
              <Text style={debugConsoleStyles.sectionHint}>
                Use the dedicated content event entry with content-aware fields.
              </Text>
            </View>

            <View style={debugConsoleStyles.stack8}>
              <Text style={debugConsoleStyles.inputLabel}>Event name</Text>
              <EventNamePicker
                options={contentEventNames}
                selectedValue={editablePayloads.contentEventName}
                onSelect={(contentEventName) =>
                  setEditablePayloads((current) => ({
                    ...current,
                    contentEventName,
                  }))
                }
              />
            </View>

            <PayloadEditor
              label="Content event properties"
              value={editablePayloads.trackContentEventProperties}
              helperText="JSON object passed to trackContentEvent(). Parsing happens in the example UI only; accepted value formats are decided by native."
              onRawChange={setTrackContentEventPropertiesText}
              onParsedValueChange={(value) => {
                if (value) {
                  setEditablePayloads((current) => ({
                    ...current,
                    trackContentEventProperties: value,
                  }));
                }
              }}
              onValidationChange={setTrackContentEventPropertiesError}
            />

            {renderAction('root.trackContentEvent')}

            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionTitle}>Custom event</Text>
              <Text style={debugConsoleStyles.sectionHint}>
                Set a custom event name and arbitrary JSON properties.
              </Text>
            </View>

            <View style={debugConsoleStyles.stack8}>
              <Text style={debugConsoleStyles.inputLabel}>Event name</Text>
              <TextInput
                value={editablePayloads.customEventName}
                onChangeText={(customEventName) =>
                  setEditablePayloads((current) => ({
                    ...current,
                    customEventName,
                  }))
                }
                autoCapitalize="none"
                autoCorrect={false}
                style={debugConsoleStyles.textInput}
              />
            </View>

            <PayloadEditor
              label="Custom event properties"
              value={editablePayloads.trackCustomEventProperties}
              helperText="JSON object passed to trackCustomEvent(). Parsing happens in the example UI only; payload acceptance is decided by native."
              onRawChange={setTrackCustomEventPropertiesText}
              onParsedValueChange={(value) => {
                if (value) {
                  setEditablePayloads((current) => ({
                    ...current,
                    trackCustomEventProperties: value,
                  }));
                }
              }}
              onValidationChange={setTrackCustomEventPropertiesError}
            />

            {renderAction('root.trackCustomEvent')}

            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionTitle}>
                Ad revenue event
              </Text>
              <Text style={debugConsoleStyles.sectionHint}>
                Send ad revenue properties through the dedicated root entry.
              </Text>
            </View>

            <PayloadEditor
              label="Ad revenue properties"
              value={editablePayloads.trackAdRevenueEventProperties}
              helperText="JSON object passed to trackAdRevenueEvent(). Parsing happens in the example UI only; payload acceptance is decided by native."
              onRawChange={setTrackAdRevenueEventPropertiesText}
              onParsedValueChange={(value) => {
                if (value) {
                  setEditablePayloads((current) => ({
                    ...current,
                    trackAdRevenueEventProperties: value,
                  }));
                }
              }}
              onValidationChange={setTrackAdRevenueEventPropertiesError}
            />

            {renderAction('root.trackAdRevenueEvent')}
          </View>
        </View>
      ) : null}

      {activeTab === 'identity' ? (
        <View style={debugConsoleStyles.stack16}>
          <View style={debugConsoleStyles.panel}>
            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionLabel}>
                Identity tools
              </Text>
              <Text style={debugConsoleStyles.sectionTitle}>
                Identify and session
              </Text>
            </View>

            <PayloadEditor
              label="Identify payload"
              value={editablePayloads.identifyPayload}
              helperText="JSON object passed to identify(). Parsing happens in the example UI only; identifier requirements are decided by native."
              onRawChange={setIdentifyPayloadText}
              onParsedValueChange={(value) => {
                if (value) {
                  setEditablePayloads((current) => ({
                    ...current,
                    identifyPayload: value,
                  }));
                }
              }}
              onValidationChange={setIdentifyPayloadError}
            />

            <View style={debugConsoleStyles.actionGroup}>
              {renderAction('root.identify')}
              {renderAction('root.flush')}
              {renderAction('root.logout')}
            </View>
          </View>
        </View>
      ) : null}

      {activeTab === 'platform' ? (
        <View style={debugConsoleStyles.stack16}>
          <View style={debugConsoleStyles.panel}>
            <View style={debugConsoleStyles.sectionHeader}>
              <Text style={debugConsoleStyles.sectionLabel}>
                Platform tools
              </Text>
              <Text style={debugConsoleStyles.sectionTitle}>
                {currentPlatform === 'ios'
                  ? 'iOS-only APIs'
                  : 'Android-only APIs'}
              </Text>
              <Text style={debugConsoleStyles.sectionHint}>
                The example only shows current-platform controls. Public JS
                methods still check Platform before invoking native calls, so
                wrong-platform calls fail before reaching the native bridge.
              </Text>
            </View>

            {currentPlatform === 'ios' ? (
              <View style={debugConsoleStyles.stack12}>
                <Text style={debugConsoleStyles.sectionHint}>
                  ATT status is requested through the host app's native iOS
                  setup. SKAN ownership is configured before initialize on the
                  Config tab.
                </Text>

                <View style={debugConsoleStyles.actionGroup}>
                  {renderAction('requestTrackingAuthorization')}
                </View>
              </View>
            ) : null}

            {currentPlatform === 'android' ? (
              <View style={debugConsoleStyles.stack12}>
                <PayloadEditor
                  label="Android Google Play purchase payload"
                  value={editablePayloads.androidPurchasePayload}
                  helperText="JSON object passed to trackGooglePlayPurchase(). Parsing happens in the example UI only; payload acceptance is decided by native."
                  onRawChange={setAndroidPurchasePayloadText}
                  onParsedValueChange={(value) => {
                    if (value) {
                      setEditablePayloads((current) => ({
                        ...current,
                        androidPurchasePayload: value,
                      }));
                    }
                  }}
                  onValidationChange={setAndroidPurchasePayloadError}
                />

                <View style={debugConsoleStyles.actionGroup}>
                  {renderAction('trackGooglePlayPurchase')}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
