import { v4 as uuid } from 'uuid';
import { medias, signalements } from '../data/store.js';

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export class SignalementsService {
  constructor({ mediaService }) {
    this.mediaService = mediaService;
  }

  async genererReference(tentative = 1) {
    if (tentative > 10) {
      throw new Error('Impossible de générer une référence unique après 10 tentatives.');
    }

    const suffixe = Math.floor(100000 + Math.random() * 900000);
    const reference = `SNH-${new Date().getFullYear()}-${suffixe}`;
    const existe = signalements.some((s) => s.reference === reference);
    return existe ? this.genererReference(tentative + 1) : reference;
  }

  lister(f = {}) {
    const page = Math.max(1, Math.floor(toNumber(f.page, 1)));
    const limite = Math.min(100, Math.max(1, Math.floor(toNumber(f.limite, 20))));
    const skip = (page - 1) * limite;

    let data = [...signalements];

    if (f.statut) data = data.filter((s) => s.statut === f.statut);
    if (f.categorie) data = data.filter((s) => s.categorie === f.categorie);
    if (f.urgence) data = data.filter((s) => s.urgence === f.urgence);

    if (f.recherche) {
      const q = String(f.recherche).toLowerCase();
      data = data.filter((s) =>
        s.titre.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q),
      );
    }

    if (f.lat != null && f.lng != null) {
      const lat = toNumber(f.lat, null);
      const lng = toNumber(f.lng, null);
      const rayon = Math.min(50000, Math.max(1, Math.floor(toNumber(f.rayonMetres, 5000))));
      if (lat == null || lng == null) {
        throw new Error('lat/lng invalides');
      }

      data = data
        .map((s) => {
          if (s.lat == null || s.lng == null) return { ...s, distance_metres: Number.MAX_SAFE_INTEGER };
          const distance = Math.sqrt((s.lat - lat) ** 2 + (s.lng - lng) ** 2) * 111000;
          return { ...s, distance_metres: Math.round(distance) };
        })
        .filter((s) => s.distance_metres <= rayon)
        .sort((a, b) => a.distance_metres - b.distance_metres);
    } else {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return data.slice(skip, skip + limite);
  }

  async creer(dto, auteurId, fichiers = []) {
    const id = uuid();
    const reference = await this.genererReference();

    const created = {
      id,
      reference,
      auteur_id: auteurId,
      titre: dto.titre,
      description: dto.description ?? '',
      statut: 'NOUVEAU',
      categorie: dto.categorie ?? 'A_QUALIFIER',
      urgence: dto.urgence ?? 'MOYENNE',
      lat: dto.lat != null ? Number(dto.lat) : null,
      lng: dto.lng != null ? Number(dto.lng) : null,
      created_at: new Date().toISOString(),
    };

    signalements.push(created);
    await this.mediaService.ajouterMedias(id, fichiers);

    return created;
  }

  getById(id) {
    return signalements.find((s) => s.id === id);
  }

  modifierStatut(id, statut) {
    const s = this.getById(id);
    if (!s) return null;
    s.statut = statut;
    return s;
  }

  assigner(id, agentId) {
    const s = this.getById(id);
    if (!s) return null;
    s.agent_id = agentId;
    return s;
  }

  supprimer(id) {
    const idx = signalements.findIndex((s) => s.id === id);
    if (idx < 0) return false;
    signalements.splice(idx, 1);
    for (let i = medias.length - 1; i >= 0; i--) {
      if (medias[i].signalement_id === id) medias.splice(i, 1);
    }
    return true;
  }

  listerMediasAvecUrls(id) {
    return medias.filter((m) => m.signalement_id === id);
  }
}
