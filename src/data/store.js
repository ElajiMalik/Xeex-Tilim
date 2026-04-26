import { Role } from '../common/roles.js';

export const users = [
  { id: 'u1', email: 'citoyen@snh.sn', mot_de_passe: 'pass123', role: Role.CITOYEN },
  { id: 'u2', email: 'agent@snh.sn', mot_de_passe: 'pass123', role: Role.AGENT },
  { id: 'u3', email: 'chef@snh.sn', mot_de_passe: 'pass123', role: Role.CHEF_BRIGADE },
  { id: 'u4', email: 'admin@snh.sn', mot_de_passe: 'pass123', role: Role.ADMINISTRATEUR },
];

export const signalements = [];
export const medias = [];
