import express from 'express';
import { loginHandler, authMiddleware, requireRole } from './auth/auth.js';
import { Role } from './common/roles.js';
import { upload } from './common/upload-validation.js';
import { MediaService } from './medias/media-service.js';
import { SignalementsService } from './signalements/signalements-service.js';
import { getAnthropicClient } from './ai/anthropic-provider.js';

const app = express();
app.use(express.json());

const mediaService = new MediaService();
const signalementsService = new SignalementsService({ mediaService });
const anthropic = getAnthropicClient();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'xeex-tilim-backend' });
});

app.post('/auth/login', loginHandler);

app.use(authMiddleware);

app.post('/signalements', requireRole(Role.CITOYEN), upload.array('fichiers', 5), async (req, res) => {
  try {
    const created = await signalementsService.creer(req.body, req.user.sub, req.files ?? []);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/signalements', requireRole(Role.CITOYEN), (req, res) => {
  try {
    const data = signalementsService.lister(req.query);
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/signalements/:id', requireRole(Role.CITOYEN), (req, res) => {
  const item = signalementsService.getById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Signalement introuvable.' });
  return res.json(item);
});

app.patch('/signalements/:id/statut', requireRole(Role.AGENT), (req, res) => {
  const item = signalementsService.modifierStatut(req.params.id, req.body.statut ?? 'EN_COURS');
  if (!item) return res.status(404).json({ message: 'Signalement introuvable.' });
  return res.json(item);
});

app.patch('/signalements/:id/assigner', requireRole(Role.CHEF_BRIGADE), (req, res) => {
  const item = signalementsService.assigner(req.params.id, req.body.agent_id);
  if (!item) return res.status(404).json({ message: 'Signalement introuvable.' });
  return res.json(item);
});

app.delete('/signalements/:id', requireRole(Role.ADMINISTRATEUR), (req, res) => {
  const deleted = signalementsService.supprimer(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Signalement introuvable.' });
  return res.status(204).send();
});

app.get('/signalements/:id/medias', requireRole(Role.CITOYEN), (req, res) => {
  const medias = signalementsService.listerMediasAvecUrls(req.params.id).map((m) => ({
    ...m,
    url_signee: mediaService.genererUrlSignee(m.cle_s3),
  }));
  return res.json(medias);
});

app.post('/signalements/:id/qualification', requireRole(Role.AGENT), async (req, res) => {
  const item = signalementsService.getById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Signalement introuvable.' });

  const rep = await anthropic.qualify(`${item.titre}\n${item.description}`);
  return res.json(rep);
});

app.use((err, req, res, next) => {
  if (err?.message?.includes('File too large')) {
    return res.status(400).json({ message: 'Fichier trop volumineux (max 10 Mo).' });
  }
  return res.status(400).json({ message: err.message ?? 'Erreur inconnue.' });
});

const port = Number(process.env.PORT ?? 3000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Xeex-Tilim API running on :${port}`);
  });
}

export default app;
