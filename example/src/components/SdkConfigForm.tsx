import { useState } from 'react';
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

import { debugConsoleStyles } from '../styles/debugConsoleStyles';
import type { RuntimeSdkConfig } from '../types/debugConsole';

interface SdkConfigFormProps {
  value: RuntimeSdkConfig;
  errors: string[];
  onChange: (nextValue: RuntimeSdkConfig) => void;
}

const logLevelOptions: RuntimeSdkConfig['debug']['logLevel'][] = [
  'none',
  'error',
  'warning',
  'info',
  'debug',
  'verbose',
];

interface BooleanToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function BooleanToggle({ label, value, onValueChange }: BooleanToggleProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={debugConsoleStyles.checkboxRow}
    >
      <View
        style={[
          debugConsoleStyles.checkboxBox,
          value ? debugConsoleStyles.checkboxBoxChecked : null,
        ]}
      >
        {value ? <Text style={debugConsoleStyles.checkboxMark}>✓</Text> : null}
      </View>
      <Text style={debugConsoleStyles.inputLabel}>{label}</Text>
    </Pressable>
  );
}

interface LogLevelSelectProps {
  value: RuntimeSdkConfig['debug']['logLevel'];
  onSelect: (value: RuntimeSdkConfig['debug']['logLevel']) => void;
}

function LogLevelSelect({ value, onSelect }: LogLevelSelectProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={debugConsoleStyles.dropdownTrigger}
      >
        <Text style={debugConsoleStyles.dropdownTriggerText}>{value}</Text>
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
                  Select log level
                </Text>
                <ScrollView
                  style={debugConsoleStyles.dropdownList}
                  contentContainerStyle={debugConsoleStyles.dropdownListContent}
                  showsVerticalScrollIndicator
                >
                  {logLevelOptions.map((option) => {
                    const selected = value === option;

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

export function SdkConfigForm({ value, errors, onChange }: SdkConfigFormProps) {
  return (
    <View style={debugConsoleStyles.stack12}>
      <View style={debugConsoleStyles.sectionHeader}>
        <Text style={debugConsoleStyles.sectionLabel}>Config</Text>
        <Text style={debugConsoleStyles.sectionTitle}>Runtime config</Text>
        <Text style={debugConsoleStyles.sectionHint}>
          Enter sample credentials at runtime only. Configure tracking, debug,
          and platform-specific initialization options before calling
          initialize.
        </Text>
      </View>

      <View style={debugConsoleStyles.stack8}>
        <Text style={debugConsoleStyles.inputLabel}>App ID</Text>
        <TextInput
          value={value.appId}
          onChangeText={(appId) => onChange({ ...value, appId })}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="enter-app-id-at-runtime"
          style={debugConsoleStyles.textInput}
        />
      </View>

      <View style={debugConsoleStyles.stack8}>
        <Text style={debugConsoleStyles.inputLabel}>Access Token</Text>
        <TextInput
          value={value.accessToken}
          onChangeText={(accessToken) => onChange({ ...value, accessToken })}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="enter-access-token-at-runtime"
          style={debugConsoleStyles.textInput}
        />
      </View>

      <View style={debugConsoleStyles.stack8}>
        <Text style={debugConsoleStyles.inputLabel}>TikTok App ID</Text>
        <TextInput
          value={value.tiktokAppId.join(',')}
          onChangeText={(tiktokAppId) =>
            onChange({
              ...value,
              tiktokAppId: tiktokAppId.split(',').map((item) => item.trim()),
            })
          }
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="1234567890,0987654321"
          style={debugConsoleStyles.textInput}
        />
      </View>

      <View style={debugConsoleStyles.divider} />

      <BooleanToggle
        label="Debug enabled"
        value={value.debug.enabled}
        onValueChange={(enabled) =>
          onChange({
            ...value,
            debug: {
              ...value.debug,
              enabled,
            },
          })
        }
      />

      <View style={debugConsoleStyles.stack8}>
        <Text style={debugConsoleStyles.inputLabel}>Log level</Text>
        <LogLevelSelect
          value={value.debug.logLevel}
          onSelect={(logLevel) =>
            onChange({
              ...value,
              debug: {
                ...value.debug,
                logLevel,
              },
            })
          }
        />
      </View>

      <View style={debugConsoleStyles.divider} />

      <BooleanToggle
        label="Disable tracking"
        value={value.disableTrack ?? false}
        onValueChange={(disableTrack) => onChange({ ...value, disableTrack })}
      />

      <BooleanToggle
        label="Disable automatic tracking"
        value={value.disableAutoTrack ?? false}
        onValueChange={(disableAutoTrack) =>
          onChange({ ...value, disableAutoTrack })
        }
      />

      <BooleanToggle
        label="Disable retention tracking"
        value={value.disableRetentionTrack ?? false}
        onValueChange={(disableRetentionTrack) =>
          onChange({ ...value, disableRetentionTrack })
        }
      />

      <BooleanToggle
        label="Disable payment tracking"
        value={value.disablePayTrack ?? false}
        onValueChange={(disablePayTrack) =>
          onChange({ ...value, disablePayTrack })
        }
      />

      <BooleanToggle
        label="Disable install tracking"
        value={value.disableInstallTrack ?? false}
        onValueChange={(disableInstallTrack) =>
          onChange({ ...value, disableInstallTrack })
        }
      />

      <BooleanToggle
        label="Disable launch tracking"
        value={value.disableLaunchTrack ?? false}
        onValueChange={(disableLaunchTrack) =>
          onChange({ ...value, disableLaunchTrack })
        }
      />

      <BooleanToggle
        label="Disable enhanced data postback tracking"
        value={value.disableEnhancedDataPostbackTrack ?? false}
        onValueChange={(disableEnhancedDataPostbackTrack) =>
          onChange({ ...value, disableEnhancedDataPostbackTrack })
        }
      />

      <BooleanToggle
        label="Enable limited data use"
        value={value.openLimitedDataUse ?? false}
        onValueChange={(openLimitedDataUse) =>
          onChange({ ...value, openLimitedDataUse })
        }
      />

      <BooleanToggle
        label="Set low performance device"
        value={value.setIsLowPerformanceDevice ?? false}
        onValueChange={(setIsLowPerformanceDevice) =>
          onChange({ ...value, setIsLowPerformanceDevice })
        }
      />

      {Platform.OS === 'ios' ? (
        <>
          <View style={debugConsoleStyles.divider} />

          <BooleanToggle
            label="Disable iOS SKAdNetwork support"
            value={value.ios.disableSKAdNetworkSupport}
            onValueChange={(disableSKAdNetworkSupport) =>
              onChange({
                ...value,
                ios: {
                  ...value.ios,
                  disableSKAdNetworkSupport,
                },
              })
            }
          />
        </>
      ) : null}

      {errors.length > 0 ? (
        <View style={debugConsoleStyles.stack4}>
          {errors.map((error) => (
            <Text key={error} style={debugConsoleStyles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
