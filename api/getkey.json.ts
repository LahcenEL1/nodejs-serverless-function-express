import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JWK } from 'node-jose';

async function convertRsaToJwk() {
    const PUBLIC_KEY_PEM = readFileSync(
        join(__dirname, '../publicKey.pem'),
        'utf8'
    );
    try {
        const key = await JWK.asKey(PUBLIC_KEY_PEM, 'pem');
        const jwk = key.toJSON(false);
        jwk.use = 'sig';
        jwk.alg = 'RS256';
        return jwk;
    } catch (error) {
        console.error(
            'Erreur lors de la conversion de la clé RSA en JWK:',
            error
        );
        throw error;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const jwk = await convertRsaToJwk();
        res.status(200).json(jwk);
    } catch (error) {
        console.error('Erreur lors de la récupération de la clé JWK:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
}
