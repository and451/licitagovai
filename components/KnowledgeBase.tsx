import React, { useState, useEffect } from 'react';
import { FolderOpen, FileText, Database, ShieldCheck, Activity, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { testApiConnection } from '../services/gemini';

const KnowledgeBase: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<{ loading: boolean; success: boolean | null; message: string }>({
    loading: true,
    success: null,
    message: 'Verificando conexão...'
  });

  const checkStatus = async () => {
    setApiStatus(prev => ({ ...prev, loading: true }));
    const result = await testApiConnection();
    setApiStatus({
      loading: false,
      success: result.success,
      message: result.message
    });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const folders = [
    {
      name: 'Legislação Federal',
      files: [
        { label: 'Lei nº 14.133/2021 (NLLC)', url: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm' },
        { label: 'Constituição Federal (Arts. 37-41)', url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' },
        { label: 'IN SEGES/ME nº 65/2021', url: 'https://www.gov.br/compras/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/instrucao-normativa-seges-me-no-65-de-7-de-julho-de-2021' }
      ],
      color: 'bg-blue-100 text-blue-700',
    },
    {
      name: 'Jurisprudência TCU',
      files: [
        { label: 'Súmulas Selecionadas', url: '#' },
        { label: 'Acórdãos Relevantes 2023-2024', url: '#' },
        { label: 'Boletins de Jurisprudência', url: '#' }
      ],
      color: 'bg-amber-100 text-amber-700',
    },
    {
      name: 'Modelos AGU',
      files: [
        { label: 'Termo de Referência Padrão', url: 'https://www.gov.br/agu/pt-br/composicao/cgu/cgu/modelos/licitacoes-e-contratos/14133' },
        { label: 'Edital de Pregão Eletrônico', url: 'https://www.gov.br/agu/pt-br/composicao/cgu/cgu/modelos/licitacoes-e-contratos/14133' },
        { label: 'Minutas de Contratos', url: 'https://www.gov.br/agu/pt-br/composicao/cgu/cgu/modelos/licitacoes-e-contratos/14133' }
      ],
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Database className="text-blue-600" />
          Base de Conhecimento
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Documentos e status técnico do Agente de IA.
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* API Health Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Status do Sistema (API Gemini)
            </h4>
            <button 
              onClick={checkStatus}
              disabled={apiStatus.loading}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Recarregar status"
            >
              <RefreshCw size={16} className={apiStatus.loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              apiStatus.loading ? 'bg-slate-100' : apiStatus.success ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {apiStatus.loading ? (
                <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
              ) : apiStatus.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className={`text-sm font-bold ${
                apiStatus.loading ? 'text-slate-500' : apiStatus.success ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {apiStatus.loading ? 'Verificando...' : apiStatus.success ? 'Sistema Online' : 'Problema Detectado'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{apiStatus.message}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
                <h4 className="font-semibold text-blue-800">Ambiente Seguro</h4>
                <p className="text-sm text-blue-700 mt-1">
                    As respostas do chat utilizam exclusivamente os documentos listados abaixo como contexto prioritário para garantir conformidade legal com a Lei 14.133/2021.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {folders.map((folder, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${folder.color}`}>
                <FolderOpen className="w-5 h-5" />
                <span className="font-semibold">{folder.name}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {folder.files.map((file, fIdx) => (
                  <li key={fIdx} className="px-4 py-3 flex items-center gap-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <a 
                      href={file.url}
                      target={file.url !== '#' ? "_blank" : undefined}
                      rel={file.url !== '#' ? "noopener noreferrer" : undefined}
                      onClick={(e) => file.url === '#' && e.preventDefault()}
                      className={`flex-1 flex items-center gap-2 ${file.url !== '#' ? 'text-blue-600 hover:underline' : 'cursor-default'}`}
                    >
                      {file.label}
                      {file.url !== '#' && <ExternalLink size={12} className="text-slate-400" />}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-xs font-medium text-slate-500 hover:text-blue-600 uppercase tracking-wider">
                  Ver Conteúdo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;