import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getOrcamentos, Orcamento } from '../database/database';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type HistoricoNavigationProp = StackNavigationProp<RootStackParamList, 'Historico'>;

const Historico = () => {
  const navigation = useNavigation<HistoricoNavigationProp>();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrcamentos = useCallback(async () => {
    setIsLoading(true);
    
    try {
      getOrcamentos((data: Orcamento[]) => {
        
        // Ordenar por ID decrescente (mais recentes primeiro)
        const sortedData = data.sort((a, b) => {
          const idA = a.id || 0;
          const idB = b.id || 0;
          return idB - idA;
        });
        
        setOrcamentos(sortedData);
        setFilteredOrcamentos(sortedData);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      setIsLoading(false);
    }
  }, []);

  // Usar useFocusEffect para atualizar sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      fetchOrcamentos();
    }, [fetchOrcamentos])
  );

  // Atualizar lista quando o componente montar
  useEffect(() => {
    fetchOrcamentos();
  }, [fetchOrcamentos]);

  // Filtrar orçamentos quando o texto de busca mudar
  useEffect(() => {
    if (searchText === '') {
      setFilteredOrcamentos(orcamentos);
    } else {
      const filtered = orcamentos.filter(orcamento =>
        orcamento.cliente.toLowerCase().includes(searchText.toLowerCase()) ||
        orcamento.data.includes(searchText) ||
        (orcamento.observacao && orcamento.observacao.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredOrcamentos(filtered);
    }
  }, [searchText, orcamentos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrcamentos();
    setRefreshing(false);
  }, [fetchOrcamentos]);

  const renderItem = ({ item }: { item: Orcamento }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate('OrcamentoView', { orcamento: item });
      }}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemCliente}>{item.cliente}</Text>
        <Text style={styles.itemValor}>R$ {Number(item.valor_proposta).toFixed(2).replace('.', ',')}</Text>
      </View>
      <Text style={styles.itemData}>{item.data}</Text>
      {item.observacao && (
        <View style={styles.observacaoContainer}>
          <Ionicons name="information-circle" size={16} color="#555" />
          <Text style={styles.itemObservacao}>{item.observacao}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={50} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchText ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado'}
      </Text>
      {!searchText && (
        <TouchableOpacity 
          style={styles.addFirstButton}
          onPress={() => navigation.navigate('OrcamentoForm', {})}
        >
          <Ionicons name="add-circle-outline" size={24} color="#3498db" />
          <Text style={styles.addFirstButtonText}>Criar primeiro orçamento</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, data ou observação..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.totalText}>
          {filteredOrcamentos.length === 0 ? 'Nenhum' : filteredOrcamentos.length} orçamento{filteredOrcamentos.length !== 1 ? 's' : ''}
          {searchText && ` encontrado${filteredOrcamentos.length !== 1 ? 's' : ''}`}
        </Text>
        <TouchableOpacity onPress={fetchOrcamentos} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrcamentos}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={[
          styles.listContent,
          filteredOrcamentos.length === 0 && { flex: 1 }
        ]}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  searchIcon: {
    marginRight: 12,
    color: '#5a6c7d',
  },
  searchInput: {
    flex: 1,
    height: 54,
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 8,
  },
  totalText: {
    color: '#5a6c7d',
    fontSize: 15,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fbff',
  },
  listContent: {
    paddingBottom: 30,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    paddingRight: 50,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 25,
  },
  itemCliente: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2c3e50',
    flex: 1,
    letterSpacing: 0.3,
  },
  itemValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 15,
    letterSpacing: 0.5,
  },
  itemData: {
    color: '#5a6c7d',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  observacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f8fafb',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  itemObservacao: {
    marginLeft: 8,
    fontStyle: 'italic',
    color: '#5a6c7d',
    fontSize: 14,
    flex: 1,
  },
  arrowIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
    backgroundColor: '#f8fbff',
    borderRadius: 15,
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#5a6c7d',
    marginBottom: 30,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    elevation: 2,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  addFirstButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default Historico;