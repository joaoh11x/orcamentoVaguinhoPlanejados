import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { OrcamentoViewRouteProp } from '../types';
import { Ionicons } from '@expo/vector-icons';

type OrcamentoViewNavigationProp = StackNavigationProp<RootStackParamList, 'OrcamentoView'>;

const OrcamentoView = () => {
    const route = useRoute<OrcamentoViewRouteProp>();
    const navigation = useNavigation<OrcamentoViewNavigationProp>();
    const { orcamento } = route.params;

    const generateHTML = async () => {
        try {
            const logoAsset = Asset.fromModule(require('../../assets/logo.png'));
            await logoAsset.downloadAsync();
            
            const base64Logo = await FileSystem.readAsStringAsync(logoAsset.localUri!, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const logoSrc = `data:image/png;base64,${base64Logo}`;
            return `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Orçamento</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    .orcamento {
                        text-align: center;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .tabela-info {
                        width: 100%;
                        max-width: 1200px;
                        margin: 0 auto;
                        border-collapse: collapse;
                        border: 1px solid black;
                    }
                    .tabela-info td {
                        padding: 8px;
                        border: 1px solid black;
                    }
                    .tabela-info strong {
                        display: inline;
                        width: 120px;
                    }
                    .tabela-servicos {
                        width: 100%;
                        max-width: 1200px;
                        margin: 20px auto;
                        border-collapse: collapse;
                        border: 1px solid black;
                    }
                    .tabela-servicos th,
                    .tabela-servicos td {
                        padding: 10px;
                        border: 1px solid black;
                        text-align: left;
                    }
                    .tabela-servicos th {
                        font-weight: bold;
                    }
                    .titulo-servicos {
                        text-align: center;
                        font-size: 20px;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    .informacoes-proposta,
                    .informacoes-representante,
                    .marcenaria {
                        margin: 20px auto;
                        max-width: 1200px;
                        padding: 10px;
                        font-size: 16px;
                    }
                    .informacoes-proposta p,
                    .informacoes-representante p {
                        margin: 5px 0;
                        font-weight: bold;
                    }
                    .informacoes-representante p {
                        margin-bottom: 40px;
                    }
                    .marcenaria p {
                        margin: 5px 0;
                    }
                    .informacoes-representante {
                        text-align: center;
                    }
                    .informacoes-representante hr {
                        width: 200px;
                        margin: 10px auto;
                    }
                    @media print {
                        button {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <img src="${logoSrc}" alt="Logo da Empresa" style="height: 100px; width: 200px">
                <h1 class="orcamento">ORÇAMENTO</h1>
                <table class="tabela-info">
                    <tr>
                        <td colspan="3"><strong>DENOMINAÇÃO:</strong> VAGUINHO PLANEJADOS</td>
                    </tr>
                    <tr>
                        <td colspan="3"><strong>ENDEREÇO:</strong> RUA DR LUIZ GOMES DOS REIS, Nº 112</td>
                    </tr>
                    <tr>
                        <td colspan="1"><strong>CEP:</strong> 17.470-029</td>
                        <td colspan="1"><strong>CNPJ Nº:</strong> 46.535.355/0001-86</td>
                        <td colspan="1"><strong>FONE:</strong> (14) 99719-7638</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>E-MAIL:</strong> vaguinhogabriel01@gmail.com</td>
                        <td colspan="1"><strong>DATA:</strong> ${orcamento.data}</td>
                    </tr>
                </table>
                <div class="titulo-servicos">ESPECIFICAÇÕES DOS SERVIÇOS</div>
                <table class="tabela-servicos">
                    <thead>
                        <tr>
                            <th>UN</th>
                            <th>ESPECIFICAÇÕES DOS SERVIÇOS</th>
                            <th>VALOR</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orcamento.servicos
                    .map(
                        (servico) => `
                                    <tr>
                                        <td>${servico.un}</td>
                                        <td>${servico.especificacoes}</td>
                                        <td>R$ ${Number(servico.valor).toFixed(2).replace('.', ',')}</td>
                                        <td>R$ ${Number(servico.valor).toFixed(2).replace('.', ',')}</td>
                                    </tr>
                                `
                    )
                    .join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>TOTAL GERAL:</strong></td>
                            <td>R$ ${Number(orcamento.valor_proposta).toFixed(2).replace('.', ',')}</td>
                        </tr>
                    </tfoot>
                </table>
                <div class="informacoes-proposta">
                    <p><strong>VALOR DA PROPOSTA:</strong> R$ ${Number(orcamento.valor_proposta).toFixed(2).replace('.', ',')}</p>
                    <p><strong>CLIENTE TOMADOR DO SERVIÇO:</strong> ${orcamento.cliente}</p>
                    <p><strong>VALIDADE DA PROPOSTA:</strong> ${orcamento.validade}</p>
                    <p><strong>OBSERVAÇÃO:</strong> ${orcamento.observacao || ''}</p>
                </div>
                <div class="informacoes-representante">
                    <p>Duartina, ${orcamento.dataExtenso}</p>
                    <hr>
                </div>
                <div class="marcenaria">
                    <p><strong>Nome do Representante:</strong> VAGNER ROBERTO GABRIEL</p>
                    <p><strong>RG do Representante:</strong> 33.474.439-9</p>
                    <p><strong>CPF do Representante:</strong> 273.959.458-59</p>
                </div>
            </body>
            </html>
        `;
        } catch (error) {
            console.error('Erro ao carregar logo:', error);
            // Retorna HTML sem logo se houver erro
            return generateHTMLWithoutLogo();
        }
    };

    const generateHTMLWithoutLogo = () => {
        return `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Orçamento</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                .orcamento {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                }
                .logo-text {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #2c3e50;
                }
                .tabela-info {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    border-collapse: collapse;
                    border: 1px solid black;
                }
                .tabela-info td {
                    padding: 8px;
                    border: 1px solid black;
                }
                .tabela-info strong {
                    display: inline;
                    width: 120px;
                }
                .tabela-servicos {
                    width: 100%;
                    max-width: 1200px;
                    margin: 20px auto;
                    border-collapse: collapse;
                    border: 1px solid black;
                }
                .tabela-servicos th,
                .tabela-servicos td {
                    padding: 10px;
                    border: 1px solid black;
                    text-align: left;
                }
                .tabela-servicos th {
                    font-weight: bold;
                }
                .titulo-servicos {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .informacoes-proposta,
                .informacoes-representante,
                .marcenaria {
                    margin: 20px auto;
                    max-width: 1200px;
                    padding: 10px;
                    font-size: 16px;
                }
                .informacoes-proposta p,
                .informacoes-representante p {
                    margin: 5px 0;
                    font-weight: bold;
                }
                .informacoes-representante p {
                    margin-bottom: 40px;
                }
                .marcenaria p {
                    margin: 5px 0;
                }
                .informacoes-representante {
                    text-align: center;
                }
                .informacoes-representante hr {
                    width: 200px;
                    margin: 10px auto;
                }
                @media print {
                    button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="logo-text">VAGUINHO PLANEJADOS</div>
            <h1 class="orcamento">ORÇAMENTO</h1>
            <table class="tabela-info">
                <tr>
                    <td colspan="3"><strong>DENOMINAÇÃO:</strong> VAGUINHO PLANEJADOS</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>ENDEREÇO:</strong> RUA DR LUIZ GOMES DOS REIS, Nº 112</td>
                </tr>
                <tr>
                    <td colspan="1"><strong>CEP:</strong> 17.470-029</td>
                    <td colspan="1"><strong>CNPJ Nº:</strong> 46.535.355/0001-86</td>
                    <td colspan="1"><strong>FONE:</strong> (14) 99719-7638</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>E-MAIL:</strong> vaguinhogabriel01@gmail.com</td>
                    <td colspan="1"><strong>DATA:</strong> ${orcamento.data}</td>
                </tr>
            </table>
            <div class="titulo-servicos">ESPECIFICAÇÕES DOS SERVIÇOS</div>
            <table class="tabela-servicos">
                <thead>
                    <tr>
                        <th>UN</th>
                        <th>ESPECIFICAÇÕES DOS SERVIÇOS</th>
                        <th>VALOR</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${orcamento.servicos
                .map(
                    (servico) => `
                                <tr>
                                    <td>${servico.un}</td>
                                    <td>${servico.especificacoes}</td>
                                    <td>R$ ${Number(servico.valor).toFixed(2).replace('.', ',')}</td>
                                    <td>R$ ${Number(servico.valor).toFixed(2).replace('.', ',')}</td>
                                </tr>
                            `
                )
                .join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>TOTAL GERAL:</strong></td>
                        <td>R$ ${Number(orcamento.valor_proposta).toFixed(2).replace('.', ',')}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="informacoes-proposta">
                <p><strong>VALOR DA PROPOSTA:</strong> R$ ${Number(orcamento.valor_proposta).toFixed(2).replace('.', ',')}</p>
                <p><strong>CLIENTE TOMADOR DO SERVIÇO:</strong> ${orcamento.cliente}</p>
                <p><strong>VALIDADE DA PROPOSTA:</strong> ${orcamento.validade}</p>
                <p><strong>OBSERVAÇÃO:</strong> ${orcamento.observacao || ''}</p>
            </div>
            <div class="informacoes-representante">
                <p>Duartina, ${orcamento.dataExtenso}</p>
                <hr>
            </div>
            <div class="marcenaria">
                <p><strong>Nome do Representante:</strong> VAGNER ROBERTO GABRIEL</p>
                <p><strong>RG do Representante:</strong> 33.474.439-9</p>
                <p><strong>CPF do Representante:</strong> 273.959.458-59</p>
            </div>
        </body>
        </html>
    `;
    };

    const shareAsPDF = async () => {
        try {
            const html = await generateHTML();
            const { uri } = await Print.printToFileAsync({ html });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartilhar Orçamento',
                UTI: 'com.adobe.pdf'
            });
        } catch (error) {
            console.error('Error sharing PDF:', error);
        }
    };

    const shareAsText = async () => {
        try {
            let shareText = `ORÇAMENTO - VAGUINHO PLANEJADOS\n\n`;
            shareText += `Cliente: ${orcamento.cliente}\n`;
            shareText += `Data: ${orcamento.data}\n\n`;

            shareText += `SERVIÇOS:\n`;
            orcamento.servicos.forEach(servico => {
                shareText += `${servico.un} - ${servico.especificacoes}: R$ ${Number(servico.valor).toFixed(2).replace('.', ',')}\n`;
            });

            shareText += `\nTOTAL: R$ ${Number(orcamento.valor_proposta).toFixed(2).replace('.', ',')}\n`;
            shareText += `Validade: ${orcamento.validade}\n`;
            shareText += `Observação: ${orcamento.observacao || ''}`;

            await Share.share({
                message: shareText,
                title: 'Orçamento Vaguinho Planejados'
            });
        } catch (error) {
            console.error('Error sharing text:', error);
        }
    };

    const editOrcamento = () => {
        navigation.navigate('OrcamentoForm', { orcamentoId: orcamento.id });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#3498db" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalhes do Orçamento</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>VAGUINHO PLANEJADOS</Text>
                </View>

                <Text style={styles.titulo}>ORÇAMENTO</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>DENOMINAÇÃO:</Text> VAGUINHO PLANEJADOS</Text>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>ENDEREÇO:</Text> RUA DR LUIZ GOMES DOS REIS, Nº 112</Text>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>CEP:</Text> 17.470-029</Text>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>CNPJ Nº:</Text> 46.535.355/0001-86</Text>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>FONE:</Text> (14) 99719-7638</Text>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>E-MAIL:</Text> vaguinhogabriel01@gmail.com</Text>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>DATA:</Text> {orcamento.data}</Text>
                </View>

                <Text style={styles.sectionTitle}>ESPECIFICAÇÕES DOS SERVIÇOS</Text>

                <View style={styles.servicosContainer}>
                    <View style={styles.servicosHeader}>
                        <Text style={[styles.servicosCell, styles.headerCell]}>UN</Text>
                        <Text style={[styles.servicosCell, styles.headerCell, { flex: 2 }]}>ESPECIFICAÇÕES</Text>
                        <Text style={[styles.servicosCell, styles.headerCell]}>VALOR</Text>
                    </View>

                    {orcamento.servicos.map((servico, index) => (
                        <View key={index} style={styles.servicosRow}>
                            <Text style={styles.servicosCell}>{servico.un}</Text>
                            <Text style={[styles.servicosCell, { flex: 2 }]}>{servico.especificacoes}</Text>
                            <Text style={styles.servicosCell}>R$ {Number(servico.valor).toFixed(2).replace('.', ',')}</Text>
                        </View>
                    ))}

                    <View style={styles.totalRow}>
                        <Text style={[styles.servicosCell, styles.totalLabel]}>TOTAL GERAL:</Text>
                        <Text style={styles.servicosCell}>R$ {Number(orcamento.valor_proposta).toFixed(2).replace('.', ',')}</Text>
                    </View>
                </View>

                <View style={styles.propostaContainer}>
                    <Text style={styles.propostaText}><Text style={styles.propostaLabel}>CLIENTE:</Text> {orcamento.cliente}</Text>
                    <Text style={styles.propostaText}><Text style={styles.propostaLabel}>VALIDADE:</Text> {orcamento.validade}</Text>
                    <Text style={styles.propostaText}><Text style={styles.propostaLabel}>OBSERVAÇÃO:</Text> {orcamento.observacao || 'Nenhuma'}</Text>
                </View>

                <View style={styles.dataContainer}>
                    <Text style={styles.dataText}>Duartina, {orcamento.dataExtenso}</Text>
                    <View style={styles.divider} />
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={editOrcamento}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.pdfButton]}
                    onPress={shareAsPDF}
                >
                    <Ionicons name="document-text-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Gerar PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={shareAsText}
                >
                    <Ionicons name="share-social-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Compartilhar</Text>
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
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 15,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2c3e50',
    },
    infoContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    infoText: {
        marginBottom: 8,
        fontSize: 14,
    },
    infoLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    sectionTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 10,
        color: '#2c3e50',
    },
    servicosContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 20,
    },
    servicosHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    servicosRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    servicosCell: {
        padding: 10,
        fontSize: 14,
    },
    headerCell: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
    },
    totalLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    propostaContainer: {
        marginBottom: 20,
    },
    propostaText: {
        marginBottom: 8,
        fontSize: 14,
    },
    propostaLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    dataContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    dataText: {
        fontSize: 14,
        color: '#555',
    },
    divider: {
        width: 150,
        height: 1,
        backgroundColor: '#ddd',
        marginTop: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    editButton: {
        backgroundColor: '#f39c12',
    },
    pdfButton: {
        backgroundColor: '#e74c3c',
    },
    shareButton: {
        backgroundColor: '#3498db',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default OrcamentoView;