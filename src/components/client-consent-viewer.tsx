
"use client";

import { useState, useRef, useEffect } from 'react';
import type { Client, Consent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from './ui/scroll-area';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import Image from 'next/image';

const consentDocuments = [
  {
    key: 'dataProtection',
    title: "Consentiment per al Tractament de Dades Personals",
    content: () => (
      <>
        <h3 className="font-bold text-center underline">INFORMACIÓ RELATIVA AL TRACTAMENT DE DADES PERSONALS</h3>
        <p>
          D'acord amb el que disposa la normativa sobre protecció de dades personals RGPD 2016/679 de 27
          d'abril i normativa de desenvolupament, <strong>FISIOGES SL</strong>, l' informa i sol·licita el seu consentiment per al
          tractament de les seves dades personals, en les que s'inclouen dades de salut, que seran incorporades a
          un fitxer deguament registrat davant l' AGENCIA ESPAÑOLA DE PROTECCIÓN DE DATES (AEPD)
          anomenat PACIENTES/HISTORIAS CLÍNICAS, amb la finalitat de la seva gestió clínica, incloent-s'hi les
          valoracions obtingudes en els processos d'anamnesis i la documentació i resultats de les proves
          diagnòstiques realitzades, així com també el tractament prescrit. L'informem que les seves dades seran
          tractades de manera confidencial i no seran cedides ni comunicades a tercers, excepte quan aquest fet
          sigui imprescindible per a la realització del tractament sol·licitat i sempre amb la mateixa finalitat, o bé
          vostè ens autoritzi de manera expressa a fer-ho. L'informem també que hem implementat les mesures
          de seguretat establertes en la normativa vigent en la matèria aplicables a les dades de naturalesa
          especialment sensible. També l'informem que conservarem les seves dades d'identificació durant la
          nostra relació professional, i en relació a les dades de salut estarem al que disposa la normativa
          específica en la matèria ( Llei del Pacient). Vostè podrà exercir els seus drets d'accés, rectificació,
          cancel.lació i oposició de les seves dades mitjançant escrit dirigit a FISIOGES SL, Carrer Anicet Pagès
          nº 9 17600 FIGUERES, adjuntant copia del seu DNI m, o bé adreçant un correu electrònic a
          fisioactiva@fisioterapeutes.org. El mateix procediment haurà de seguir-se en el cas de la revocació del
          consentiment.
        </p>
      </>
    )
  },
  {
    key: 'treatment',
    title: "Consentiment Informat per a Tractament de Fisioteràpia",
    content: () => (
       <>
        <h3 className="font-bold text-center underline">CONSENTIMENT INFORMAT PER A TRACTAMENT DE FISIOTERÀPIA</h3>
        <p>
            Mitjançant el present document, atorgo el meu consentiment informat per rebre tractament de fisioteràpia per part dels professionals de <strong>FISIOGES SL</strong>.
        </p>
        <p>
            Entenc que la fisioteràpia és una disciplina de la salut que ofereix un tractament terapèutic i de rehabilitació no farmacològica per diagnosticar, prevenir i tractar símptomes de múltiples dolències, tant agudes com cròniques, per mitjà d'agents físics com l'electricitat, ultrasons, làser, calor, fred, aigua, tècniques manuals com estiraments, traccions, massatges, etc.
        </p>
         <p>
            He estat informat/da de manera clara i comprensible sobre la meva condició, el pla de tractament proposat, els objectius, els beneficis esperats i els possibles riscos o efectes secundaris associats a les tècniques que se m'aplicaran. Aquests poden incloure, entre d'altres, dolor muscular post-tractament, hematomes o irritació cutània.
        </p>
        <p>
            Confirmo que he tingut l'oportunitat de fer preguntes i que totes han estat respostes a la meva satisfacció. Entenc que tinc dret a rebutjar o interrompre el tractament en qualsevol moment.
        </p>
        <p>
            Declaro que he proporcionat informació completa i veraç sobre el meu historial mèdic, incloent-hi al·lèrgies, malalties, medicaments i qualsevol altra condició rellevant per a la meva salut. Em comprometo a informar el fisioterapeuta de qualsevol canvi en el meu estat de salut durant el tractament.
        </p>
      </>
    )
  }
];

type ClientConsentViewerProps = {
  isOpen: boolean;
  client: Client;
  onClose: () => void;
  onSave: (consents: { dataProtection?: Consent, treatment?: Consent }) => void;
};

export function ClientConsentViewer({ isOpen, client, onClose, onSave }: ClientConsentViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [signerName, setSignerName] = useState(client.name);
  const [error, setError] = useState('');
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      setSignerName(client.name);
      setError('');
    }
  }, [isOpen, client.name]);


  const isSigned = (key: 'dataProtection' | 'treatment') => !!client.consents?.[key]?.signature;

  const handleNext = () => setCurrentPage(p => Math.min(p + 1, consentDocuments.length - 1));
  const handlePrev = () => setCurrentPage(p => Math.max(p - 1, 0));

  const handleSaveSignature = () => {
    const currentKey = currentDocument.key as 'dataProtection' | 'treatment';

    if (isSigned(currentKey)) return;

    if (!signerName) {
      setError("El nom és obligatori per a una nova signatura.");
      return;
    }
    if (sigCanvas.current?.isEmpty()) {
       setError("La signatura és obligatòria per desar.");
       return;
    }

    setError('');
    const newSignature = sigCanvas.current?.toDataURL('image/png') ?? '';
    const consentDate = new Date().toISOString();
    
    const updatedConsents = {
      ...client.consents,
      [currentKey]: { signature: newSignature, consentDate }
    };

    onSave(updatedConsents);
    
    // Check if there's a next unsigned document
    const nextPageIndex = consentDocuments.findIndex((doc, index) => index > currentPage && !isSigned(doc.key as any));

    if (nextPageIndex !== -1) {
      setCurrentPage(nextPageIndex);
      sigCanvas.current?.clear();
    } else {
      onClose();
    }
  };

  const clearSignature = () => sigCanvas.current?.clear();

  const currentDocument = consentDocuments[currentPage];
  const isCurrentDocSigned = isSigned(currentDocument.key as any);
  const isLastPage = currentPage === consentDocuments.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{currentDocument.title} ({currentPage + 1}/{consentDocuments.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 my-4 pr-6">
          <div className="space-y-4 text-sm">
             {currentDocument.content()}
             <div className="pt-6 space-y-2">
                <div className="flex flex-wrap items-end gap-2">
                    <span>Jo,</span>
                    <Input 
                        id="signerName" 
                        value={signerName} 
                        onChange={(e) => setSignerName(e.target.value)}
                        className="inline-block w-auto flex-1 min-w-[200px]"
                        placeholder="Nom i cognoms"
                        readOnly={isCurrentDocSigned}
                    />
                    <span>,</span>
                </div>
                <p>
                    {isCurrentDocSigned ? 
                        `he llegit i he consentit el tractament de les meves dades el ${format(new Date(client.consents?.[currentDocument.key as 'dataProtection' | 'treatment']?.consentDate ?? ''), "d 'de' MMMM 'de' yyyy", { locale: ca })}.`
                        : `he llegit i consenteixo expressament el tractament de les meves dades per FISIOGES SL en els termes descrits en aquest document.`
                    }
                </p>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <Label htmlFor="signature">Signatura:</Label>
          <div className="border rounded-md bg-white">
            {isCurrentDocSigned ? (
                <div className="p-2 flex justify-center items-center h-[150px]">
                    <Image src={client.consents?.[currentDocument.key as 'dataProtection' | 'treatment']?.signature ?? ''} alt="Signatura" width={300} height={150} objectFit="contain" />
                </div>
            ) : (
                <SignatureCanvas 
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{ id: "signature", className: 'w-full h-[150px]' }} 
                />
            )}
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter className="pt-4 justify-between">
            <div>
              {!isCurrentDocSigned && <Button variant="outline" onClick={clearSignature}>Esborrar Signatura</Button> }
            </div>
            <div className='flex gap-2'>
                {currentPage > 0 && <Button variant="outline" onClick={handlePrev}>Anterior</Button>}
                {!isLastPage && <Button variant="outline" onClick={handleNext}>Següent</Button>}
                <Button variant="secondary" onClick={onClose}>Tancar</Button>
                {!isCurrentDocSigned && <Button onClick={handleSaveSignature}>Desar Signatura</Button>}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    