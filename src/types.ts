import { RouteProp } from '@react-navigation/native';
import { Orcamento, Servico } from './database/database';

export type RootStackParamList = {
  OrcamentoForm: { orcamentoId?: number };
  OrcamentoView: { orcamento: Orcamento };
  Historico: undefined;
};

export type HomeTabParamList = {
  HomeStack: undefined;
  HistoricoStack: undefined;
};

export type RootTabParamList = {
  Início: undefined;
  Histórico: undefined;
};

// Adicione esta definição para os parâmetros de navegação aninhada
export type NestedNavigatorParams = {
  HistoricoStack: { screen: keyof RootStackParamList };
};

export type OrcamentoViewRouteProp = RouteProp<RootStackParamList, 'OrcamentoView'>;
export type OrcamentoFormRouteProp = RouteProp<RootStackParamList, 'OrcamentoForm'>;
export type HistoricoRouteProp = RouteProp<RootStackParamList, 'Historico'>;