import { RouteProp } from '@react-navigation/native';
import { Orcamento, Servico } from './database/database';

export type RootStackParamList = {
  Historico: undefined;
  OrcamentoForm: { orcamentoId?: number };
  OrcamentoView: { orcamento: Orcamento };
};

export type OrcamentoViewRouteProp = RouteProp<RootStackParamList, 'OrcamentoView'>;
export type OrcamentoFormRouteProp = RouteProp<RootStackParamList, 'OrcamentoForm'>;
export type HistoricoRouteProp = RouteProp<RootStackParamList, 'Historico'>;