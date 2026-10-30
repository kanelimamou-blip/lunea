import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Muted, Screen } from '../../components/ui';
import { ARTICLES } from '../../content/articles';
import { colors } from '../../theme';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = ARTICLES.find((x) => x.id === id);
  if (!a) return <Screen><Muted>Article introuvable.</Muted></Screen>;
  return (
    <Screen>
      <Text style={s.cat}>{a.category.toUpperCase()} · {a.minutes} MIN</Text>
      <Text style={s.title}>{a.title}</Text>
      {a.body.map((p, i) => <Text key={i} style={s.p}>{p}</Text>)}
      <Muted>Ces informations sont générales et ne remplacent pas l'avis d'un professionnel de santé.</Muted>
    </Screen>
  );
}

const s = StyleSheet.create({
  cat: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginVertical: 12 },
  p: { fontSize: 16, lineHeight: 25, color: colors.text, marginBottom: 14 },
});
