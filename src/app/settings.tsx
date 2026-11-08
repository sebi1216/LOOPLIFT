import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { restTimer } from '@/data/rest';
import { allowRestAlert, cancelRestAlert, openPhoneSettings, restAlertAllowed, restAlertAvailable } from '@/data/rest-alert';
import { getSettings, REST_STEP, updateSettings, useSettings, type Theme } from '@/data/settings';
import { otherUnit, type Unit } from '@/data/units';
import { t } from '@/i18n';
import { Button } from '@/ui/button';
import { Stepper } from '@/ui/stepper';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors, useScheme } from '@/ui/use-colors';

const THEMES: Theme[] = ['system', 'light', 'dark'];
const UNITS: Unit[] = ['kg', 'lb'];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Settings (from the gear on Today): rest timer on or off, its length, the lock screen alert,
// haptics, the standard reps of a new lift, the weight unit (kg or lb, optionally both), and the
// look (System, Light, Dark). Saved on the phone (src/data/settings.ts).
// States: /settings, and /settings?state=denied shows the note for notifications turned off.
// No design frame: built from the S1 tokens and the platform's own controls (Suggestion).
export default function Settings() {
  const c = useColors();
  const scheme = useScheme();
  const s = useSettings();
  const { state } = useLocalSearchParams<{ state?: string }>();
  const [denied, setDenied] = useState(state === 'denied');

  // Notifications can be turned off in the phone's Settings: the switch must not stay on then.
  useEffect(() => {
    if (!getSettings().restAlert) return;
    restAlertAllowed().then((ok) => {
      if (ok) return;
      setDenied(true);
      updateSettings({ restAlert: false });
    });
  }, []);

  const setAlert = async (on: boolean) => {
    if (!on) {
      cancelRestAlert();
      return updateSettings({ restAlert: false });
    }
    const ok = await allowRestAlert();
    setDenied(!ok);
    updateSettings({ restAlert: ok });
  };

  const setRestTimer = (on: boolean) => {
    if (!on) restTimer.stop();
    updateSettings({ restTimer: on });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.content}
      testID="settings">
      <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
        {t('settings.workout')}
      </Text>
      <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
        <Row title={t('settings.restTimer')} sub={t('settings.restTimerSub')}>
          <Toggle label={t('settings.restTimer')} value={s.restTimer} onChange={setRestTimer} testID="setting-rest" />
        </Row>
        {s.restTimer ? (
          <>
            <Divider />
            <Row title={t('settings.restLength')}>
              <Stepper
                value={clock(s.restSeconds)}
                onMinus={() => updateSettings({ restSeconds: s.restSeconds - REST_STEP })}
                onPlus={() => updateSettings({ restSeconds: s.restSeconds + REST_STEP })}
                minusLabel={t('settings.restShorter')}
                plusLabel={t('settings.restLonger')}
                testID="setting-rest-length"
              />
            </Row>
            <Divider />
            <Row
              title={t('settings.restAlert')}
              sub={denied ? t('settings.restAlertDenied') : !restAlertAvailable ? t('settings.restAlertWeb') : t('settings.restAlertSub')}>
              <Toggle
                label={t('settings.restAlert')}
                value={s.restAlert}
                onChange={setAlert}
                disabled={!restAlertAvailable}
                testID="setting-rest-alert"
              />
            </Row>
            {denied ? (
              <View style={styles.action}>
                <Button label={t('settings.restAlertOpen')} variant="soft" onPress={openPhoneSettings} testID="open-phone-settings" />
              </View>
            ) : null}
          </>
        ) : null}
        <Divider />
        <Row title={t('settings.haptics')} sub={t('settings.hapticsSub')}>
          <Toggle label={t('settings.haptics')} value={s.haptics} onChange={(v) => updateSettings({ haptics: v })} testID="setting-haptics" />
        </Row>
      </View>

      <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
        {t('settings.weights')}
      </Text>
      <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
        <View style={styles.pad}>
          <SegmentedControl
            values={UNITS.map((u) => t(u === 'kg' ? 'settings.unitKg' : 'settings.unitLb'))}
            selectedIndex={UNITS.indexOf(s.unit)}
            onChange={(e) => updateSettings({ unit: UNITS[e.nativeEvent.selectedSegmentIndex] ?? 'kg' })}
            appearance={scheme}
            accessibilityLabel={t('settings.unitA11y')}
            style={styles.segments}
            testID="setting-unit"
          />
        </View>
        <Divider />
        <Row title={t('settings.showBoth')} sub={t('settings.showBothSub', { other: otherUnit(s.unit) })}>
          <Toggle label={t('settings.showBoth')} value={s.showBoth} onChange={(v) => updateSettings({ showBoth: v })} testID="setting-both" />
        </Row>
        <Divider />
        <Row title={t('settings.defaultReps')} sub={t('settings.defaultRepsSub')}>
          <Stepper
            value={t('settings.repsValue', { n: s.defaultReps })}
            onMinus={() => updateSettings({ defaultReps: s.defaultReps - 1 })}
            onPlus={() => updateSettings({ defaultReps: s.defaultReps + 1 })}
            minusLabel={t('settings.fewerReps')}
            plusLabel={t('settings.moreReps')}
            testID="setting-reps"
          />
        </Row>
      </View>

      <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
        {t('settings.look')}
      </Text>
      <View style={[styles.card, styles.pad, { backgroundColor: c.bgRaised }]}>
        <SegmentedControl
          values={THEMES.map((x) => t(x === 'system' ? 'settings.themeSystem' : x === 'light' ? 'settings.themeLight' : 'settings.themeDark'))}
          selectedIndex={THEMES.indexOf(s.theme)}
          onChange={(e) => updateSettings({ theme: THEMES[e.nativeEvent.selectedSegmentIndex] ?? 'system' })}
          appearance={scheme}
          accessibilityLabel={t('settings.themeA11y')}
          style={styles.segments}
          testID="setting-theme"
        />
      </View>
    </ScrollView>
  );
}

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.row}>
      {/* Hidden from screen readers: each control carries the same words as its own label. */}
      <View style={styles.flex} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {sub ? <Text style={[styles.sub, { color: c.textMuted }]}>{sub}</Text> : null}
      </View>
      {children}
    </View>
  );
}

// React Native's Switch: the platform's own UISwitch / Material switch. Not @expo/ui's Switch,
// because that one takes its accessibility label only as visible SwiftUI text beside it.
function Toggle({ label, value, onChange, disabled, testID }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID: string }) {
  const c = useColors();
  return (
    <View style={styles.toggle}>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: c.accent, false: c.field }}
        testID={testID}
      />
    </View>
  );
}

function Divider() {
  const c = useColors();
  return <View style={[styles.divider, { backgroundColor: c.border }]} />;
}

const styles = StyleSheet.create({
  content: { padding: space.md, paddingBottom: space.xxl, gap: space.sm, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  section: { ...font.section, textTransform: 'uppercase', marginTop: space.sm, paddingHorizontal: space.xs },
  card: { borderRadius: radius.md, overflow: 'hidden' },
  pad: { padding: space.ms },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.ms, paddingHorizontal: space.md, paddingVertical: space.ms, minHeight: size.touch + space.md },
  flex: { flex: 1, gap: space.xxs },
  title: { ...font.body },
  sub: { ...font.caption },
  action: { paddingHorizontal: space.md, paddingBottom: space.ms },
  toggle: { minWidth: size.touch, minHeight: size.touch, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: space.md },
  segments: { minHeight: size.touch },
});
