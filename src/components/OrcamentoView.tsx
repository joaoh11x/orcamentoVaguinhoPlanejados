import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { OrcamentoViewRouteProp } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { loadAssetAsBase64 } from '../utils/assetHelpers';

type OrcamentoViewNavigationProp = StackNavigationProp<RootStackParamList, 'OrcamentoView'>;

const OrcamentoView = () => {
    const route = useRoute<OrcamentoViewRouteProp>();
    const navigation = useNavigation<OrcamentoViewNavigationProp>();
    const { orcamento } = route.params;

    // Função para carregar o logo de forma mais robusta
    const loadLogoAsBase64 = async (): Promise<string | null> => {
        try {
            const base64 = await loadAssetAsBase64(require('../../assets/logo.png'));
            return base64 ? `data:image/png;base64,${base64}` : null;
        } catch (error) {
            console.error('Erro ao carregar logo:', error);
            return null;
        }
    };

    const generateHTML = async () => {
        try {
            const logoSrc = await loadLogoAsBase64();
            
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
                ${logoSrc ? `<img src="${logoSrc}" alt="Logo da Empresa" style="height: 100px; width: 200px; display: block; margin: 0 auto;">` : '<div class="logo-text" style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #2c3e50;">VAGUINHO PLANEJADOS</div>'}
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
            console.error('Erro ao gerar HTML:', error);
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
            console.log('Iniciando geração de PDF...');
            const html = await generateHTML();
            console.log('HTML gerado, criando PDF...');
            
            const { uri } = await Print.printToFileAsync({ 
                html,
                base64: false
            });
            
            console.log('PDF criado em:', uri);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartilhar Orçamento',
                    UTI: 'com.adobe.pdf'
                });
            } else {
                console.log('Sharing não disponível');
                // Fallback para Android
                if (Platform.OS === 'android') {
                    await Share.share({
                        url: uri,
                        title: 'Orçamento Vaguinho Planejados'
                    });
                }
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            // Em caso de erro, tentar compartilhar como texto
            await shareAsText();
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
        backgroundColor: '#f5f7fa',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e8ecf4',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        marginRight: 18,
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f8fbff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 20,
        padding: 25,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#e8ecf4',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8fbff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1ecf4',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3498db',
        letterSpacing: 1,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        color: '#2c3e50',
        letterSpacing: 1,
    },
    infoContainer: {
        borderWidth: 2,
        borderColor: '#e8ecf4',
        borderRadius: 12,
        padding: 18,
        marginBottom: 25,
        backgroundColor: '#fafbfc',
    },
    infoText: {
        marginBottom: 12,
        fontSize: 15,
        lineHeight: 22,
    },
    infoLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
        letterSpacing: 0.3,
    },
    sectionTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 15,
        color: '#2c3e50',
        letterSpacing: 0.5,
    },
    servicosContainer: {
        borderWidth: 2,
        borderColor: '#e8ecf4',
        borderRadius: 12,
        marginBottom: 25,
        overflow: 'hidden',
    },
    servicosHeader: {
        flexDirection: 'row',
        backgroundColor: '#3498db',
        paddingVertical: 15,
    },
    servicosRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f4f8',
        backgroundColor: '#fafbfc',
    },
    servicosCell: {
        padding: 15,
        fontSize: 15,
        fontWeight: '500',
    },
    headerCell: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#e8f4fc',
        paddingVertical: 15,
    },
    totalLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    propostaContainer: {
        marginBottom: 25,
        padding: 18,
        backgroundColor: '#f8fafb',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
    },
    propostaText: {
        marginBottom: 12,
        fontSize: 15,
        lineHeight: 22,
    },
    propostaLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
        letterSpacing: 0.3,
    },
    dataContainer: {
        alignItems: 'center',
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#f8fbff',
        borderRadius: 12,
    },
    dataText: {
        fontSize: 16,
        color: '#5a6c7d',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    divider: {
        width: 180,
        height: 2,
        backgroundColor: '#3498db',
        marginTop: 15,
        borderRadius: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 15,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 16,
        flex: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
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
        marginLeft: 10,
        fontSize: 15,
        letterSpacing: 0.3,
    },
});

export default OrcamentoView;