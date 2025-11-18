import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDownIcon } from '../components/icons';

const Setup = () => {
  const { blocks, apartments, addBatchBlocksAndApartments, deleteBlock, deleteApartment } = useApp();
  const [blockPrefix, setBlockPrefix] = useState('Bloco');
  const [numBlocks, setNumBlocks] = useState('2');
  const [floorsPerBlock, setFloorsPerBlock] = useState('4');
  const [aptsPerFloor, setAptsPerFloor] = useState('4');
  const [blockSuffixType, setBlockSuffixType] = useState<'letters' | 'numbers'>('letters');
  const [aptPrefix, setAptPrefix] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setFeedback('');
    try {
      const created = addBatchBlocksAndApartments(
        blockPrefix,
        parseInt(numBlocks),
        parseInt(floorsPerBlock),
        parseInt(aptsPerFloor),
        blockSuffixType,
        aptPrefix
      );
      setFeedback(`${created.blocks} blocos e ${created.apartments} apartamentos criados com sucesso!`);
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(`Erro: ${error.message}`);
      } else {
        setFeedback('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBlock = (blockId: string, blockName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o ${blockName} e todos os seus apartamentos? Esta ação não pode ser desfeita.`)) {
        try {
            deleteBlock(blockId);
            setFeedback(`Bloco ${blockName} excluído com sucesso.`);
        } catch (error) {
            if (error instanceof Error) {
                setFeedback(`Erro: ${error.message}`);
            } else {
                setFeedback('Ocorreu um erro desconhecido ao excluir o bloco.');
            }
        }
    }
  };

  const handleDeleteApartment = (aptId: string, aptNumber: string, blockName: string) => {
      if (window.confirm(`Tem certeza que deseja excluir o apartamento ${aptNumber} do ${blockName}? Esta ação não pode ser desfeita.`)) {
          try {
              deleteApartment(aptId);
              setFeedback(`Apartamento ${aptNumber} excluído com sucesso.`);
          } catch (error) {
              if (error instanceof Error) {
                  setFeedback(`Erro: ${error.message}`);
              } else {
                  setFeedback('Ocorreu um erro desconhecido ao excluir o apartamento.');
              }
          }
      }
  };


  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Configuração da Estrutura</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-brand-dark mb-2">Cadastro em Lote</h2>
        <p className="text-brand-secondary mb-6">Crie os blocos e apartamentos do seu condomínio de forma rápida.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="blockPrefix" className="block text-sm font-medium text-brand-secondary">Prefixo do Bloco</label>
              <input
                type="text"
                id="blockPrefix"
                value={blockPrefix}
                onChange={(e) => setBlockPrefix(e.target.value)}
                className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-secondary">Sufixo do Bloco</label>
              <div className="mt-2 flex gap-4">
                  <label className="flex items-center">
                      <input type="radio" name="suffixType" value="letters" checked={blockSuffixType === 'letters'} onChange={() => setBlockSuffixType('letters')} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-slate-300" />
                      <span className="ml-2 text-sm text-brand-dark">Letras (A, B...)</span>
                  </label>
                  <label className="flex items-center">
                      <input type="radio" name="suffixType" value="numbers" checked={blockSuffixType === 'numbers'} onChange={() => setBlockSuffixType('numbers')} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-slate-300" />
                      <span className="ml-2 text-sm text-brand-dark">Números (1, 2...)</span>
                  </label>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="aptPrefix" className="block text-sm font-medium text-brand-secondary">Prefixo do Apartamento (ex: Ap, Apto)</label>
            <input
              type="text"
              id="aptPrefix"
              placeholder="Opcional"
              value={aptPrefix}
              onChange={(e) => setAptPrefix(e.target.value)}
              className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="numBlocks" className="block text-sm font-medium text-brand-secondary">Nº de Blocos</label>
              <input
                type="number"
                id="numBlocks"
                value={numBlocks}
                onChange={(e) => setNumBlocks(e.target.value)}
                className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                min="1"
                required
              />
            </div>
            <div>
              <label htmlFor="floorsPerBlock" className="block text-sm font-medium text-brand-secondary">Andares por Bloco</label>
              <input
                type="number"
                id="floorsPerBlock"
                value={floorsPerBlock}
                onChange={(e) => setFloorsPerBlock(e.target.value)}
                className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                min="1"
                required
              />
            </div>
            <div>
              <label htmlFor="aptsPerFloor" className="block text-sm font-medium text-brand-secondary">Aptos por Andar</label>
              <input
                type="number"
                id="aptsPerFloor"
                value={aptsPerFloor}
                onChange={(e) => setAptsPerFloor(e.target.value)}
                className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                min="1"
                required
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400"
            >
              {isProcessing ? 'Processando...' : 'Criar Estrutura'}
            </button>
          </div>
        </form>

        {feedback && (
          <div className={`mt-4 p-4 rounded-md text-sm ${feedback.startsWith('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">Gerenciar Estrutura Existente</h2>
        <div className="space-y-2">
            {blocks.sort((a,b) => a.name.localeCompare(b.name)).map(block => (
                <details key={block.id} className="bg-slate-50 rounded-lg group" onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) setExpandedBlock(block.id);
                    else if (expandedBlock === block.id) setExpandedBlock(null);
                }} open={expandedBlock === block.id}>
                    <summary className="flex justify-between items-center p-4 cursor-pointer font-medium text-brand-dark list-none">
                        {block.name}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => { e.preventDefault(); handleDeleteBlock(block.id, block.name); }}
                                className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                            >
                                Excluir Bloco
                            </button>
                            <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-180 text-slate-500" />
                        </div>
                    </summary>
                    <div className="border-t border-slate-200">
                        <ul className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {apartments.filter(a => a.blockId === block.id).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map(apt => (
                                <li key={apt.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-200">
                                    <span>{apt.number}</span>
                                    <button
                                        onClick={() => handleDeleteApartment(apt.id, apt.number, block.name)}
                                        className="text-red-500 hover:text-red-700 text-xs font-semibold opacity-50 hover:opacity-100"
                                    >
                                        Excluir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            ))}
        </div>
        {blocks.length === 0 && <p className="text-center text-brand-secondary p-4">Nenhum bloco cadastrado.</p>}
      </div>
      {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
    </div>
  );
};

export default Setup;