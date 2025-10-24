'use client';

import { useState } from 'react';

interface TallyPreviewProps {
  formId: string;
  title: string;
  height?: number;
}

export function TallyPreview({ formId, title, height = 500 }: TallyPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const embedUrl = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  
  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Aperçu du formulaire</p>
            <p className="text-xs text-gray-600">{title}</p>
          </div>
        </div>
      </div>
      
      <div className="relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Chargement du formulaire...</p>
            </div>
          </div>
        )}
        
        <iframe 
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title={`Aperçu: ${title}`}
          onLoad={() => setIsLoading(false)}
          className="w-full"
          style={{ minHeight: `${height}px` }}
        />
      </div>
      
      <div className="p-3 bg-gray-50 border-t">
        <p className="text-xs text-gray-500 text-center">
          💡 Vous pouvez tester le formulaire ci-dessus avant de le valider
        </p>
      </div>
    </div>
  );
}
