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
          onPress={() => navigation.navigate('OrcamentoForm' as never)}
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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  totalText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  refreshButton: {
    padding: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingRight: 40,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingRight: 20,
  },
  itemCliente: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  itemValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 10,
  },
  itemData: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 5,
  },
  observacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  itemObservacao: {
    marginLeft: 5,
    fontStyle: 'italic',
    color: '#555',
    fontSize: 14,
  },
  arrowIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  addFirstButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Historico;