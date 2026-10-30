import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, Muted, Screen, Title, styles as ui } from '../../components/ui';
import { ARTICLES, type Article } from '../../content/articles';
import { colors } from '../../theme';

const CATEGORIES: (Article['category'] | 'Tout')[] = ['Tout', 'Cycle', 'Fertilité', 'Grossesse', 'Bien-être', 'Santé'];

export default function Library() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('Tout');
  const list = ARTICLES.filter((a) => cat === 'Tout' || a.category === cat);
  return (
    <Screen>
      <Title subtitle="Des repères fiables, sans jargon">Santé</Title>
      <View style={ui.chips}>
        {CATEGORIES.map((c) => <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />)}
      </View>
      {list.map((a) => (
        <Pressable key={a.id} onPress={() => router.push(`/article/${a.id}`)}>
          <Card>
            <Text style={s.cat}>{a.category.toUpperCase()}</Text>
            <Text style={s.title}>{a.title}</Text>
            <Muted>{a.minutes} min de lecture</Muted>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  cat: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginVertical: 4 },
});
