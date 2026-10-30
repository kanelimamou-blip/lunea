import { router } from 'expo-router';
import { Card, H2, Muted, Row, Screen, Title } from '../../components/ui';
import { useStore } from '../../storage/store';

const GOAL_LABEL = { track: 'Suivre mon cycle', conceive: 'Concevoir', avoid: 'Connaître ma fertilité', pregnant: 'Grossesse' };

export default function Profile() {
  const { data } = useStore();
  const s = data.settings;
  return (
    <Screen>
      <Title subtitle="Toutes les fonctionnalités sont incluses">{s.name ?? 'Mon profil'}</Title>
      <Card>
        <H2>Mon suivi</H2>
        <Row label="Objectif et cycle" value={GOAL_LABEL[s.goal]} onPress={() => router.push('/cycle-settings')} />
        <Row label="Mode grossesse" value={s.goal === 'pregnant' ? 'Activé' : '›'} onPress={() => router.push('/pregnancy')} />
        <Row label="Rappels" onPress={() => router.push('/reminders')} />
        <Row label="Rapport pour mon médecin" onPress={() => router.push('/report')} />
      </Card>
      <Card>
        <H2>Données</H2>
        <Row label="Confidentialité et sécurité" value={s.lockEnabled ? 'Verrouillée' : '›'} onPress={() => router.push('/privacy')} />
      </Card>
      <Muted>Lunéa 1.0 · Les informations fournies ne remplacent pas un avis médical.</Muted>
    </Screen>
  );
}
