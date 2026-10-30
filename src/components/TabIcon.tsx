import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabIconName = 'today' | 'calendar' | 'insights' | 'health' | 'profile';

export function TabIcon({ name, color, size = 24 }: { name: TabIconName; color: ColorValue; size?: number }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' && (<><Circle cx={12} cy={12} r={9} {...p} /><Circle cx={12} cy={3} r={2.2} fill={color} /></>)}
      {name === 'calendar' && (<><Rect x={3} y={5} width={18} height={16} rx={3} {...p} /><Path d="M3 10h18M8 3v4M16 3v4" {...p} /></>)}
      {name === 'insights' && <Path d="M5 20V12M12 20V5M19 20v-9" {...p} />}
      {name === 'health' && <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" {...p} />}
      {name === 'profile' && (<><Circle cx={12} cy={8} r={4} {...p} /><Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...p} /></>)}
    </Svg>
  );
}
