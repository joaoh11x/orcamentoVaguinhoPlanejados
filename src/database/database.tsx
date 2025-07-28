import * as SQLite from 'expo-sqlite';

export interface Servico {
  un: string;
  especificacoes: string;
  valor: string | number;
}

export interface Orcamento {
  id?: number;
  data: string;
  cliente: string;
  validade: string;
  observacao: string;
  valor_proposta: number;
  servicos: Servico[];
  dataExtenso?: string;
  created_at?: string;
}

interface OrcamentoRaw {
  id: number;
  data: string;
  cliente: string;
  validade: string;
  observacao: string;
  valor_proposta: number;
  servicos: string;
  dataExtenso: string;
  created_at: string;
}

const db = SQLite.openDatabaseSync('orcamentos.db');

export const initializeDatabase = () => {
  try {
    // Criar a tabela se não existir
    db.execSync(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT,
        cliente TEXT,
        validade TEXT,
        observacao TEXT,
        valor_proposta REAL,
        servicos TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar a coluna dataExtenso se não existir
    try {
      db.execSync(`
        ALTER TABLE orcamentos ADD COLUMN dataExtenso TEXT DEFAULT '';
      `);
      console.log('Coluna dataExtenso adicionada com sucesso');
    } catch (alterError) {
      // Ignorar erro se a coluna já existe
      console.log('Coluna dataExtenso já existe ou não pôde ser adicionada:', alterError);
    }

    console.log('Tabela criada e/ou atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao criar/atualizar tabela', error);
  }
};

export const saveOrcamento = (
  orcamento: Omit<Orcamento, 'id' | 'created_at'>,
  callback: (id: number | null) => void
) => {
  const { data, cliente, validade, observacao, valor_proposta, servicos, dataExtenso } = orcamento;

  try {
    const result = db.runSync(
      `INSERT INTO orcamentos 
        (data, cliente, validade, observacao, valor_proposta, servicos, dataExtenso) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data,
        cliente,
        validade,
        observacao || '',
        valor_proposta,
        JSON.stringify(servicos),
        dataExtenso || '',
      ]
    );
    
    const insertId = result.lastInsertRowId;
    if (insertId && insertId > 0) {
      callback(insertId);
    } else {
      console.error('Erro: ID não retornado após inserção');
      callback(null);
    }
  } catch (error) {
    console.error('Erro ao salvar orçamento', error);
    callback(null);
  }
};

export const getOrcamentos = (callback: (data: Orcamento[]) => void) => {
  try {
    const result = db.getAllSync(`SELECT * FROM orcamentos ORDER BY created_at DESC`) as OrcamentoRaw[];
    const data: Orcamento[] = result.map((item) => ({
      id: item.id,
      data: item.data,
      cliente: item.cliente,
      validade: item.validade,
      observacao: item.observacao,
      valor_proposta: item.valor_proposta,
      servicos: JSON.parse(item.servicos),
      dataExtenso: item.dataExtenso || '', // Garantir compatibilidade com tabelas antigas
      created_at: item.created_at,
    }));
    callback(data);
  } catch (error) {
    console.error('Erro ao buscar orçamentos', error);
    callback([]);
  }
};

export const getOrcamentoById = (id: number, callback: (data: Orcamento | null) => void) => {
  try {
    const result = db.getFirstSync(`SELECT * FROM orcamentos WHERE id = ?`, [id]) as OrcamentoRaw | null;
    if (result) {
      const orcamento: Orcamento = {
        id: result.id,
        data: result.data,
        cliente: result.cliente,
        validade: result.validade,
        observacao: result.observacao,
        valor_proposta: result.valor_proposta,
        servicos: JSON.parse(result.servicos),
        dataExtenso: result.dataExtenso || '', // Garantir compatibilidade com tabelas antigas
        created_at: result.created_at,
      };
      callback(orcamento);
    } else {
      callback(null);
    }
  } catch (error) {
    console.error('Erro ao buscar orçamento por ID', error);
    callback(null);
  }
};

export const updateOrcamento = (
  id: number,
  orcamento: Omit<Orcamento, 'id' | 'created_at'>,
  callback: (success: boolean) => void
) => {
  const { data, cliente, validade, observacao, valor_proposta, servicos, dataExtenso } = orcamento;

  try {
    const result = db.runSync(
      `UPDATE orcamentos SET 
        data = ?, cliente = ?, validade = ?, observacao = ?, valor_proposta = ?, servicos = ?, dataExtenso = ?
        WHERE id = ?`,
      [
        data,
        cliente,
        validade,
        observacao || '',
        valor_proposta,
        JSON.stringify(servicos),
        dataExtenso || '',
        id,
      ]
    );
    callback(result.changes > 0);
  } catch (error) {
    console.error('Erro ao atualizar orçamento', error);
    callback(false);
  }
};

export const deleteOrcamento = (id: number, callback: (success: boolean) => void) => {
  try {
    const result = db.runSync(`DELETE FROM orcamentos WHERE id = ?`, [id]);
    callback(result.changes > 0);
  } catch (error) {
    console.error('Erro ao deletar orçamento', error);
    callback(false);
  }
};