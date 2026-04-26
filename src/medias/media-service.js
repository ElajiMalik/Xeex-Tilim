import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { MEDIA_TYPE_BY_MIME } from '../common/upload-validation.js';
import { medias } from '../data/store.js';

const MAX_BYTES = 10 * 1024 * 1024;

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export class MediaService {
  async ajouterMedias(signalementId, fichiers = []) {
    let ordre = 0;

    for (const fichier of fichiers) {
      const mediaType = MEDIA_TYPE_BY_MIME[fichier.mimetype];
      if (!mediaType) {
        throw new Error(`MIME type non autorisé: ${fichier.mimetype}`);
      }
      if (fichier.size > MAX_BYTES) {
        throw new Error(`Fichier trop volumineux: ${fichier.originalname}`);
      }

      const nomSain = sanitizeFilename(fichier.originalname);
      const cleS3 = `signalements/${signalementId}/${uuid()}-${nomSain}`;

      medias.push({
        id: uuid(),
        signalement_id: signalementId,
        type: mediaType,
        nom_fichier: nomSain,
        cle_s3: cleS3,
        url_publique: null,
        taille_mo: Math.round((fichier.size / (1024 * 1024)) * 100) / 100,
        mime_type: fichier.mimetype,
        ordre: ordre++,
      });
    }
  }

  genererUrlSignee(cleS3, expirationSecondes = 3600) {
    const expireAt = Math.floor(Date.now() / 1000) + expirationSecondes;
    const signature = crypto
      .createHmac('sha256', process.env.SIGNED_URL_SECRET ?? 'dev-signed-url-secret')
      .update(`${cleS3}:${expireAt}`)
      .digest('hex');

    return `https://media.local/${encodeURIComponent(cleS3)}?exp=${expireAt}&sig=${signature}`;
  }
}
