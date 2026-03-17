
/**
 * Função para testar a saúde da API. 
 */
export const testApiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    if (data.status === 'ok' && data.apiKeyConfigured) {
      return { success: true, message: "Conexão com o servidor estabelecida e API Key configurada." };
    } else if (!data.apiKeyConfigured) {
      return { success: false, message: "Servidor online, mas GEMINI_API_KEY não configurada." };
    }
    return { success: false, message: "Erro na resposta do servidor." };
  } catch (error: any) {
    console.error("Erro de conexão com o servidor:", error);
    return { success: false, message: `Erro de conexão: ${error.message || 'Servidor offline'}` };
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao comunicar com o servidor');
    }
    
    return data.text || "Não foi possível gerar uma resposta no momento.";
  } catch (error: any) {
    console.error("Error communicating with backend:", error);
    return `Erro ao consultar o assistente: ${error.message}`;
  }
};

export const generateDocumentDraft = async (
  formData: any
): Promise<string> => {
  const prompt = `
  Aja como um Agente Redator Jurídico especializado na Lei 14.133/2021.
  Gere uma minuta técnica de **${formData.docType}** utilizando os seguintes parâmetros:

  **IDENTIFICAÇÃO:**
  - Órgão: ${formData.orgao} (CNPJ: ${formData.cnpj})
  - Setor: ${formData.setor}
  - Objeto: ${formData.objeto}
  ${formData.justificativa ? `- Justificativa Base: ${formData.justificativa}` : ''}
  - Processo: ${formData.processo}
  ${formData.numeroEdital ? `- Edital nº: ${formData.numeroEdital}` : ''}

  **LOCALIZAÇÃO:**
  - Endereço: ${formData.endereco}, ${formData.bairro}, ${formData.cidade}-${formData.uf} (CEP: ${formData.cep})

  **PARÂMETROS DA CONTRATAÇÃO:**
  - Modalidade: ${formData.modalidade}
  - Critério de Julgamento: ${formData.criterio}
  - Registro de Preços (SRP): ${formData.isSRP ? 'Sim' : 'Não'}
  - TIC: ${formData.isTIC ? 'Sim' : 'Não'}
  - Benefício ME/EPP: ${formData.isMEEPP ? 'Sim' : 'Não'}
  - Valor Estimado: ${formData.valorEstimadoStatus === 'divulgado' ? 'R$ ' + formData.valorEstimado : 'Sigiloso'}
  - Modo de Disputa: ${formData.modoDisputa}

  **PRAZOS E DETALHES DE EXECUÇÃO:**
  - Vigência: ${formData.vigencia ? formData.vigencia + ' ' + formData.unidadeVigencia : 'A definir'}
  - Prazo de Entrega/Execução: ${formData.prazoEntrega ? formData.prazoEntrega + ' dias' : 'Conforme cronograma'}
  - Garantia Contratual: ${formData.temGarantia ? 'Sim, 5% do valor do contrato' : 'Não exigida'}
  - Matriz de Riscos: ${formData.temMatrizRiscos ? 'Incluir cláusula/anexo de Matriz de Riscos' : 'Não aplicável'}

  **INSTRUÇÕES DE ESTRUTURA E AGENTE:**
  1. Atue com rigor técnico (citando artigos da Lei 14.133).
  2. Estruture o documento com cláusulas claras.
  3. Se for TR/ETP, inclua seções de sustentabilidade e análise de riscos.
  4. Utilize os dados de vigência e garantia para criar as respectivas cláusulas.
  
  Utilize linguagem jurídica formal mas moderna da Lei 14.133/2021. Use colchetes [ ] para campos que o usuário deve preencher manualmente.
  `;

  try {
    const response = await fetch('/api/generate-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao gerar documento no servidor');
    }
    
    return data.text || "Não foi possível gerar a minuta.";
  } catch (error: any) {
    console.error("Error generating document via backend:", error);
    return `Erro ao gerar a minuta: ${error.message}`;
  }
};
