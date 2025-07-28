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
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveOrcamento, updateOrcamento, getOrcamentoById, Orcamento, Servico } from '../database/database';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, OrcamentoFormRouteProp } from '../types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MoneyInput from './MoneyInput';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type OrcamentoFormNavigationProp = StackNavigationProp<RootStackParamList, 'OrcamentoForm'>;

const OrcamentoForm = () => {
  const navigation = useNavigation<OrcamentoFormNavigationProp>();
  const route = useRoute<OrcamentoFormRouteProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [data, setData] = useState<Date | null>(null);
  const [showDataPicker, setShowDataPicker] = useState(false);
  const [validade, setValidade] = useState<Date | null>(null);
  const [showValidadePicker, setShowValidadePicker] = useState(false);
  const [cliente, setCliente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [valorProposta, setValorProposta] = useState(0);
  const [servicos, setServicos] = useState<Servico[]>([{ un: '', especificacoes: '', valor: 0 }]);

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
    setServicos([...servicos, { un: '', especificacoes: '', valor: 0 }]);
  };

  const removerServico = (index: number) => {
    if (servicos.length > 1) {
      const novosServicos = [...servicos];
      novosServicos.splice(index, 1);
      setServicos(novosServicos);
      // Recalcular total após remover serviço
      setTimeout(() => atualizarTotal(), 100);
    }
  };

  const atualizarServico = (index: number, campo: keyof Servico, valor: string | number) => {
    const novosServicos = [...servicos];
    novosServicos[index] = {
      ...novosServicos[index],
      [campo]: valor,
    };
    setServicos(novosServicos);

    if (campo === 'valor') {
      // Usar setTimeout para garantir que o estado seja atualizado antes do cálculo
      setTimeout(() => atualizarTotal(), 100);
    }
  };

  const atualizarTotal = () => {
    const total = servicos.reduce((sum, servico) => {
      const valorNumerico = typeof servico.valor === 'number' ? servico.valor : parseFloat(servico.valor as string) || 0;
      return sum + valorNumerico;
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
    setServicos([{ un: '', especificacoes: '', valor: 0 }]);
  };

  const validateForm = () => {
    if (!data) {
      Alert.alert('Erro', 'Por favor, selecione a data do orçamento');
      return false;
    }

    if (!cliente.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do cliente');
      return false;
    }

    if (!validade) {
      Alert.alert('Erro', 'Por favor, selecione a data de validade');
      return false;
    }

    // Validar se há pelo menos um serviço preenchido
    const servicosValidos = servicos.filter(s => {
      const valorNumerico = typeof s.valor === 'number' ? s.valor : parseFloat(s.valor as string) || 0;
      return s.un.trim() && s.especificacoes.trim() && valorNumerico > 0;
    });

    if (servicosValidos.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos um serviço válido');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {

    if (!validateForm()) {
      return;
    }

    // Filtrar apenas serviços válidos
    const servicosValidos = servicos.filter(s => {
      const valorNumerico = typeof s.valor === 'number' ? s.valor : parseFloat(s.valor as string) || 0;
      return s.un.trim() && s.especificacoes.trim() && valorNumerico > 0;
    });

    // Recalcular total com serviços válidos
    const totalCalculado = servicosValidos.reduce((sum, servico) => {
      const valorNumerico = typeof servico.valor === 'number' ? servico.valor : parseFloat(servico.valor as string) || 0;
      return sum + valorNumerico;
    }, 0);

    const orcamento = {
      data: formatarData(data),
      cliente: cliente.trim(),
      validade: formatarData(validade),
      observacao: observacao.trim(),
      valor_proposta: totalCalculado,
      servicos: servicosValidos,
      dataExtenso: formatarDataExtenso(data),
    };

    if (isEditing && currentId) {
      updateOrcamento(currentId, orcamento, (success: boolean) => {
        if (success) {
          Alert.alert('Sucesso', 'Orçamento atualizado com sucesso!', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OrcamentoView', { orcamento: { ...orcamento, id: currentId } })
            }
          ]);
        } else {
          Alert.alert('Erro', 'Falha ao atualizar orçamento');
        }
      });
    } else {
      saveOrcamento(orcamento, (result: number | null) => {
        if (result && result > 0) {
          Alert.alert('Sucesso', 'Orçamento salvo com sucesso!', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OrcamentoView', { orcamento: { ...orcamento, id: result } })
            }
          ]);
        } else {
          Alert.alert('Erro', 'Falha ao salvar orçamento. Tente novamente.');
        }
      });
    }
  };

  // Recalcular total sempre que servicos mudarem
  useEffect(() => {
    atualizarTotal();
  }, [servicos]);

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
            <View style={styles.moneyInputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <MoneyInput
                style={styles.moneyInput}
                value={typeof servico.valor === 'number' ? servico.valor : parseFloat(servico.valor as string) || 0}
                onValueChange={(valor) => atualizarServico(index, 'valor', valor)}
                placeholder="0,00"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={adicionarServico}>
          <Ionicons name="add-circle-outline" size={24} color="#3498db" />
          <Text style={styles.addButtonText}>Adicionar Item</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.totalCard]}
      >
        <Text style={styles.totalText}>
          TOTAL GERAL: R$ {valorProposta.toFixed(2).replace('.', ',')}
        </Text>
      </LinearGradient>

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

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 25,
    marginBottom: 15,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  label: {
    color: '#5a6c7d',
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#3498db',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  servicoContainer: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f4f8',
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 16,
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf4',
  },
  servicoTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fee',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: '#f8fbff',
    marginTop: 10,
  },
  addButtonText: {
    color: '#3498db',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  moneyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    marginBottom: 18,
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 8,
  },
  moneyInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  totalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3498db',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});

export default OrcamentoForm;