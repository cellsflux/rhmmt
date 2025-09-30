import crypto from 'crypto'
import { app } from 'electron'
import os from 'os'

class EncryptionManager {
  private readonly algorithm: string = 'aes-256-gcm'
  private readonly keyLength: number = 32
  private readonly ivLength: number = 16
  private readonly authTagLength: number = 16
  private readonly pbkdf2Iterations: number = 100000

  constructor() {}

  private getSecretKey(): string {
    // Récupérer ou créer une clé persistante
    const keyName = 'app-encryption-key-v1'
    let secretKey = localStorage.getItem(keyName)

    if (!secretKey) {
      // Générer une nouvelle clé si elle n'existe pas
      secretKey = crypto.randomBytes(32).toString('base64')
      localStorage.setItem(keyName, secretKey)
    }

    return secretKey
  }

  private getDerivedKey(): Buffer {
    // Données stables indépendantes de la version
    const stableData = [
      app.getPath('userData'), // Chemin des données utilisateur
      os.homedir(), // Répertoire home
      'my-app-permanent-identifier', // Identifiant permanent de l'app
    ].join('||')

    return crypto.pbkdf2Sync(this.getSecretKey(), stableData, this.pbkdf2Iterations, this.keyLength, 'sha512')
  }

  async encrypt(data: string | object): Promise<string> {
    try {
      const derivedKey = this.getDerivedKey()
      const iv = crypto.randomBytes(this.ivLength)

      const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv)

      const dataToEncrypt = typeof data === 'string' ? data : JSON.stringify(data)
      const encryptedData = Buffer.concat([cipher.update(dataToEncrypt, 'utf8'), cipher.final()])

      const authTag = (cipher as crypto.CipherGCM).getAuthTag()

      // Vérification de la longueur du authTag
      if (authTag.length !== this.authTagLength) {
        throw new Error('Invalid authentication tag length')
      }

      // Structure: Header(8) + IV(16) + AuthTag(16) + Data(variable)
      const resultBuffer = Buffer.concat([
        Buffer.from('APPENCv1'), // Header sans version
        iv,
        authTag,
        encryptedData,
      ])

      return resultBuffer.toString('base64')
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const encryptedBuffer = Buffer.from(encryptedData, 'base64')

      // Vérification de la longueur minimale
      const minLength = 8 + this.ivLength + this.authTagLength
      if (encryptedBuffer.length < minLength) {
        throw new Error('Encrypted data too short')
      }

      // Extraction des composants
      const header = encryptedBuffer.subarray(0, 8).toString()
      if (header !== 'APPENCv1') {
        throw new Error('Invalid encryption format')
      }

      const derivedKey = this.getDerivedKey()
      const iv = encryptedBuffer.subarray(8, 8 + this.ivLength)
      const authTag = encryptedBuffer.subarray(8 + this.ivLength, 8 + this.ivLength + this.authTagLength)
      const data = encryptedBuffer.subarray(8 + this.ivLength + this.authTagLength)

      // Vérification des longueurs
      if (iv.length !== this.ivLength || authTag.length !== this.authTagLength) {
        throw new Error('Invalid IV or authentication tag')
      }

      const decipher = crypto.createDecipheriv(this.algorithm, derivedKey, iv)
      ;(decipher as crypto.DecipherGCM).setAuthTag(authTag)

      const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')

      return decrypted
    } catch (error) {
      if (error.message.includes('Unsupported state or unable to authenticate data')) {
        throw new Error('Decryption failed: Data may have been tampered with or invalid key')
      }
      throw new Error(`Decryption failed: ${error.message}`)
    }
  }

  // Méthode pour chiffrer et parser automatiquement en objet
  async encryptObject(data: object): Promise<string> {
    return this.encrypt(data)
  }

  // Méthode pour déchiffrer et parser automatiquement en objet
  async decryptObject<T = any>(encryptedData: string): Promise<T> {
    const decrypted = await this.decrypt(encryptedData)
    try {
      return JSON.parse(decrypted) as T
    } catch (error) {
      throw new Error('Decrypted data is not valid JSON')
    }
  }

  // Méthode utilitaire pour tester le système
  async testEncryption(): Promise<boolean> {
    try {
      const testData = {
        test: 'encryption_system',
        timestamp: Date.now(),
        random: crypto.randomBytes(8).toString('hex'),
      }

      // Test chiffrement/déchiffrement
      const encrypted = await this.encryptObject(testData)
      const decrypted = await this.decryptObject(encrypted)

      return decrypted.test === testData.test && decrypted.timestamp === testData.timestamp
    } catch (error) {
      console.error('Encryption test failed:', error)
      return false
    }
  }

  // Méthode pour vérifier si des données sont chiffrées par cette app
  isEncryptedByThisApp(data: string): boolean {
    try {
      const buffer = Buffer.from(data, 'base64')
      if (buffer.length < 8) return false

      const header = buffer.subarray(0, 8).toString()
      return header === 'APPENCv1'
    } catch {
      return false
    }
  }

  // Méthode pour changer la clé de chiffrement (migration)
  async changeEncryptionKey(oldData: string): Promise<string> {
    try {
      // Déchiffrer avec l'ancienne clé
      const decrypted = await this.decrypt(oldData)

      // Générer une nouvelle clé
      const newKey = crypto.randomBytes(32).toString('base64')
      localStorage.setItem('app-encryption-key-v1', newKey)

      // Rechiffrer avec la nouvelle clé
      return await this.encrypt(decrypted)
    } catch (error) {
      throw new Error(`Failed to change encryption key: ${error.message}`)
    }
  }
}

export default EncryptionManager
