import { db } from '../../index'

interface Adresse {
  ville?: string
  commune?: string
  quartier?: string
  avenue?: string
  numero?: string
}

interface PersonneUrgence {
  nom: string
  prenom?: string
  telephone: string
  relationShip: string
}

interface PieceIdentite {
  carteType: 'cartedelecteur' | 'pasport' | 'autre'
  numero: string
  nomdedelacarte?: string
}

interface Habillement {
  booteTaille?: string
  tshartTaille?: string
}

interface Banque {
  nom?: string
  numeroCompte?: string
}

interface Salaire {
  montant: number
  type: 'jouranlier' | 'mensuelle' | 'trimestrielle' | 'annuelle'
}

interface Poste {
  id?: number
  name?: string
}

interface Departement {
  id?: number
  name?: string
}

export interface Agent {
  id?: number
  matricule?: string
  nom: string
  postnom: string
  prenom: string
  genre: string
  email?: string
  telephone: string
  devise?: 'CDF' | 'USD'
  habillement?: Habillement
  banque?: Banque
  brithday?: string
  brithplace?: string
  adresse?: Adresse
  pere?: string
  mere?: string
  personneUrgence?: PersonneUrgence
  etatcivil: 'marie' | 'celibataire' | 'divorcee' | 'veuf'
  nationalite: string
  carteIdentite?: PieceIdentite[]
  nomduconjoint?: string
  nombre_enfants?: number
  enfants?: { nom: string; postnom: string; prenom: string; brithday: string; brithplace: string; gendre: 'M' | 'F' }[]
  typeContrat?: 'cdd' | 'cdi' | 'durrere'
  dateDebutContrat?: string
  dateFinContrat?: string
  poste_ocuper?: Poste
  periode_essai: string
  saleaire?: Salaire
  departement: Departement
  nuvieau_etudes: 'diplome' | 'gradue' | 'brevet' | 'licence' | 'autre'
  anne_experience: number

  //cncss
  cncss?: string //numero caisse de securite sociale
  nif?: string //numero identification fiscale

  image?: string //base 64 image
  signature?: string //base 64 image
  cardIdentiteImage?: string //base 64 image
}

db.prepare(
  `CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT,
    nom TEXT NOT NULL,
    postnom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    genre TEXT NOT NULL,
    email TEXT,
    telephone TEXT NOT NULL,
    devise TEXT,
    habillement TEXT,
    banque TEXT,
    brithday TEXT,
    brithplace TEXT,
    adresse TEXT,
    pere TEXT,
    mere TEXT,
    personneUrgence TEXT,
    etatcivil TEXT NOT NULL,
    nationalite TEXT NOT NULL,
    carteIdentite TEXT,
    nomduconjoint TEXT,
    nombre_enfants INTEGER,
    enfants TEXT,
    typeContrat TEXT,
    dateDebutContrat TEXT,
    dateFinContrat TEXT,
    poste_ocuper TEXT,
    periode_essai TEXT NOT NULL,
    saleaire TEXT,
    departement TEXT NOT NULL,
    nuvieau_etudes TEXT NOT NULL,
    anne_experience INTEGER NOT NULL,
    cncss TEXT,
    nif TEXT,
    image TEXT,
    signature TEXT,
    cardIdentiteImage TEXT
  )`
).run()

export const AgentModel = {
  create: (data: Agent): Agent => {
    const stmt = db.prepare(
      `INSERT INTO agents (
        matricule, nom, postnom, prenom, genre, email, telephone, devise,
        habillement, banque, brithday, brithplace, adresse, pere, mere,
        personneUrgence, etatcivil, nationalite, carteIdentite, nomduconjoint,
        nombre_enfants, enfants, typeContrat, dateDebutContrat, dateFinContrat, poste_ocuper,
        periode_essai, saleaire, departement, nuvieau_etudes, anne_experience, cncss, nif,
        image, signature, cardIdentiteImage 
      ) VALUES (
        @matricule, @nom, @postnom, @prenom, @genre, @email, @telephone, @devise,
        @habillement, @banque, @brithday, @brithplace, @adresse, @pere, @mere,
        @personneUrgence, @etatcivil, @nationalite, @carteIdentite, @nomduconjoint,
        @nombre_enfants, @enfants, @typeContrat, @dateDebutContrat, @dateFinContrat, @poste_ocuper,
        @periode_essai, @saleaire, @departement, @nuvieau_etudes, @anne_experience, @cncss, @nif,
        @image, @signature, @cardIdentiteImage
      )`
    )

    const params = {
      matricule: data.matricule || null,
      nom: data.nom,
      postnom: data.postnom,
      prenom: data.prenom,
      genre: data.genre,
      email: data.email || null,
      telephone: data.telephone,
      devise: data.devise || null,
      habillement: data.habillement ? JSON.stringify(data.habillement) : null,
      banque: data.banque ? JSON.stringify(data.banque) : null,
      brithday: data.brithday || null,
      brithplace: data.brithplace || null,
      adresse: data.adresse ? JSON.stringify(data.adresse) : null,
      pere: data.pere || null,
      mere: data.mere || null,
      personneUrgence: data.personneUrgence ? JSON.stringify(data.personneUrgence) : null,
      etatcivil: data.etatcivil,
      nationalite: data.nationalite,
      carteIdentite: data.carteIdentite ? JSON.stringify(data.carteIdentite) : null,
      nomduconjoint: data.nomduconjoint || null,
      nombre_enfants: data.nombre_enfants || null,
      enfants: data.enfants ? JSON.stringify(data.enfants) : null,
      typeContrat: data.typeContrat || null,
      dateDebutContrat: data.dateDebutContrat || null,
      dateFinContrat: data.dateFinContrat || null,
      poste_ocuper: data.poste_ocuper ? JSON.stringify(data.poste_ocuper) : null,
      periode_essai: data.periode_essai,
      saleaire: data.saleaire ? JSON.stringify(data.saleaire) : null,
      departement: data.departement ? JSON.stringify(data.departement) : null,
      nuvieau_etudes: data.nuvieau_etudes,
      anne_experience: data.anne_experience,
      cncss: data.cncss || null,
      nif: data.nif || null,
      image: data.image || null,
      signature: data.signature || null,
      cardIdentiteImage: data.cardIdentiteImage || null,
    }

    const result = stmt.run(params)
    return { ...data, id: Number(result.lastInsertRowid) }
  },

  createMany: (agents: Agent[]): Agent[] => {
    const stmt = db.prepare(
      `INSERT INTO agents (
        matricule, nom, postnom, prenom, genre, email, telephone, devise,
        habillement, banque, brithday, brithplace, adresse, pere, mere,
        personneUrgence, etatcivil, nationalite, carteIdentite, nomduconjoint,
        nombre_enfants, enfants, typeContrat, dateDebutContrat, dateFinContrat, poste_ocuper,
        periode_essai, saleaire, departement, nuvieau_etudes, anne_experience, cncss, nif,
        image, signature, cardIdentiteImage
      ) VALUES (
        @matricule, @nom, @postnom, @prenom, @genre, @email, @telephone, @devise,
        @habillement, @banque, @brithday, @brithplace, @adresse, @pere, @mere,
        @personneUrgence, @etatcivil, @nationalite, @carteIdentite, @nomduconjoint,
        @nombre_enfants, @enfants, @typeContrat, @dateDebutContrat, @dateFinContrat, @poste_ocuper,
        @periode_essai, @saleaire, @departement, @nuvieau_etudes, @anne_experience, @cncss, @nif,
        @image, @signature, @cardIdentiteImage
      )`
    )

    const insertMany = db.transaction((agents: Agent[]) => {
      return agents.map((data) => {
        // Préparer les paramètres avec des valeurs par défaut pour chaque agent
        const params = {
          matricule: data.matricule || null,
          nom: data.nom,
          postnom: data.postnom,
          prenom: data.prenom,
          genre: data.genre,
          email: data.email || null,
          telephone: data.telephone,
          devise: data.devise || null,
          habillement: data.habillement ? JSON.stringify(data.habillement) : null,
          banque: data.banque ? JSON.stringify(data.banque) : null,
          brithday: data.brithday || null,
          brithplace: data.brithplace || null,
          adresse: data.adresse ? JSON.stringify(data.adresse) : null,
          pere: data.pere || null,
          mere: data.mere || null,
          personneUrgence: data.personneUrgence ? JSON.stringify(data.personneUrgence) : null,
          etatcivil: data.etatcivil,
          nationalite: data.nationalite,
          carteIdentite: data.carteIdentite ? JSON.stringify(data.carteIdentite) : null,
          nomduconjoint: data.nomduconjoint || null,
          nombre_enfants: data.nombre_enfants || null,
          enfants: data.enfants ? JSON.stringify(data.enfants) : null,
          typeContrat: data.typeContrat || null,
          dateDebutContrat: data.dateDebutContrat || null,
          dateFinContrat: data.dateFinContrat || null,
          poste_ocuper: data.poste_ocuper ? JSON.stringify(data.poste_ocuper) : null,
          periode_essai: data.periode_essai,
          saleaire: data.saleaire ? JSON.stringify(data.saleaire) : null,
          departement: data.departement ? JSON.stringify(data.departement) : null,
          nuvieau_etudes: data.nuvieau_etudes,
          anne_experience: data.anne_experience,
          cncss: data.cncss || null,
          nif: data.nif || null,
          image: data.image || null,
          signature: data.signature || null,
          cardIdentiteImage: data.cardIdentiteImage || null,
        }

        const result = stmt.run(params)
        return { ...data, id: Number(result.lastInsertRowid) }
      })
    })

    return insertMany(agents)
  },

  getById: (id: number): Agent | undefined => {
    const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id)
    if (!row) return undefined

    return {
      ...row,
      habillement: row.habillement ? JSON.parse(row.habillement) : undefined,
      banque: row.banque ? JSON.parse(row.banque) : undefined,
      adresse: row.adresse ? JSON.parse(row.adresse) : undefined,
      personneUrgence: row.personneUrgence ? JSON.parse(row.personneUrgence) : undefined,
      carteIdentite: row.carteIdentite ? JSON.parse(row.carteIdentite) : undefined,
      enfants: row.enfants ? JSON.parse(row.enfants) : undefined,
      poste_ocuper: row.poste_ocuper ? JSON.parse(row.poste_ocuper) : undefined,
      saleaire: row.saleaire ? JSON.parse(row.saleaire) : undefined,
      departement: row.departement ? JSON.parse(row.departement) : undefined,
    }
  },

  getAll: (): Agent[] => {
    const rows = db.prepare('SELECT * FROM agents').all()
    return rows.map((row) => ({
      ...row,
      habillement: row.habillement ? JSON.parse(row.habillement) : undefined,
      banque: row.banque ? JSON.parse(row.banque) : undefined,
      adresse: row.adresse ? JSON.parse(row.adresse) : undefined,
      personneUrgence: row.personneUrgence ? JSON.parse(row.personneUrgence) : undefined,
      carteIdentite: row.carteIdentite ? JSON.parse(row.carteIdentite) : undefined,
      enfants: row.enfants ? JSON.parse(row.enfants) : undefined,
      poste_ocuper: row.poste_ocuper ? JSON.parse(row.poste_ocuper) : undefined,
      saleaire: row.saleaire ? JSON.parse(row.saleaire) : undefined,
      departement: row.departement ? JSON.parse(row.departement) : undefined,
    }))
  },

  update: (id: number, data: Partial<Agent>): void => {
    const fields = Object.keys(data)
      .map((key) => `${key} = @${key}`)
      .join(', ')

    if (!fields) return

    db.prepare(`UPDATE agents SET ${fields} WHERE id = @id`).run({
      id,
      ...data,
      habillement: data.habillement ? JSON.stringify(data.habillement) : null,
      banque: data.banque ? JSON.stringify(data.banque) : null,
      adresse: data.adresse ? JSON.stringify(data.adresse) : null,
      personneUrgence: data.personneUrgence ? JSON.stringify(data.personneUrgence) : null,
      carteIdentite: data.carteIdentite ? JSON.stringify(data.carteIdentite) : null,
      enfants: data.enfants ? JSON.stringify(data.enfants) : null,
      poste_ocuper: data.poste_ocuper ? JSON.stringify(data.poste_ocuper) : null,
      saleaire: data.saleaire ? JSON.stringify(data.saleaire) : null,
      departement: data.departement ? JSON.stringify(data.departement) : null,
    })
  },

  delete: (id: number): void => {
    db.prepare('DELETE FROM agents WHERE id = ?').run(id)
  },

  search: (query: Partial<Agent>): Agent[] => {
    let sql = 'SELECT * FROM agents WHERE 1=1'
    const params: Record<string, unknown> = {}

    if (query.nom) {
      sql += ' AND nom LIKE @nom'
      params.nom = `%${query.nom}%`
    }
    if (query.postnom) {
      sql += ' AND postnom LIKE @postnom'
      params.postnom = `%${query.postnom}%`
    }
    if (query.prenom) {
      sql += ' AND prenom LIKE @prenom'
      params.prenom = `%${query.prenom}%`
    }
    if (query.genre) {
      sql += ' AND genre = @genre'
      params.genre = query.genre
    }
    if (query.email) {
      sql += ' AND email LIKE @email'
      params.email = `%${query.email}%`
    }
    if (query.telephone) {
      sql += ' AND telephone LIKE @telephone'
      params.telephone = `%${query.telephone}%`
    }
    if (query.etatcivil) {
      sql += ' AND etatcivil = @etatcivil'
      params.etatcivil = query.etatcivil
    }
    if (query.nationalite) {
      sql += ' AND nationalite LIKE @nationalite'
      params.nationalite = `%${query.nationalite}%`
    }
    if (query.nuvieau_etudes) {
      sql += ' AND nuvieau_etudes = @nuvieau_etudes'
      params.nuvieau_etudes = query.nuvieau_etudes
    }
    if (query.typeContrat) {
      sql += ' AND typeContrat = @typeContrat'
      params.typeContrat = query.typeContrat
    }

    const rows = db.prepare(sql).all(params)
    return rows.map((row) => ({
      ...row,
      habillement: row.habillement ? JSON.parse(row.habillement) : undefined,
      banque: row.banque ? JSON.parse(row.banque) : undefined,
      adresse: row.adresse ? JSON.parse(row.adresse) : undefined,
      personneUrgence: row.personneUrgence ? JSON.parse(row.personneUrgence) : undefined,
      carteIdentite: row.carteIdentite ? JSON.parse(row.carteIdentite) : undefined,
      enfants: row.enfants ? JSON.parse(row.enfants) : undefined,
      poste_ocuper: row.poste_ocuper ? JSON.parse(row.poste_ocuper) : undefined,
      saleaire: row.saleaire ? JSON.parse(row.saleaire) : undefined,
      departement: row.departement ? JSON.parse(row.departement) : undefined,
    }))
  },
}
