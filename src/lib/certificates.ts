import { CertificateRecord } from '@/types/progress';
import { getItem, setItem } from './storage';

const CERTS_KEY = 'certificates';

export function getCertificates(): CertificateRecord[] {
  return getItem<CertificateRecord[]>(CERTS_KEY, []);
}

export function addCertificate(cert: CertificateRecord): void {
  const certs = getCertificates();
  certs.unshift(cert);
  setItem(CERTS_KEY, certs);
}

export function getCertificatesByJuz(juz: number): CertificateRecord[] {
  return getCertificates().filter(c => c.juz === juz);
}

export function getBestScore(dayNumber: number): number | undefined {
  const certs = getCertificates().filter(c => c.dayNumber === dayNumber);
  if (certs.length === 0) return undefined;
  return Math.max(...certs.map(c => c.score));
}
