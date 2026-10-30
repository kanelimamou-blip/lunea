import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { Body, Button, Card, H2, Muted, Screen, ToggleRow } from '../components/ui';
import { exportJson } from '../services/report';
import { useStore } from '../storage/store';

export default function Privacy() {
  const { data, updateSettings, wipe } = useStore();

  const toggleLock = async (on: boolean) => {
    if (on) {
      const ok = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
      if (!ok) {
        Alert.alert('Indisponible', 'Configurez Face ID, Touch ID, une empreinte ou un code sur votre téléphone pour activer le verrouillage.');
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Activer le verrouillage' });
      if (!res.success) return;
    }
    updateSettings({ lockEnabled: on });
  };

  const confirmWipe = () =>
    Alert.alert('Tout effacer ?', 'Toutes vos données et la clé de chiffrement seront supprimées définitivement de ce téléphone.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: () => wipe().then(() => router.replace('/onboarding')) },
    ]);

  return (
    <Screen>
      <Card>
        <H2>Vos données vous appartiennent</H2>
        <Body>• Aucune inscription, aucun compte, aucun serveur : tout est stocké sur ce téléphone.</Body>
        <Body>• Les données sont chiffrées (XSalsa20-Poly1305) avec une clé gardée dans le coffre sécurisé du téléphone et exclue des sauvegardes.</Body>
        <Body>• Pas de publicité, pas de traceurs, aucune donnée revendue ou partagée.</Body>
        <Body>• Les rappels sont calculés et programmés sur l'appareil.</Body>
      </Card>
      <Card>
        <ToggleRow label="Verrouiller l'application" hint="Face ID, empreinte ou code à chaque ouverture" value={data.settings.lockEnabled} onChange={toggleLock} />
      </Card>
      <Card>
        <H2>Export</H2>
        <Muted>Fichier JSON lisible, pour garder une copie ou changer d'application. Attention : ce fichier n'est pas chiffré.</Muted>
        <Button title="Exporter mes données" variant="ghost" onPress={() => exportJson(data)} />
      </Card>
      <Button title="Effacer toutes mes données" variant="danger" onPress={confirmWipe} />
    </Screen>
  );
}
