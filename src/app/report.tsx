import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Body, Button, Card, Chip, H2, Muted, Screen, styles as ui } from '../components/ui';
import { shareReport } from '../services/report';
import { useStore } from '../storage/store';

export default function Report() {
  const { data } = useStore();
  const [months, setMonths] = useState(6);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      await shareReport(data, months);
    } catch (e) {
      Alert.alert('Impossible de générer le rapport', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Card>
        <H2>Rapport PDF</H2>
        <Body>Un résumé clair de vos cycles, durées, symptômes fréquents, alertes et notes, à montrer à votre médecin, gynécologue ou sage-femme.</Body>
        <View style={[ui.chips, { marginTop: 12 }]}>
          {[3, 6, 12].map((m) => <Chip key={m} label={`${m} mois`} selected={months === m} onPress={() => setMonths(m)} />)}
        </View>
        <Button title={busy ? 'Génération…' : 'Générer et partager'} onPress={generate} />
        <Muted>Le PDF est créé sur votre téléphone. Vous choisissez avec qui le partager.</Muted>
      </Card>
    </Screen>
  );
}
