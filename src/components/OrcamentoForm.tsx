import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveOrcamento, updateOrcamento, getOrcamentoById, Orcamento, Servico } from '../database/database';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, OrcamentoFormRouteProp } from '../types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type OrcamentoFormNavigationProp = StackNavigationProp<RootStackParamList, 'OrcamentoForm'>;

const OrcamentoForm = () => {
  const navigation = useNavigation<OrcamentoFormNavigationProp>();
  const route = useRoute<OrcamentoFormRouteProp>(); // Use OrcamentoFormRouteProp
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [data, setData] = useState<Date | null>(null);
  const [showDataPicker, setShowDataPicker] = useState(false);
  const [validade, setValidade] = useState<Date | null>(null);
  const [showValidadePicker, setShowValidadePicker] = useState(false);
  const [cliente, setCliente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [valorProposta, setValorProposta] = useState(0);
  const [servicos, setServicos] = useState<Servico[]>([{ un: '', especificacoes: '', valor: '' }]);

  // Access route params safely
  const { orcamentoId } = route.params || {};

  useEffect(() => {
    if (orcamentoId) {
      setIsEditing(true);
      setCurrentId(orcamentoId);
      getOrcamentoById(orcamentoId, (orcamento: Orcamento | null) => {
        if (orcamento) {
          setData(orcamento.data ? new Date(orcamento.data.split('/').reverse().join('-')) : null);
          setCliente(orcamento.cliente);
          setValidade(orcamento.validade ? new Date(orcamento.validade.split('/').reverse().join('-')) : null);
          setObservacao(orcamento.observacao || '');
          setValorProposta(orcamento.valor_proposta);
          setServicos(orcamento.servicos);
        } else {
          Alert.alert('Erro', 'Orçamento não encontrado');
          navigation.goBack();
        }
      });
    }
  }, [orcamentoId, navigation]);

  const adicionarServico = () => {
    setServicos([...servicos, { un: '', especificacoes: '', valor: '' }]);
  };

  const removerServico = (index: number) => {
    if (servicos.length > 1) {
      const novosServicos = [...servicos];
      novosServicos.splice(index, 1);
      setServicos(novosServicos);
      atualizarTotal();
    }
  };

  const atualizarServico = (index: number, campo: keyof Servico, valor: string) => {
    const novosServicos = [...servicos];
    novosServicos[index] = {
      ...novosServicos[index],
      [campo]: campo === 'valor' ? valor.replace(',', '.') : valor,
    };
    setServicos(novosServicos);

    if (campo === 'valor') {
      atualizarTotal();
    }
  };

  const atualizarTotal = () => {
    const total = servicos.reduce((sum, servico) => {
      return sum + (parseFloat(servico.valor as string) || 0);
    }, 0);
    setValorProposta(total);
  };

  const formatarData = (date: Date | null) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatarDataExtenso = (date: Date | null) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.getMonth();
    const year = date.getFullYear();
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    return `${day} de ${meses[month]} de ${year}`;
  };

  const onChangeData = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || data;
    setShowDataPicker(Platform.OS === 'ios');
    setData(currentDate);
  };

  const onChangeValidade = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || validade;
    setShowValidadePicker(Platform.OS === 'ios');
    setValidade(currentDate);
  };

  const clearFields = () => {
    setData(null);
    setCliente('');
    setValidade(null);
    setObservacao('');
    setValorProposta(0);
    setServicos([{ un: '', especificacoes: '', valor: '' }]);
  };

  const handleSubmit = () => {
    if (!data || !cliente || !validade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const orcamento = {
      data: formatarData(data),
      cliente,
      validade: formatarData(validade),
      observacao,
      valor_proposta: valorProposta,
      servicos,
      dataExtenso: formatarDataExtenso(data),
    };

    if (isEditing && currentId) {
      updateOrcamento(currentId, orcamento, (success: boolean) => {
        if (success) {
          navigation.navigate('OrcamentoView', { orcamento: { ...orcamento, id: currentId } });
        } else {
          Alert.alert('Erro', 'Falha ao atualizar orçamento');
        }
      });
    } else {
      saveOrcamento(orcamento, (id: number) => {
        navigation.navigate('OrcamentoView', { orcamento: { ...orcamento, id } });
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Informações Básicas</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Data:</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDataPicker(true)}>
          <Text style={{ color: data ? '#333' : '#999' }}>
            {data ? formatarData(data) : 'Selecionar data'}
          </Text>
        </TouchableOpacity>
        {showDataPicker && (
          <DateTimePicker
            value={data || new Date()}
            mode="date"
            display="default"
            onChange={onChangeData}
          />
        )}

        <Text style={styles.label}>Cliente Tomador do Serviço:</Text>
        <TextInput
          style={styles.input}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nome do cliente"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Validade da Proposta:</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowValidadePicker(true)}>
          <Text style={{ color: validade ? '#333' : '#999' }}>
            {validade ? formatarData(validade) : 'Selecionar data'}
          </Text>
        </TouchableOpacity>
        {showValidadePicker && (
          <DateTimePicker
            value={validade || new Date()}
            mode="date"
            display="default"
            onChange={onChangeValidade}
          />
        )}

        <Text style={styles.label}>Observação:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Observações adicionais"
          placeholderTextColor="#999"
          multiline
        />
      </View>

      <Text style={styles.sectionTitle}>Serviços</Text>
      <View style={styles.card}>
        {servicos.map((servico, index) => (
          <View key={index} style={styles.servicoContainer}>
            <View style={styles.servicoHeader}>
              <Text style={styles.servicoTitle}>Item {index + 1}</Text>
              {servicos.length > 1 && (
                <TouchableOpacity style={styles.removeButton} onPress={() => removerServico(index)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>UN:</Text>
            <TextInput
              style={styles.input}
              value={servico.un}
              onChangeText={(text) => atualizarServico(index, 'un', text)}
              placeholder="Ex: m², un, h"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Especificações:</Text>
            <TextInput
              style={styles.input}
              value={servico.especificacoes}
              onChangeText={(text) => atualizarServico(index, 'especificacoes', text)}
              placeholder="Descrição do serviço"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Valor:</Text>
            <TextInput
              style={styles.input}
              value={servico.valor.toString()}
              onChangeText={(text) => atualizarServico(index, 'valor', text)}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={adicionarServico}>
          <Ionicons name="add-circle-outline" size={24} color="#3498db" />
          <Text style={styles.addButtonText}>Adicionar Item</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.totalCard]}>
        <Text style={styles.totalText}>
          TOTAL GERAL: R$ {valorProposta.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>
            {isEditing ? 'Atualizar Orçamento' : 'Gerar Orçamento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={clearFields}>
          <Ionicons name="refresh-outline" size={20} color="#3498db" />
          <Text style={styles.secondaryButtonText}>Limpar Campos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Histórico' as never)}
        >
          <Ionicons name="time-outline" size={20} color="#3498db" />
          <Text style={styles.secondaryButtonText}>Ver Histórico</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    color: '#7f8c8d',
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    justifyContent: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  servicoContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  servicoTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    backgroundColor: '#f8f9fa',
  },
  addButtonText: {
    color: '#3498db',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  totalCard: {
    backgroundColor: '#e8f4fc',
    borderColor: '#3498db',
    borderWidth: 1,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#3498db',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default OrcamentoForm;