
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, Wand2, Copy, Check, Loader2, Edit3, Eye, 
  Save, Trash2, History, Building2, MapPin, Settings2, FileStack, Sparkles, CalendarClock
} from 'lucide-react';
import { generateDocumentDraft } from '../services/gemini';

// Dynamic import for Prettier to avoid heavy initial load
const formatWithPrettier = async (text: string) => {
  try {
    const prettier = await import('prettier/standalone');
    const parserMarkdown = await import('prettier/plugins/markdown');
    const parserEstree = await import('prettier/plugins/estree');
    
    return await prettier.format(text, {
      parser: "markdown",
      plugins: [parserMarkdown, parserEstree],
      proseWrap: "always",
      printWidth: 80,
    });
  } catch (error) {
    console.error("Erro ao carregar Prettier:", error);
    return text;
  }
};

interface SavedDraft {
  id: string;
  title: string;
  type: string;
  content: string;
  date: string;
}

const DocGenerator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form State including legacy and new fields
  const [formData, setFormData] = useState({
    docType: 'Termo de Referência (TR)',
    modalidade: 'Pregão',
    cnpj: '',
    orgao: '',
    setor: '',
    objeto: '',
    justificativa: '', // Used for TR/ETP/Dispensa
    cep: '',
    endereco: '',
    bairro: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
    numeroEdital: '',
    codigoContratante: '',
    processo: '',
    criterio: 'Menor Preço',
    isTIC: false,
    isSRP: false,
    isMEEPP: true,
    isMargemPreferencia: false,
    valorEstimadoStatus: 'divulgado',
    valorEstimado: '',
    modoDisputa: 'Aberto',
    // New detailed fields
    vigencia: '',
    prazoEntrega: '',
    temGarantia: false,
    temMatrizRiscos: false,
    unidadeVigencia: 'Meses'
  });
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('licitagov_drafts');
    if (stored) {
      try {
        setSavedDrafts(JSON.parse(stored));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('licitagov_drafts', JSON.stringify(savedDrafts));
  }, [savedDrafts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const content = await generateDocumentDraft(formData);
    setGeneratedContent(content);
    setIsGenerating(false);
    setStep(2);
    setIsEditing(false);
  };

  const handleFormat = async () => {
    if (!generatedContent) return;
    setIsFormatting(true);
    const formatted = await formatWithPrettier(generatedContent);
    setGeneratedContent(formatted);
    setIsFormatting(false);
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = (format: 'txt' | 'doc') => {
    const element = document.createElement("a");
    let content = generatedContent;
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'doc') {
      content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${formData.docType}</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5;">
          ${generatedContent.replace(/\n/g, '<br>')}
        </body>
        </html>
      `;
      mimeType = 'application/msword';
      extension = 'doc';
    }

    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `Minuta_${formData.docType.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveLocal = () => {
    const newDraft: SavedDraft = {
      id: Date.now().toString(),
      title: `${formData.docType}: ${formData.objeto.substring(0, 30)}...`,
      type: formData.docType,
      content: generatedContent,
      date: new Date().toLocaleString('pt-BR'),
    };
    setSavedDrafts([newDraft, ...savedDrafts]);
    alert("Salvo nos rascunhos!");
  };

  const isFullEdital = formData.docType === 'Edital Completo (Lei 14.133/21)';

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Gerador de Minutas e Editais
          </h2>
          <p className="text-sm text-slate-500 mt-1">Selecione o documento e preencha os dados necessários.</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Voltar ao Formulário' : `Meus Rascunhos (${savedDrafts.length})`}
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {showHistory ? (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Rascunhos Salvos</h3>
            {savedDrafts.length === 0 ? (
               <div className="bg-white border border-dashed p-10 text-center rounded-xl text-slate-400">Nenhum rascunho encontrado.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedDrafts.map(draft => (
                  <div key={draft.id} onClick={() => { setGeneratedContent(draft.content); setStep(2); setShowHistory(false); }} className="bg-white border p-4 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{draft.title}</h4>
                      <p className="text-xs text-slate-500">{draft.date}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSavedDrafts(savedDrafts.filter(d => d.id !== draft.id)); }} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : step === 1 ? (
          <div className="space-y-6 animate-fade-in pb-20">
            {/* Seção 0: Seleção de Tipo */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                <FileStack size={14} className="text-blue-600"/> Tipo de Documento a ser Gerado
              </label>
              <select 
                name="docType" 
                value={formData.docType} 
                onChange={handleInputChange} 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Termo de Referência (TR)</option>
                <option>Estudo Técnico Preliminar (ETP)</option>
                <option>Pesquisa de Preços</option>
                <option>Justificativa de Contratação Direta</option>
                <option>Aviso de Dispensa</option>
                <option>Edital Completo (Lei 14.133/21)</option>
              </select>
            </div>

            {/* Seção 1: Identificação */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b flex items-center gap-2 font-semibold text-slate-700">
                <Building2 size={18} className="text-blue-600"/> Identificação e Objeto
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isFullEdital && (
                  <div className="md:col-span-2 flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="radio" name="modalidade" value="Pregão" checked={formData.modalidade === 'Pregão'} onChange={handleInputChange} className="w-4 h-4 text-blue-600"/> Pregão
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="radio" name="modalidade" value="Concorrência" checked={formData.modalidade === 'Concorrência'} onChange={handleInputChange} className="w-4 h-4 text-blue-600"/> Concorrência
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ do Órgão</label>
                  <input type="text" name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="00.000.000/0001-00" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Órgão / Entidade</label>
                  <input type="text" name="orgao" value={formData.orgao} onChange={handleInputChange} placeholder="Ex: Ministério da Saúde" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Setor Responsável</label>
                  <input type="text" name="setor" value={formData.setor} onChange={handleInputChange} placeholder="Ex: Departamento de Compras" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objeto da Demanda</label>
                  <textarea name="objeto" value={formData.objeto} onChange={handleInputChange} rows={3} placeholder="Descreva sucintamente o que será adquirido ou contratado..." className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"/>
                </div>
                {!isFullEdital && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Justificativa da Necessidade (Breve)</label>
                    <textarea name="justificativa" value={formData.justificativa} onChange={handleInputChange} rows={2} placeholder="Por que esta contratação é necessária?" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"/>
                  </div>
                )}
              </div>
            </div>

            {/* Seção 2: Localização */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b flex items-center gap-2 font-semibold text-slate-700">
                <MapPin size={18} className="text-blue-600"/> Local de Execução/Entrega
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CEP</label>
                  <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label>
                  <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cidade</label>
                  <input type="text" name="cidade" value={formData.cidade} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UF</label>
                  <input type="text" name="uf" value={formData.uf} onChange={handleInputChange} placeholder="EX: DF" className="w-full border rounded-lg p-2 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bairro</label>
                  <input type="text" name="bairro" value={formData.bairro} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm"/>
                </div>
              </div>
            </div>

            {/* Seção 3: Parâmetros */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b flex items-center gap-2 font-semibold text-slate-700">
                <Settings2 size={18} className="text-blue-600"/> Dados Processuais e Técnicos
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Processo Administrativo</label>
                    <input type="text" name="processo" value={formData.processo} onChange={handleInputChange} placeholder="Ex: 23000.000123/2024-01" className="w-full border rounded-lg p-2 text-sm"/>
                  </div>
                  {isFullEdital && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número do Edital</label>
                      <input type="text" name="numeroEdital" value={formData.numeroEdital} onChange={handleInputChange} placeholder="Ex: 01/2024" className="w-full border rounded-lg p-2 text-sm"/>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Critério de Julgamento</label>
                    <select name="criterio" value={formData.criterio} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm">
                      <option>Menor Preço</option>
                      <option>Maior Desconto</option>
                      <option>Melhor Técnica</option>
                      <option>Técnica e Preço</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" name="isTIC" checked={formData.isTIC} onChange={handleInputChange} className="w-4 h-4"/> Contratação TIC
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" name="isSRP" checked={formData.isSRP} onChange={handleInputChange} className="w-4 h-4"/> Registro de Preços (SRP)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" name="isMEEPP" checked={formData.isMEEPP} onChange={handleInputChange} className="w-4 h-4"/> Benefício para ME/EPP
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Estimado</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" name="valorEstimado" value={formData.valorEstimado} onChange={handleInputChange} placeholder="R$ 0,00" className="flex-1 border rounded-lg p-2 text-sm"/>
                      <select name="valorEstimadoStatus" value={formData.valorEstimadoStatus} onChange={handleInputChange} className="bg-slate-50 border rounded-lg p-2 text-sm">
                        <option value="divulgado">Divulgado</option>
                        <option value="sigiloso">Sigiloso</option>
                      </select>
                    </div>
                  </div>
                  {isFullEdital && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modo de Disputa</label>
                      <select name="modoDisputa" value={formData.modoDisputa} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm">
                        <option>Aberto</option>
                        <option>Aberto e Fechado</option>
                        <option>Fechado e Aberto</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seção 4: Prazos e Execução */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b flex items-center gap-2 font-semibold text-slate-700">
                <CalendarClock size={18} className="text-blue-600"/> Prazos e Detalhes da Execução
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vigência Contratual</label>
                  <div className="flex gap-2">
                    <input type="number" name="vigencia" value={formData.vigencia} onChange={handleInputChange} placeholder="Ex: 12" className="flex-1 border rounded-lg p-2 text-sm"/>
                    <select name="unidadeVigencia" value={formData.unidadeVigencia} onChange={handleInputChange} className="border rounded-lg p-2 text-sm bg-slate-50">
                      <option>Meses</option>
                      <option>Anos</option>
                      <option>Dias</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prazo de Entrega/Execução (Dias)</label>
                  <input type="number" name="prazoEntrega" value={formData.prazoEntrega} onChange={handleInputChange} placeholder="Ex: 30" className="w-full border rounded-lg p-2 text-sm"/>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" name="temGarantia" checked={formData.temGarantia} onChange={handleInputChange} className="w-4 h-4"/> Exige Garantia Contratual (5%)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" name="temMatrizRiscos" checked={formData.temMatrizRiscos} onChange={handleInputChange} className="w-4 h-4"/> Incluir Matriz de Riscos
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={!formData.objeto || isGenerating}
                className={`flex items-center gap-3 px-12 py-4 rounded-xl font-bold transition-all shadow-lg ${
                  !formData.objeto || isGenerating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    GERANDO MINUTA...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    GERAR DOCUMENTO COM IA
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Editor */
          <div className="flex flex-col h-full animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
               <button onClick={() => setStep(1)} className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1">← Voltar e Ajustar Dados</button>
               <div className="flex flex-wrap gap-2">
                 <button 
                  onClick={handleFormat} 
                  disabled={isFormatting}
                  className="px-4 py-2 bg-slate-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2 transition-all disabled:opacity-50"
                 >
                   {isFormatting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16}/>}
                   {isFormatting ? 'Formatando...' : 'Formatar Código'}
                 </button>
                 <button onClick={handleSaveLocal} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"><Save size={16}/> Salvar</button>
                 <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${isEditing ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'} flex items-center gap-2`}>
                   {isEditing ? <Eye size={16}/> : <Edit3 size={16}/>}
                   {isEditing ? 'Modo Visualização' : 'Revisar e Editar'}
                 </button>
                 <div className="flex border rounded-lg overflow-hidden shadow-sm">
                   <button onClick={() => downloadFile('txt')} className="px-4 py-2 bg-white text-sm font-medium border-r border-slate-300 hover:bg-slate-50">.TXT</button>
                   <button onClick={() => downloadFile('doc')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">.DOC</button>
                 </div>
                 <button onClick={handleCopy} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium flex items-center gap-2">
                   {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>} {copied ? 'Copiado' : 'Copiar'}
                 </button>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
              <div className="bg-slate-900 text-white px-8 py-3 flex items-center justify-between text-xs font-bold tracking-widest uppercase">
                <span className="flex items-center gap-2">
                  {isEditing ? <Edit3 size={14}/> : <Eye size={14}/>} {formData.docType}
                </span>
                {isEditing && <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded text-[10px]">Edição Ativa</span>}
              </div>
              <div className="flex-1 overflow-y-auto">
                {isEditing ? (
                  <textarea 
                    ref={editorRef}
                    value={generatedContent} 
                    onChange={(e) => setGeneratedContent(e.target.value)} 
                    className="w-full h-full p-10 font-mono text-sm leading-relaxed border-none focus:ring-0 min-h-[600px] bg-slate-50" 
                    placeholder="Edite sua minuta aqui..."
                    spellCheck={false}
                  />
                ) : (
                  <div className="p-10 prose prose-slate max-w-none">
                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocGenerator;
